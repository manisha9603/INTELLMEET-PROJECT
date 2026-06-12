import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, AlertTriangle } from 'lucide-react';
import Sidebar from '../../components/meet/Sidebar';
import VideoGrid from '../../components/meet/VideoGrid';
import HostWaitingRoom from '../../components/meet/HostWaitingRoom';
import AIPanel from '../../components/meet/AIPanel';
import Controls from '../../components/meet/Controls';
import PostMeetingModal from '../../components/meet/PostMeetingModal';
import { useMeetingStore } from '../../store/useMeetingStore';

export function LiveRoom() {
  const [showPostMeeting, setShowPostMeeting] = useState(false);
  const { 
    participants,
    addTranscriptLine, 
    updateSummary, 
    addActionItem, 
    setSentiment, 
    addTimelineEvent,
    connectionStatus,
    aiStatus
  } = useMeetingStore();

  const isHostOnly = participants.length === 1;

  useEffect(() => {
    // Mock the AI Intelligence Pipeline running over time
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    timeouts.push(setTimeout(() => {
      addTranscriptLine('1', 'Welcome everyone to the Project Nexus planning meeting.');
      setSentiment('positive');
    }, 2000));

    timeouts.push(setTimeout(() => {
      addTranscriptLine('2', 'Thanks Sarah. Have we finalized the auth scaling timeline?');
      setSentiment('neutral');
    }, 6000));

    timeouts.push(setTimeout(() => {
      addTranscriptLine('1', 'Yes, it needs to happen in Q3 to support the global rollout.');
      updateSummary('Project Nexus deployment moved to Q3 to accommodate global scaling architecture. High-performance auth nodes prioritization established.');
      addTimelineEvent('Auth Scaling decided for Q3', 'decision');
    }, 11000));

    timeouts.push(setTimeout(() => {
      addTranscriptLine('4', 'I will draft the migration epic by tomorrow.');
      addActionItem('Draft Migration Epic', 'AT');
      setSentiment('positive');
      addTimelineEvent('Action Assigned to Alex', 'task');
    }, 16000));

    return () => timeouts.forEach(clearTimeout);
  }, [addTranscriptLine, updateSummary, addActionItem, setSentiment, addTimelineEvent]);

  return (
    <div className="flex w-full h-screen bg-[#F8F8FC] overflow-hidden relative font-sans text-zinc-950 transition-colors">
      <Sidebar />
      <main className="flex-1 relative flex flex-col min-w-0 transition-all duration-300 z-10">
        
        {/* Error State Fallbacks */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2">
            <AnimatePresence>
                {connectionStatus !== 'connected' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 text-sm font-medium"
                    >
                        <WifiOff size={16} />
                        <span>Reconnecting to meeting Server...</span>
                    </motion.div>
                )}
                {aiStatus !== 'online' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 text-sm font-medium"
                    >
                        <AlertTriangle size={16} />
                        <span>AI intelligence degraded. Transcripts disabled.</span>
                        <button className="ml-2 underline text-amber-100 hover:text-white transition-colors">Retry</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
            {isHostOnly ? (
                <HostWaitingRoom key="waiting-room" />
            ) : (
                <motion.div 
                    key="video-grid" 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.98 }} 
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-1 relative flex flex-col min-w-0"
                >
                    <VideoGrid />
                </motion.div>
            )}
        </AnimatePresence>

        <Controls onExit={() => setShowPostMeeting(true)} />
      </main>
      <AIPanel />
      <PostMeetingModal isOpen={showPostMeeting} onClose={() => window.location.href = '/'} />
    </div>
  );
}
