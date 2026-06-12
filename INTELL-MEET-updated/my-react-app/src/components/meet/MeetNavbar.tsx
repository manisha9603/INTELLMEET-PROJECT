import React, { useState, useEffect } from 'react';
import { Copy, UserPlus, X, Check, Link } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_ID = 'ALPHA-V8-77B';
const MEET_LINK = `${window.location.origin}/meet/${SESSION_ID}`;

const MeetNavbar: React.FC = () => {
  const meetingStartTime = useMeetingStore(s => s.meetingStartTime);
  const meetingTitle = useMeetingStore(s => s.meetingTitle);
  const participants = useMeetingStore(s => s.participants);
  const [elapsed, setElapsed] = useState('00:00:00');
  const [copied, setCopied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = Math.floor((Date.now() - meetingStartTime) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [meetingStartTime]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(SESSION_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(MEET_LINK).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return (
    <>
      <nav className="h-14 bg-white/95 backdrop-blur-xl border-b border-zinc-200 flex items-center justify-between px-5 z-[1001] flex-shrink-0">
        {/* Left */}
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center space-x-2.5 cursor-pointer group"
            onClick={() => window.open('/', '_blank')}
          >
            <div className="w-[30px] h-[30px] rounded-lg bg-[#5850EC] flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[18px] h-[18px]">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          <button
            onClick={handleCopyId}
            className="flex items-center space-x-2.5 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl group cursor-pointer hover:border-[#5850EC]/30 hover:bg-white hover:shadow-sm transition-all duration-300"
          >
            <span className="font-bold text-[12px] text-zinc-600 group-hover:text-zinc-900 tracking-tight uppercase">
              {SESSION_ID}
            </span>
            {copied ? (
              <Check size={13} className="text-emerald-500 animate-in zoom-in" />
            ) : (
              <Copy size={13} className="text-zinc-400 group-hover:text-[#5850EC] transition-transform group-hover:scale-110" />
            )}
          </button>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center">
          <span className="text-[12px] font-display font-semibold text-zinc-700 mb-0.5">{meetingTitle}</span>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5850EC] animate-pulse" />
            <span className="font-body text-[16px] font-semibold text-[#5850EC] tabular-nums tracking-tight">
              {elapsed}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-3">
          {/* Participant Count */}
          <div className="flex items-center space-x-1.5 text-zinc-400">
            <div className="flex -space-x-1.5">
              {participants.slice(0, 3).map(p => (
                <div key={p.id} className="w-6 h-6 rounded-md bg-[#5850EC]/10 border border-white text-[8px] font-semibold text-[#5850EC] flex items-center justify-center">
                  {p.avatar || p.name.charAt(0)}
                </div>
              ))}
            </div>
            {participants.length > 3 && (
              <span className="text-[10px] font-medium text-zinc-500">+{participants.length - 3}</span>
            )}
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#5850EC] text-white rounded-lg text-[12px] font-semibold hover:bg-[#4843C8] transition-all active:scale-95 shadow-md shadow-[#5850EC]/15"
          >
            <UserPlus size={13} />
            <span className="hidden md:inline">Invite</span>
          </button>
        </div>
      </nav>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[2000]"
              onClick={() => setShowInviteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-[2001] p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-zinc-900">Invite to Meeting</h3>
                <button onClick={() => setShowInviteModal(false)} className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <p className="text-[11px] text-zinc-500 mb-2 font-medium">Shareable Link</p>
              <div className="flex items-center space-x-2 mb-5">
                <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 font-mono text-[11px] text-zinc-600 truncate">
                  {MEET_LINK}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="w-9 h-9 rounded-lg bg-[#5850EC] flex items-center justify-center text-white hover:bg-[#4843C8] transition-all active:scale-95 flex-shrink-0"
                >
                  {linkCopied ? <Check size={14} /> : <Link size={14} />}
                </button>
              </div>

              <div className="flex flex-col items-center p-5 bg-zinc-50 border border-zinc-200 rounded-xl">
                <div className="w-28 h-28 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-2 shadow-sm">
                  <div className="grid grid-cols-5 gap-0.5 p-2">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-sm ${Math.random() > 0.4 ? 'bg-zinc-900' : 'bg-white'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">Scan to join</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-zinc-500 font-medium">Session: <span className="font-mono font-semibold text-zinc-700">{SESSION_ID}</span></span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MeetNavbar;
