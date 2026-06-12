import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, MicOff,
  Video, VideoOff,
  MonitorUp, MonitorOff,
  CircleDot,
  Smile,
  MoreVertical,
  LogOut,
  Brain,
  Hand,
  LayoutGrid,
  PanelLeft,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useMeetingStore, type LayoutMode } from '../../store/useMeetingStore';
import { socketService } from '../../services/websocket.service';

const EMOJI_LIST = ['👍', '🔥', '❤️', '😂', '😮', '🙏', '👏', '✅', '🚀', '💡', '❓', '👋'];
const LAYOUT_MODES: LayoutMode[] = ['gallery', 'speaker', 'spotlight', 'sidebar'];
const LAYOUT_LABELS: Record<LayoutMode, string> = {
  gallery: 'Gallery',
  speaker: 'Speaker',
  spotlight: 'Spotlight',
  sidebar: 'Sidebar',
};

const Controls: React.FC<{ onExit?: () => void }> = ({ onExit }) => {
  const {
    micOn, toggleMic,
    camOn, toggleCam,
    isRecording, toggleRecording,
    isAIPanelOpen, toggleAIPanel,
    isSidebarOpen, toggleSidebar,
    isScreenSharing, setScreenShareStream,
    layout, setLayout,
    raiseHand, lowerHand,
    handRaiseQueue,
    participants,
    mediaPermission,
  } = useMeetingStore();

  const { id: roomId } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const me = participants.find(p => p.id === 'host-local');
  const isRaisingHand = me ? handRaiseQueue.includes(me.id) : false;

  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string }[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  const emojiRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setShowEmojiPicker(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMoreMenu(false);
      if (layoutRef.current && !layoutRef.current.contains(e.target as Node)) setShowLayoutMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fireEmoji = (emoji: string) => {
    const id = Date.now();
    setFloatingEmojis(prev => [...prev, { id, emoji }]);
    setShowEmojiPicker(false);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 4000);
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      setScreenShareStream(null);
      socketService.stopScreenShare(roomId!, user._id, user.name);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setScreenShareStream(stream);
      socketService.startScreenShare(roomId!, user._id, user.name);
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setScreenShareStream(null);
        socketService.stopScreenShare(roomId!, user._id, user.name);
      });
    } catch { /* cancelled */ }
  };

  const handleRaiseHand = () => {
    if (!me) return;
    isRaisingHand ? lowerHand(me.id) : raiseHand(me.id);
  };

  const controlBtn = (active: boolean, danger = false) => clsx(
    'w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95',
    active && !danger && 'bg-[#5850EC] text-white shadow-md shadow-[#5850EC]/20',
    active && danger && 'bg-red-500 text-white shadow-md shadow-red-500/20',
    !active && 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900'
  );

  return (
    <div className="relative z-[1002] flex justify-center pb-4 pt-2 pointer-events-none">
      <div className="absolute inset-x-0 bottom-full pointer-events-none h-[400px]">
        <AnimatePresence>
          {floatingEmojis.map(e => (
            <motion.span
              key={e.id}
              initial={{ y: 0, opacity: 0, scale: 0.5, x: (Math.random() - 0.5) * 100 }}
              animate={{ y: -300, opacity: [0, 1, 1, 0], scale: [0.5, 1.5, 1.5, 0.5] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: 'easeOut' }}
              className="absolute left-1/2 -translate-x-1/2 text-4xl"
            >
              {e.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative rounded-2xl bg-white/95 border border-zinc-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl px-3 py-2 flex items-center gap-2 pointer-events-auto">

        <button onClick={toggleSidebar} className={controlBtn(isSidebarOpen)} title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}>
          <PanelLeft size={18} />
        </button>

        <div className="w-px h-7 bg-zinc-200" />

        {/* Mic — Socket connected */}
        <button
          onClick={() => { toggleMic(); socketService.toggleAudio(roomId!, user._id, !micOn); }}
          className={clsx(controlBtn(!micOn, true), mediaPermission !== 'granted' && 'opacity-50 cursor-not-allowed')}
          title={micOn ? 'Mute' : 'Unmute'}
          disabled={mediaPermission !== 'granted'}
        >
          {micOn ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        {/* Camera — Socket connected */}
        <button
          onClick={() => { toggleCam(); socketService.toggleVideo(roomId!, user._id, !camOn); }}
          className={clsx(controlBtn(!camOn, true), mediaPermission !== 'granted' && 'opacity-50 cursor-not-allowed')}
          title={camOn ? 'Stop Video' : 'Start Video'}
          disabled={mediaPermission !== 'granted'}
        >
          {camOn ? <Video size={18} /> : <VideoOff size={18} />}
        </button>

        <div className="w-px h-7 bg-zinc-200" />

        {/* Screen Share — Socket connected */}
        <button onClick={handleScreenShare} className={controlBtn(isScreenSharing)} title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>
          {isScreenSharing ? <MonitorOff size={18} /> : <MonitorUp size={18} />}
        </button>

        <button onClick={toggleRecording} className={clsx(controlBtn(isRecording, true), isRecording && 'animate-pulse')} title={isRecording ? 'Stop Recording' : 'Record'}>
          <CircleDot size={18} />
        </button>

        <button onClick={toggleAIPanel} className={controlBtn(isAIPanelOpen)} title="AI Copilot">
          <Brain size={18} />
        </button>

        <button
          onClick={handleRaiseHand}
          className={clsx(
            'w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95',
            isRaisingHand ? 'bg-amber-400 text-white shadow-md shadow-amber-400/30' : 'bg-zinc-100 hover:bg-amber-50 text-zinc-700 hover:text-amber-500'
          )}
          title={isRaisingHand ? 'Lower Hand' : 'Raise Hand'}
        >
          <Hand size={18} />
        </button>

        <div ref={layoutRef} className="relative">
          <button onClick={() => setShowLayoutMenu(v => !v)} className={clsx(controlBtn(showLayoutMenu), 'relative')} title={`Layout: ${layout}`}>
            <LayoutGrid size={18} />
          </button>
          <AnimatePresence>
            {showLayoutMenu && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white border border-zinc-200 rounded-xl shadow-xl p-1.5 z-50 min-w-[140px]">
                {LAYOUT_MODES.map(mode => (
                  <button key={mode} onClick={() => { setLayout(mode); setShowLayoutMenu(false); }} className={clsx('w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors', layout === mode ? 'bg-[#5850EC]/10 text-[#5850EC]' : 'text-zinc-600 hover:bg-zinc-50')}>
                    {LAYOUT_LABELS[mode]}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={emojiRef} className="relative">
          <button onClick={() => setShowEmojiPicker(v => !v)} className={controlBtn(showEmojiPicker)} title="React">
            <Smile size={18} />
          </button>
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white border border-zinc-200 rounded-2xl shadow-xl p-2 z-50 w-max">
                <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(4, 40px)', gridAutoRows: '40px' }}>
                  {EMOJI_LIST.map(emoji => (
                    <button key={emoji} onClick={() => fireEmoji(emoji)} className="rounded-lg hover:bg-zinc-100 flex items-center justify-center text-xl transition-all active:scale-90 hover:scale-110">
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={moreRef} className="relative">
          <button onClick={() => setShowMoreMenu(v => !v)} className={controlBtn(showMoreMenu)} title="More options">
            <MoreVertical size={18} />
          </button>
          <AnimatePresence>
            {showMoreMenu && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute bottom-full mb-3 right-0 bg-white border border-zinc-200 rounded-xl shadow-xl p-1.5 z-50 min-w-[180px]">
                {['Virtual Background', 'Noise Suppression', 'Bandwidth Mode', 'Keyboard Shortcuts', 'Report Issue'].map(item => (
                  <button key={item} onClick={() => setShowMoreMenu(false)} className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 hover:text-[#5850EC] transition-colors">
                    {item}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-7 bg-zinc-200" />

        <button
          className="h-11 px-5 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center space-x-2 transition-colors active:scale-95 shadow-md shadow-red-500/15"
          onClick={() => onExit ? onExit() : (window.location.href = '/')}
        >
          <LogOut size={16} />
          <span className="text-[13px] font-semibold hidden md:inline">Leave</span>
        </button>
      </div>

      {isRecording && (
        <div className="absolute top-[-44px] left-1/2 -translate-x-1/2 px-4 py-2 bg-white/95 backdrop-blur-md border border-red-200 rounded-xl flex items-center space-x-2 shadow-lg pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[12px] font-semibold text-red-600">Recording</span>
        </div>
      )}

      {isScreenSharing && (
        <div className="absolute top-[-44px] right-4 px-4 py-2 bg-white/95 backdrop-blur-md border border-[#5850EC]/20 rounded-xl flex items-center space-x-2 shadow-lg pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-[#5850EC] animate-pulse" />
          <span className="text-[12px] font-semibold text-[#5850EC]">Sharing Screen</span>
        </div>
      )}
    </div>
  );
};

export default Controls;