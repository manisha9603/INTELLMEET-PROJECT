import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import MeetNavbar from '../components/meet/MeetNavbar';
import VideoGrid from '../components/meet/VideoGrid';
import Sidebar from '../components/meet/Sidebar';
import AIPanel from '../components/meet/AIPanel';
import Controls from '../components/meet/Controls';
import { useMeetingStore } from '../store/useMeetingStore';
import { socketService } from '../services/websocket.service';
import { useWebRTC } from '../hooks/useWebRTC';
import { useWhisper } from '../hooks/useWhisper';

const MeetRoom: React.FC = () => {
  const { requestMediaDevices, stopLocalStream, isSidebarOpen, sidebarWidth, localStream } = useMeetingStore();
  const { id: roomId } = useParams();

  const { getRemoteStream } = useWebRTC(roomId || '');
  const { startTranscription, stopTranscription } = useWhisper();

  useEffect(() => {
    requestMediaDevices();

    // ✅ Connect sirf ek baar karo
    if (!socketService.getSocket()?.connected) {
      socketService.connect();
    }

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (roomId && user) {
      socketService.joinRoom(roomId, user._id, user.name);
      console.log(`✅ Joined room: ${roomId} as ${user.name}`);
    }

    socketService.onUserJoined((data) => {
      console.log('👤 User joined:', data.userName);
    });

    socketService.onUserLeft((data) => {
      console.log('👋 User left:', data.userId);
    });

    // ✅ Disconnect mat karo — stable connection!
    return () => {
      stopLocalStream();
    };
  }, [roomId]);

 useEffect(() => {
  if (localStream) {
    // ✅ 1 sec delay — stream settle hone do
    const timer = setTimeout(() => {
      startTranscription(localStream);
      console.log('🎙️ Whisper transcription started!');
    }, 1000);

    return () => {
      clearTimeout(timer);
      stopTranscription();
    };
  }
}, [localStream]);

  return (
    <div className="h-screen bg-[#F5F5F7] text-zinc-950 flex flex-col overflow-hidden font-body">
      <MeetNavbar />

      <div className="flex-1 flex overflow-hidden relative items-stretch">
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: sidebarWidth, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex-shrink-0 overflow-hidden hidden md:block h-full self-stretch"
              style={{ width: sidebarWidth }}
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 min-w-0 flex flex-col relative">
          <div className="flex-1 relative overflow-hidden">
            <VideoGrid getRemoteStream={getRemoteStream} />
          </div>
          <Controls />
        </div>

        <AIPanel />
      </div>
    </div>
  );
};

export default MeetRoom;