import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, UserPlus, ShieldCheck } from 'lucide-react';
import { useMeetingStore } from '../../store/useMeetingStore';

const HostWaitingRoom: React.FC = () => {
    const { participants } = useMeetingStore();
    const host = participants[0]; // Assuming host is first, or find by role === 'host'
    const [copied, setCopied] = useState(false);
    
    // Simple Timer
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setElapsed(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const copyInvite = () => {
        navigator.clipboard.writeText('https://intellmeet.io/room/123');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex items-center justify-center p-6 h-full"
        >
            <div className="w-[800px] max-w-full rounded-[28px] bg-[#FFFFFF] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#E4E4E7] p-8 flex flex-col items-center relative overflow-hidden">
                {/* Blur backdrop hints */}
                <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-[#5850EC]/5 rounded-full blur-[80px] pointer-events-none" />

                {/* Header info */}
                <div className="text-center mb-8 relative z-10">
                    <h2 className="text-2xl font-black text-[#111111] mb-2">Workspace Ready</h2>
                    <p className="text-sm font-medium text-[#6B6B78] flex items-center justify-center">
                        Meeting code: <span className="text-[#5850EC] font-mono ml-2 tracking-widest bg-[#F8F8FC] px-2 py-1 border border-[#E4E4E7] rounded cursor-text select-all">X9A-4B2-L8P</span>
                    </p>
                </div>

                {/* Large Host Tile */}
                <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden bg-[#111111] shadow-[0_20px_40px_rgba(0,0,0,0.12)] mb-8 group z-10 ring-1 ring-[#000000]/5">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-transparent to-transparent z-10" />
                    
                    {/* Placeholder Video pattern */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <div className="w-32 h-32 rounded-full border-2 border-[#FFFFFF]/20" />
                    </div>

                    <div className="absolute bottom-6 left-6 z-20 flex items-center space-x-3">
                        <div className="bg-[#FFFFFF]/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm flex items-center space-x-2 border border-[#FFFFFF]/40">
                            <span className="text-xs font-black uppercase tracking-widest text-[#111111]">
                                {host?.name || 'You'} (Host)
                            </span>
                            <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                        </div>
                        <div className="bg-[#5850EC] px-3 py-2 rounded-xl flex items-center shadow-[0_4px_15px_rgba(88,80,236,0.3)]">
                            <ShieldCheck size={16} className="text-white mr-1.5" />
                            <span className="text-xs font-black uppercase tracking-widest text-white">Host</span>
                        </div>
                    </div>
                    
                    <div className="absolute top-6 left-6 z-20">
                         <div className="bg-[#111111]/50 backdrop-blur-md border border-[#FFFFFF]/10 px-3 py-1.5 rounded-lg flex items-center space-x-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#EF4444]" />
                              <span className="text-white font-mono text-xs">{formatTime(elapsed)}</span>
                         </div>
                    </div>
                </div>

                {/* Waiting State Actions */}
                <div className="text-center w-full max-w-xl relative z-10">
                    <p className="text-[#6B6B78] mb-6 text-sm font-medium">Waiting for other participants to join the secure channel...</p>
                    <div className="flex items-center justify-center space-x-4">
                        <button 
                            onClick={copyInvite}
                            className="bg-[#F8F8FC] border border-[#E4E4E7] text-[#111111] hover:text-[#5850EC] hover:border-[#5850EC] hover:bg-[#FFFFFF] flex items-center space-x-2 px-6 py-3.5 rounded-xl transition-all shadow-sm active:scale-95"
                        >
                            <Copy size={16} />
                            <span className="btn-typography">{copied ? 'Copied Link' : 'Copy Invite Link'}</span>
                        </button>
                        <button className="bg-[#111111] hover:bg-[#333333] text-white flex items-center space-x-2 px-6 py-3.5 rounded-xl transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] active:scale-95 hover:-translate-y-0.5 border border-transparent hover:border-[#444444]">
                            <UserPlus size={16} />
                            <span className="btn-typography">Add Participants</span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HostWaitingRoom;
