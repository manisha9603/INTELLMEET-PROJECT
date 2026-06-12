import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Keyboard, ArrowRight } from 'lucide-react';

const Access: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      // Pass the intent to login page (we can just navigate for now)
      navigate('/login');
    }
  };

  const handleHost = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-3xl p-10 z-10 shadow-2xl"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-6 shadow-sm">
            <Video size={32} />
          </div>
          <h1 className="text-4xl font-black text-zinc-950 mb-4 tracking-tight">Access Space</h1>
          <p className="text-xl text-zinc-500">Join an existing session or start a new one.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Join Meeting */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 hover:border-zinc-300 transition-colors shadow-sm">
            <div className="flex items-center space-x-3 text-zinc-900 mb-6">
              <Keyboard className="text-accent" />
              <h2 className="text-xl font-bold">Join Meeting</h2>
            </div>
            <form onSubmit={handleJoin} className="space-y-4">
              <input 
                type="text" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 focus:outline-none focus:border-accent shadow-sm" 
                placeholder="Enter room code" 
              />
              <button 
                type="submit"
                disabled={!roomCode.trim()}
                className="w-full bg-accent text-white font-bold rounded-xl px-4 py-3 hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center space-x-2 shadow-md shadow-accent/20"
              >
                <span>Join Now</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Host Meeting */}
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center space-x-3 text-zinc-900 mb-4">
                <Video className="text-accent" />
                <h2 className="text-xl font-bold">New Meeting</h2>
              </div>
              <p className="text-zinc-600 mb-6 font-medium">Create a secure, end-to-end encrypted meeting space instantly.</p>
            </div>
            <button 
              onClick={handleHost}
              className="w-full bg-accent text-white font-bold rounded-xl px-4 py-3 hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>Start Meeting</span>
            </button>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium"
          >
            Return to Landing Page
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Access;
