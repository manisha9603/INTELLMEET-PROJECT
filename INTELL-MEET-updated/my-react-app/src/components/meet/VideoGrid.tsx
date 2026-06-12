import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MicOff, VideoOff, Mic, Pin, PinOff, MonitorUp, Crown, Hand } from 'lucide-react';
import { clsx } from 'clsx';
import { useMeetingStore } from '../../store/useMeetingStore';

type Participant = ReturnType<typeof useMeetingStore.getState>['participants'][number];

// ─── VideoTile ────────────────────────────────────────────────────────────────
const VideoTile = React.memo<{
  participant: Participant;
  isActiveSpeaker: boolean;
  isPinned: boolean;
  isLocal: boolean;
  onPin: () => void;
  stream?: MediaStream | null;
  large?: boolean;
}>(({ participant, isActiveSpeaker, isPinned, isLocal, onPin, stream, large }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handRaiseQueue = useMeetingStore(s => s.handRaiseQueue);
  const isHandRaised = handRaiseQueue.includes(participant.id);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={clsx(
        'video-tile relative rounded-2xl bg-white border transition-all duration-300 overflow-hidden group h-full w-full',
        isActiveSpeaker || participant.isSpeaking
          ? 'border-[#5850EC] ring-2 ring-[#5850EC]/30 shadow-[0_8px_30px_rgba(88,80,236,0.15)] scale-[1.01] z-10'
          : 'border-zinc-200/80 shadow-sm hover:shadow-md',
        isPinned && 'ring-2 ring-amber-400/40 border-amber-400/50'
      )}
    >
      {participant.isVideoOn && stream ? (
        <div className="absolute inset-0 bg-zinc-900 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted={isLocal}
            playsInline
            className={clsx('w-full h-full object-cover', isLocal && 'scale-x-[-1]')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
      ) : participant.isVideoOn && !stream ? (
        <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent z-10" />
          <div className="w-20 h-20 rounded-full border-2 border-white/10 opacity-20 animate-pulse" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <div className={clsx(
            'rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center font-semibold text-[#5850EC]',
            large ? 'w-28 h-28 text-4xl' : 'w-20 h-20 text-2xl'
          )}>
            {participant.avatar || participant.name.charAt(0)}
          </div>
        </div>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onPin(); }}
        className="absolute top-3 left-3 z-30 w-7 h-7 rounded-lg bg-black/30 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-black/50"
        title={isPinned ? 'Unpin' : 'Pin'}
      >
        {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
      </button>

      <div className="absolute bottom-3 left-3 flex items-center space-x-2 z-20">
        <div className={clsx(
          'px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-sm flex items-center space-x-1.5',
          participant.isVideoOn && stream ? 'bg-black/40 border-white/10' : 'bg-white/90 border-zinc-200'
        )}>
          {participant.role === 'host' && (
            <Crown size={10} className={participant.isVideoOn && stream ? 'text-amber-400' : 'text-amber-500'} />
          )}
          <span className={clsx(
            'text-[11px] font-semibold',
            participant.isVideoOn && stream ? 'text-white' : 'text-zinc-800'
          )}>
            {isLocal ? `${participant.name} (You)` : participant.name}
          </span>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex space-x-1.5 z-20">
        {isHandRaised && (
          <div className="w-7 h-7 rounded-lg bg-amber-400/90 backdrop-blur-md flex items-center justify-center text-white shadow-lg shadow-amber-400/30 animate-bounce">
            <Hand size={13} />
          </div>
        )}
        {participant.isMuted ? (
          <div className="w-7 h-7 rounded-lg bg-red-500/90 backdrop-blur-md flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <MicOff size={13} />
          </div>
        ) : (
          <div className={clsx(
            'w-7 h-7 rounded-lg backdrop-blur-md flex items-center justify-center',
            participant.isVideoOn && stream ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
          )}>
            <Mic size={13} />
          </div>
        )}
        {!participant.isVideoOn && (
          <div className="w-7 h-7 rounded-lg bg-red-500/90 backdrop-blur-md flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <VideoOff size={13} />
          </div>
        )}
      </div>

      {(isActiveSpeaker || participant.isSpeaking) && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-20">
          <div className="absolute inset-0 rounded-2xl border-2 border-[#5850EC] animate-pulse" />
        </div>
      )}
    </div>
  );
});

// ─── Grid computation ─────────────────────────────────────────────────────────
function getGridLayout(count: number): string {
  if (count === 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-2';
  if (count <= 4) return 'grid-cols-2 grid-rows-2';
  if (count <= 6) return 'grid-cols-3 grid-rows-2';
  return 'grid-cols-3';
}

// ─── ✅ CHANGE 1: Props interface add kiya ────────────────────────────────────
interface VideoGridProps {
  getRemoteStream?: (socketId: string) => MediaStream | null;
}

// ─── ✅ CHANGE 2: Props accept karo ──────────────────────────────────────────
const VideoGrid: React.FC<VideoGridProps> = ({ getRemoteStream }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const participants = useMeetingStore(s => s.participants);
  const activeSpeakerId = useMeetingStore(s => s.activeSpeakerId);
  const layout = useMeetingStore(s => s.layout);
  const pinnedParticipantId = useMeetingStore(s => s.pinnedParticipantId);
  const pinParticipant = useMeetingStore(s => s.pinParticipant);
  const isScreenSharing = useMeetingStore(s => s.isScreenSharing);
  const screenShareStream = useMeetingStore(s => s.screenShareStream);
  const localStream = useMeetingStore(s => s.localStream);
  const mediaPermission = useMeetingStore(s => s.mediaPermission);

  useGSAP(() => {
    gsap.from('.video-tile', {
      scale: 0.92,
      opacity: 0,
      stagger: 0.06,
      duration: 0.5,
      ease: 'power3.out',
    });
  }, { scope: containerRef, dependencies: [participants.length] });

  const handlePin = (id: string) => {
    pinParticipant(pinnedParticipantId === id ? null : id);
  };

  // ─── ✅ CHANGE 3: Remote stream bhi fetch ho raha hai ────────────────────
  const getStream = (p: Participant) => {
    if (p.id === 'host-local') return localStream;
    return getRemoteStream?.(p.id) || null; // ✅ WebRTC se remote stream!
  };

  const isHostOnly = participants.length === 1;

  if (layout === 'spotlight' && pinnedParticipantId) {
    const pinned = participants.find(p => p.id === pinnedParticipantId);
    if (pinned) {
      return (
        <div ref={containerRef} className="flex-1 p-4 h-full">
          <VideoTile
            participant={pinned}
            isActiveSpeaker={pinned.id === activeSpeakerId}
            isPinned={true}
            isLocal={pinned.id === 'host-local'}
            onPin={() => handlePin(pinned.id)}
            stream={getStream(pinned)}
            large
          />
        </div>
      );
    }
  }

  if (layout === 'speaker') {
    const speakerId = activeSpeakerId || pinnedParticipantId || participants[0]?.id;
    const speaker = participants.find(p => p.id === speakerId);
    const others = participants.filter(p => p.id !== speakerId);

    return (
      <div ref={containerRef} className="flex-1 flex gap-3 p-4 h-full overflow-hidden">
        {speaker && (
          <div className="flex-[7] h-full min-w-0">
            <VideoTile
              participant={speaker}
              isActiveSpeaker={true}
              isPinned={pinnedParticipantId === speaker.id}
              isLocal={speaker.id === 'host-local'}
              onPin={() => handlePin(speaker.id)}
              stream={isScreenSharing && screenShareStream ? screenShareStream : getStream(speaker)}
              large
            />
          </div>
        )}
        {others.length > 0 && (
          <div className="flex-[3] flex flex-col gap-2 overflow-y-auto custom-scrollbar">
            {others.map(p => (
              <div key={p.id} className="flex-shrink-0 h-36">
                <VideoTile
                  participant={p}
                  isActiveSpeaker={p.id === activeSpeakerId}
                  isPinned={pinnedParticipantId === p.id}
                  isLocal={p.id === 'host-local'}
                  onPin={() => handlePin(p.id)}
                  stream={getStream(p)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (layout === 'sidebar' && pinnedParticipantId) {
    const pinned = participants.find(p => p.id === pinnedParticipantId);
    const others = participants.filter(p => p.id !== pinnedParticipantId);

    return (
      <div ref={containerRef} className="flex-1 flex gap-3 p-4 h-full overflow-hidden">
        {pinned && (
          <div className="flex-[7] h-full min-w-0">
            <VideoTile
              participant={pinned}
              isActiveSpeaker={pinned.id === activeSpeakerId}
              isPinned={true}
              isLocal={pinned.id === 'host-local'}
              onPin={() => handlePin(pinned.id)}
              stream={getStream(pinned)}
              large
            />
          </div>
        )}
        <div className="flex-[3] flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {others.map(p => (
            <div key={p.id} className="flex-shrink-0 h-36">
              <VideoTile
                participant={p}
                isActiveSpeaker={p.id === activeSpeakerId}
                isPinned={false}
                isLocal={p.id === 'host-local'}
                onPin={() => handlePin(p.id)}
                stream={getStream(p)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isScreenSharing && screenShareStream && layout === 'gallery') {
    return (
      <div ref={containerRef} className="flex-1 flex gap-3 p-4 h-full overflow-hidden">
        <div className="flex-[7] h-full bg-zinc-900 rounded-2xl overflow-hidden relative border border-zinc-700">
          <video
            autoPlay playsInline muted
            ref={el => { if (el) el.srcObject = screenShareStream; }}
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-3 left-3 flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg">
            <MonitorUp size={13} className="text-[#5850EC]" />
            <span className="text-[11px] font-semibold text-white">Screen Share</span>
          </div>
        </div>
        <div className="flex-[3] flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {participants.map(p => (
            <div key={p.id} className="flex-shrink-0 h-36">
              <VideoTile
                participant={p}
                isActiveSpeaker={p.id === activeSpeakerId}
                isPinned={pinnedParticipantId === p.id}
                isLocal={p.id === 'host-local'}
                onPin={() => handlePin(p.id)}
                stream={getStream(p)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const count = participants.length;
  const gridClass = getGridLayout(count);

  return (
    <div
      ref={containerRef}
      className={clsx(
        'flex-1 p-4 grid gap-3 h-full overflow-hidden',
        count === 1 ? 'place-items-center' : gridClass,
        count > 6 && 'auto-rows-fr overflow-y-auto custom-scrollbar'
      )}
    >
      {count === 1 ? (
        <div className="w-full max-w-2xl aspect-video relative">
          <VideoTile
            participant={participants[0]}
            isActiveSpeaker={participants[0].id === activeSpeakerId}
            isPinned={pinnedParticipantId === participants[0].id}
            isLocal={participants[0].id === 'host-local'}
            onPin={() => handlePin(participants[0].id)}
            stream={getStream(participants[0])}
            large
          />
          {isHostOnly && mediaPermission === 'granted' && (
            <div className="absolute inset-x-0 bottom-16 flex justify-center z-30 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md border border-zinc-200 rounded-xl px-5 py-3 shadow-lg">
                <p className="text-sm font-medium text-zinc-600">Waiting for participants to join…</p>
              </div>
            </div>
          )}
          {mediaPermission === 'denied' && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-zinc-50/90 rounded-2xl">
              <div className="text-center p-8">
                <VideoOff size={40} className="text-zinc-300 mx-auto mb-4" />
                <p className="text-sm font-semibold text-zinc-700 mb-1">Camera & Mic Access Denied</p>
                <p className="text-xs text-zinc-400">Please allow access in your browser settings and refresh.</p>
              </div>
            </div>
          )}
          {mediaPermission === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-white/80 rounded-2xl">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#5850EC] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-zinc-500 font-medium">Requesting device access…</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        participants.map(p => (
          <div key={p.id} className="min-h-0">
            <VideoTile
              participant={p}
              isActiveSpeaker={p.id === activeSpeakerId}
              isPinned={pinnedParticipantId === p.id}
              isLocal={p.id === 'host-local'}
              onPin={() => handlePin(p.id)}
              stream={getStream(p)}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default VideoGrid;