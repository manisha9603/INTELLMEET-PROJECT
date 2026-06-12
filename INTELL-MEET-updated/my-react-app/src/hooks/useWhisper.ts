import { useRef, useState } from 'react';
import { useMeetingStore } from '../store/useMeetingStore';

export const useWhisper = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const addTranscriptLine = useMeetingStore(s => s.addTranscriptLine);

  // ✅ Silent chunk filter — Whisper hallucination fix
  const hasAudioEnergy = (blob: Blob): Promise<boolean> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => {
        const arr = new Uint8Array(reader.result as ArrayBuffer);
        const avg = arr.reduce((sum, v) => sum + v, 0) / arr.length;
        resolve(avg > 10);
      };
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(blob);
    });
  };

  // Audio chunk backend ko bhejo
  const sendAudioChunk = async (audioBlob: Blob) => {
    try {
      // ✅ Skip karo agar chunk silent hai
      const isLoud = await hasAudioEnergy(audioBlob);
      if (!isLoud) {
        console.log('🔇 Silent chunk skipped');
        return;
      }

      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const res = await fetch('http://localhost:5000/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.text && data.text.trim()) {
        console.log('🎙️ Transcribed:', data.text);
        addTranscriptLine('host-local', data.text);
      }
    } catch (err) {
      console.error('❌ Transcription failed:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Recording start karo
  const startTranscription = (stream: MediaStream) => {

    // ✅ Audio track check karo
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn('⚠️ No audio track found!');
      return;
    }

    // ✅ Sirf audio stream banao — video nahi!
    const audioOnlyStream = new MediaStream(audioTracks);

    // ✅ Supported mimeType detect karo
    const mimeType = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg',
      'audio/mp4',
      '',
    ].find(type => type === '' || MediaRecorder.isTypeSupported(type)) || '';

    console.log('🎙️ Using mimeType:', mimeType || 'default');

    let mediaRecorder: MediaRecorder;

    // ✅ try-catch — crash nahi hoga
    try {
      mediaRecorder = mimeType
        ? new MediaRecorder(audioOnlyStream, { mimeType })
        : new MediaRecorder(audioOnlyStream);
    } catch (err) {
      console.warn('⚠️ MediaRecorder init failed:', err);
      return;
    }

    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    // ✅ Start bhi try-catch mein
    try {
      mediaRecorder.start();
      console.log('🎙️ Transcription started!');
    } catch (err) {
      console.warn('⚠️ MediaRecorder start failed:', err);
      return;
    }

    // Har 5 sec mein audio bhejo Whisper ko
    intervalRef.current = setInterval(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.start();

        const audioBlob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        chunksRef.current = [];

        if (audioBlob.size > 0) {
          sendAudioChunk(audioBlob);
        }
      }
    }, 5000);
  };

  // Recording stop karo
  const stopTranscription = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current?.stop();
    }
    console.log('🛑 Transcription stopped!');
  };

  return { startTranscription, stopTranscription, isTranscribing };
};