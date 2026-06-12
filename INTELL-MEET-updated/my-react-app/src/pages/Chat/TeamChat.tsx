import { useState } from 'react';
import { Plus, Hash, Send, MoreHorizontal } from 'lucide-react';

export function TeamChat() {
  const [activeChannel, setActiveChannel] = useState('General');

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#050B14] rounded-2xl border border-white/5 overflow-hidden">
      {/* Channels Sidebar */}
      <aside className="w-72 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-bold text-lg">Channels</h2>
          <button className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <Plus size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            <button 
                onClick={() => setActiveChannel('General')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeChannel === 'General' ? 'bg-white/10 text-white font-bold' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
            >
                <Hash size={18} />
                <span>General</span>
            </button>
            <button 
                onClick={() => setActiveChannel('Project X')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeChannel === 'Project X' ? 'bg-white/10 text-white font-bold' : 'text-white/40 hover:bg-white/5 hover:text-white/80'}`}
            >
                <Hash size={18} />
                <span>Project X</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white/20">
                <Plus size={18} />
                <span>Create Channel...</span>
            </button>
        </div>

        <div className="p-4 border-t border-white/5">
            <h3 className="px-4 text-xs font-black uppercase tracking-widest text-white/20 mb-4">Direct Messages</h3>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-all">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-black">JD</div>
                <span>Jane Doe</span>
                <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full"></div>
            </button>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col relative">
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="p-2 bg-white/5 rounded-lg text-white/60">
                    <Hash size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">{activeChannel}</h3>
                    <p className="text-white/30 text-xs">General discussion for all team members</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#050B14] flex items-center justify-center text-[10px] font-black">
                            {/* Fallback for UserCircle */}
                            <div className="w-3 h-3 bg-white/40 rounded-full" />
                        </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-[#050B14] flex items-center justify-center text-[10px] font-black text-white">+5</div>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>
        </header>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-12 space-y-8 scroll-smooth">
            <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500 flex flex-shrink-0 items-center justify-center text-black font-black text-sm">JD</div>
                <div className="space-y-1">
                    <div className="flex items-baseline space-x-3">
                        <span className="font-black text-white">Jane Doe</span>
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-black">10:45 AM</span>
                    </div>
                    <div className="relative group">
                        <p className="text-white/70 leading-relaxed max-w-2xl bg-white/5 px-5 py-3 rounded-2xl rounded-tl-none border border-white/5 transition-all group-hover:border-white/10">
                            Hi everyone! Just finished uploading the latest UI specs to the Project X board. Let me know what you think! 🚀
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex flex-shrink-0 items-center justify-center text-black font-black text-sm">ME</div>
                <div className="space-y-1">
                    <div className="flex items-baseline space-x-3">
                        <span className="font-black text-white">You</span>
                        <span className="text-[10px] text-white/20 uppercase tracking-widest font-black">10:48 AM</span>
                    </div>
                    <p className="text-white/70 leading-relaxed max-w-2xl bg-white/10 px-5 py-3 rounded-2xl rounded-tl-none border border-white/10">
                        Looks amazing Jane! Love the new dark navy theme. 👏
                    </p>
                </div>
            </div>
        </div>

        {/* Chat Input */}
        <div className="p-8">
            <div className="relative flex items-center bg-white/5 border border-white/5 rounded-3xl p-2 transition-all focus-within:border-white/20 focus-within:bg-white/10 pr-4">
                <button className="p-3 text-white/20 hover:text-white transition-colors">
                    <Plus size={24} />
                </button>
                <input 
                    type="text" 
                    placeholder={`Message #${activeChannel.toLowerCase()}`}
                    className="flex-1 bg-transparent border-none focus:outline-none px-4 text-white text-lg font-medium py-3 placeholder:text-white/10"
                />
                <button className="bg-white text-black p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5">
                    <Send size={20} />
                </button>
            </div>
        </div>
      </main>
    </div>
  );
}
