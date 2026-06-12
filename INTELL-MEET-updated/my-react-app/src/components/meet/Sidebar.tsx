import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users, MessageSquare, FileText, Folder,
  AlignLeft, Mic, MicOff, Video, VideoOff,
  Send, Download, Bold, Italic, List as ListIcon, Heading,
  Upload, UserX,
  CheckSquare, Clock, Crown,
  Check, Hand,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeetingStore } from '../../store/useMeetingStore';
import { socketService } from '../../services/websocket.service';

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type.includes('word') || type.includes('docx')) return '📝';
  if (type.includes('sheet') || type.includes('xlsx')) return '📊';
  return '📎';
};

const qualityDot = (q: string) =>
  q === 'good' ? 'bg-emerald-500' : q === 'moderate' ? 'bg-amber-400' : 'bg-red-500';

// ─── Chat Tab ─────────────────────────────────────────────────────────────────
const ChatTab: React.FC = () => {
  const { chatMessages, sendMessage, addReaction } = useMeetingStore();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { id: roomId } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

 useEffect(() => {
  const socket = socketService.getSocket();
  if (!socket) return;

  // Pehle purana listener hata do
  socket.off('receive-message');

  // Phir naya add karo
  socket.on('receive-message', (msg) => {
    sendMessage(msg.content, msg.senderId);
  });

  // Cleanup on unmount
  return () => {
    socket.off('receive-message');
  };
}, []);

  const handleSend = () => {
  if (!text.trim()) return;
  // Sirf socket pe bhejo — receive-message event se store update hoga
  socketService.sendMessage(
    roomId!,
    user._id || 'host-local',
    user.name || 'You',
    text.trim()
  );
  setText('');
};

  const REACTION_EMOJIS = ['👍', '❤️', '😂', '🔥', '👏'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pb-2 custom-scrollbar pr-1">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300 mb-3 border border-zinc-100 shadow-sm">
               <MessageSquare size={24} />
            </div>
            <p className="text-[14px] font-medium text-zinc-800">Start the conversation</p>
            <p className="text-[12px] text-zinc-400 mt-1">Messages are end-to-end encrypted</p>
          </div>
        ) : (
          chatMessages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="group">
              <div className="flex items-start space-x-3 px-1">
                <div className="w-9 h-9 rounded-xl bg-[#5850EC]/10 flex items-center justify-center text-[12px] font-bold text-[#5850EC] flex-shrink-0 ring-1 ring-[#5850EC]/20">
                  {msg.senderName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline space-x-2 mb-1">
                    <span className="text-[13px] font-bold text-zinc-900">{msg.senderName}</span>
                    <span className="text-[10px] text-zinc-400 font-mono tracking-tight">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl rounded-tl-none group-hover:bg-white group-hover:border-[#5850EC]/20 group-hover:shadow-sm transition-all duration-300">
                    <p className="text-[14px] text-zinc-700 leading-relaxed break-words">{msg.text}</p>
                  </div>
                  {msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[...new Set(msg.reactions)].map(emoji => (
                        <button key={emoji} onClick={() => addReaction(msg.id, emoji)} className="px-2 py-1 bg-white border border-zinc-100 rounded-lg hover:border-[#5850EC]/30 hover:bg-[#5850EC]/5 transition-all flex items-center space-x-1.5 shadow-sm">
                          <span className="text-sm">{emoji}</span>
                          <span className="text-[11px] font-bold text-[#5850EC]">{msg.reactions.filter(r => r === emoji).length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="hidden group-hover:flex items-center space-x-1.5 mt-2 ml-1">
                    {REACTION_EMOJIS.map(e => (
                      <button key={e} onClick={() => addReaction(msg.id, e)} className="text-[15px] hover:scale-125 transition-transform p-1 rounded-lg hover:bg-zinc-100">{e}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="pt-4 mt-2 border-t border-zinc-100">
        <div className="relative group">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-[14px] text-zinc-800 placeholder:text-zinc-400 focus:bg-white focus:border-[#5850EC] focus:ring-4 focus:ring-[#5850EC]/5 focus:outline-none transition-all resize-none min-h-[50px] max-h-[120px] pr-12 custom-scrollbar shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={clsx(
              "absolute right-2.5 bottom-2.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all",
              text.trim() ? "bg-[#5850EC] text-white shadow-lg shadow-[#5850EC]/20 scale-100" : "bg-zinc-200 text-zinc-400 scale-90 opacity-50"
            )}
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-[10px] text-zinc-400 mt-2 text-center font-medium uppercase tracking-tight">Shift + Enter for new line</p>
      </div>
    </div>
  );
};

// ─── Participants Tab ──────────────────────────────────────────────────────────
const ParticipantsTab: React.FC = () => {
  const { participants, handRaiseQueue, removeParticipant, muteAll } = useMeetingStore();
  const isHost = participants.find(p => p.id === 'host-local')?.role === 'host';

  const items = [...participants].sort((a, b) => {
    const aHand = handRaiseQueue.indexOf(a.id);
    const bHand = handRaiseQueue.indexOf(b.id);
    if (aHand !== -1 && bHand !== -1) return aHand - bHand;
    if (aHand !== -1) return -1;
    if (bHand !== -1) return 1;
    if (a.role === 'host') return -1;
    if (b.role === 'host') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] font-bold text-zinc-900 font-display uppercase tracking-wider">Participants</h3>
        <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded-md text-[11px] font-bold text-zinc-600">{participants.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {items.map(item => (
          <div key={item.id} className="group p-3 bg-white border border-zinc-100 rounded-2xl hover:border-[#5850EC]/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-[14px] font-extrabold text-zinc-700 shadow-sm transition-all group-hover:scale-105 group-hover:bg-white group-hover:border-[#5850EC]/20">
                  {item.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={clsx('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm', qualityDot(item.connectionQuality))} />
                {handRaiseQueue.includes(item.id) && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-lg bg-amber-400 text-white flex items-center justify-center shadow-lg animate-bounce">
                    <Hand size={11} fill="currentColor" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-[14px] font-bold text-zinc-800 truncate leading-tight group-hover:text-zinc-900">{item.name}</span>
                  {item.role === 'host' && (
                    <div className="flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[#D97706] text-[9px] font-black uppercase tracking-tighter shadow-sm">
                      <Crown size={8} className="mr-0.5 fill-amber-500" />Host
                    </div>
                  )}
                  {item.id === 'host-local' && <span className="text-[11px] text-zinc-400 font-medium">(You)</span>}
                </div>
                <div className="flex items-center space-x-2.5 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className={clsx('p-1 rounded-md transition-colors', item.isMuted ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100')}>
                    {item.isMuted ? <MicOff size={11} /> : <Mic size={11} />}
                  </div>
                  <div className={clsx('p-1 rounded-md transition-colors', !item.isVideoOn ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100')}>
                    {!item.isVideoOn ? <VideoOff size={11} /> : <Video size={11} />}
                  </div>
                </div>
              </div>
              {isHost && (
                <div className="flex space-x-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={() => removeParticipant(item.id)} title="Remove" className="p-2 rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 border border-transparent hover:border-red-100">
                    <UserX size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {isHost && (
        <button onClick={muteAll} className="w-full mt-5 py-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-[13px] font-bold text-zinc-700 hover:bg-white hover:border-red-300 hover:text-red-600 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 group active:scale-98">
          <div className="p-1.5 rounded-lg bg-zinc-200/50 group-hover:bg-red-50 transition-colors"><MicOff size={15} /></div>
          <span>Mute Everyone</span>
        </button>
      )}
    </div>
  );
};

// ─── Notes Tab ────────────────────────────────────────────────────────────────
const NotesTab: React.FC = () => {
  const { notes, setNotes } = useMeetingStore();
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (v: string) => {
    setNotes(v);
    setSaved(false);
    const t = (handleChange as any)._t;
    if (t) clearTimeout(t);
    (handleChange as any)._t = setTimeout(() => setSaved(true), 600);
  };

  const insertMarkdown = (syntax: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = notes.slice(0, start);
    const selected = notes.slice(start, end);
    setNotes(before + syntax + selected + notes.slice(end));
    setTimeout(() => {
      el.selectionStart = start + syntax.length;
      el.selectionEnd = start + syntax.length + selected.length;
      el.focus();
    }, 0);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] font-bold text-zinc-900 font-display uppercase tracking-wider">Collaborative Notes</h3>
        {saved && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Draft Saved</span>}
      </div>
      <div className="flex items-center gap-1.5 p-2 bg-zinc-50 border border-zinc-200 rounded-xl mb-4 shadow-inner">
        <button onClick={() => insertMarkdown('# ')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-zinc-600 transition-all active:scale-90" title="Heading"><Heading size={15} /></button>
        <button onClick={() => insertMarkdown('**')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-zinc-600 transition-all active:scale-90" title="Bold"><Bold size={15} /></button>
        <button onClick={() => insertMarkdown('*')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-zinc-600 transition-all active:scale-90" title="Italic"><Italic size={15} /></button>
        <button onClick={() => insertMarkdown('- ')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-zinc-600 transition-all active:scale-90" title="List"><ListIcon size={15} /></button>
        <button onClick={() => insertMarkdown('[ ] ')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-zinc-600 transition-all active:scale-90" title="Checklist"><CheckSquare size={15} /></button>
      </div>
      <textarea ref={textareaRef} value={notes} onChange={e => handleChange(e.target.value)} placeholder="Brainstorm with your team..." className="flex-1 w-full p-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-[14px] leading-relaxed text-zinc-800 placeholder:text-zinc-400 focus:bg-white focus:border-[#5850EC]/20 focus:ring-4 focus:ring-[#5850EC]/5 focus:outline-none transition-all resize-none shadow-inner custom-scrollbar" />
    </div>
  );
};

// ─── Files Tab ────────────────────────────────────────────────────────────────
const FilesTab: React.FC = () => {
  const { files, uploadFile } = useMeetingStore();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, 'You');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] font-bold text-zinc-900 font-display uppercase tracking-wider">Shared Files</h3>
        <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded-md text-[11px] font-bold text-zinc-600">{files.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {files.map(file => (
          <div key={file.id} className="group p-4 bg-white border border-zinc-100 rounded-2xl hover:border-[#5850EC]/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 group-hover:bg-white transition-all">{getFileIcon(file.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-zinc-800 truncate leading-tight">{file.name}</p>
                <div className="flex items-center space-x-2 mt-1.5 text-[11px] font-semibold text-zinc-400">
                  <span>{formatSize(file.size)}</span>
                  <div className="w-1 h-1 rounded-full bg-zinc-200" />
                  <span>{formatTime(file.uploadedAt)}</span>
                </div>
              </div>
              <div className="flex space-x-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-[#5850EC] border border-transparent hover:border-zinc-200 transition-all"><Download size={15} /></button>
              </div>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 py-10 text-center px-4 border-2 border-dashed border-zinc-100 rounded-2xl">
            <div className="w-14 h-14 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-300 mb-4 border border-zinc-100 shadow-sm"><Upload size={24} /></div>
            <p className="text-[14px] font-bold text-zinc-800">No files shared yet</p>
            <p className="text-[12px] text-zinc-400 mt-1.5 leading-relaxed">Upload files to share with the team.</p>
          </div>
        )}
      </div>
      <label className="mt-5 relative overflow-hidden group cursor-pointer inline-flex items-center justify-center space-x-2 w-full py-3.5 bg-[#5850EC] hover:bg-[#4F46E5] text-white rounded-2xl font-bold text-[13px] transition-all active:scale-98 shadow-xl shadow-[#5850EC]/20">
        <Upload size={16} />
        <span>Share New File</span>
        <input type="file" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
};

// ─── Agenda Tab ───────────────────────────────────────────────────────────────
const AgendaTab: React.FC = () => {
  const { agendaItems, toggleAgendaItem } = useMeetingStore();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[14px] font-bold text-zinc-900 font-display uppercase tracking-wider">Meeting Agenda</h3>
        <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded-md text-[11px] font-bold text-zinc-600">{agendaItems.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {agendaItems.map((item, i) => (
          <div key={item.id} onClick={() => toggleAgendaItem(item.id)} className={clsx("p-4 border rounded-2xl cursor-pointer transition-all duration-300 flex items-start space-x-4", item.completed ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-zinc-100 hover:border-[#5850EC]/20 hover:shadow-md")}>
            <div className="mt-0.5 flex-shrink-0">
              {item.completed ? (
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"><Check size={14} /></div>
              ) : (
                <div className="w-6 h-6 rounded-lg border-2 border-zinc-200 bg-zinc-50 transition-all" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5 text-[10px] font-bold uppercase tracking-widest">
                <span className={clsx(item.completed ? "text-emerald-600" : "text-zinc-400")}>Topic {String(i + 1).padStart(2, '0')}</span>
                <span className="text-zinc-400 font-mono flex items-center"><Clock size={10} className="mr-1" /> {item.duration}m</span>
              </div>
              <p className={clsx("text-[14px] font-bold leading-tight", item.completed ? "text-zinc-400 line-through" : "text-zinc-800")}>{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
const Sidebar: React.FC = () => {
  const { sidebarTab, setSidebarTab, sidebarWidth, setSidebarWidth } = useMeetingStore();
  const chatMessages = useMeetingStore(s => s.chatMessages);
  const [unread, setUnread] = useState(0);
  const isResizing = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sidebarTab === 'chat') setUnread(0);
  }, [sidebarTab]);

  useEffect(() => {
    const unreadCount = chatMessages.filter(m => m.timestamp > Date.now() - 5000).length;
    if (sidebarTab !== 'chat') setUnread(prev => prev + unreadCount);
  }, [chatMessages.length, sidebarTab]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !sidebarRef.current) return;
    const offset = sidebarRef.current.getBoundingClientRect().left;
    const newWidth = e.clientX - offset;
    if (newWidth > 280 && newWidth < 600) setSidebarWidth(newWidth);
  }, [setSidebarWidth]);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, [handleMouseMove]);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'none';
  }, [handleMouseMove, stopResizing]);

  const TABS = [
    { id: 'participants' as const, icon: <Users size={16} />, label: 'People' },
    {
      id: 'chat' as const,
      icon: (
        <span className="relative">
          <MessageSquare size={16} />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-[8px] text-white font-black flex items-center justify-center animate-bounce">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </span>
      ),
      label: 'Chat',
    },
    { id: 'notes' as const, icon: <FileText size={16} />, label: 'Notes' },
    { id: 'files' as const, icon: <Folder size={16} />, label: 'Files' },
    { id: 'agenda' as const, icon: <AlignLeft size={16} />, label: 'Agenda' },
  ];

  const renderContent = () => {
    switch (sidebarTab) {
      case 'participants': return <ParticipantsTab />;
      case 'chat': return <ChatTab />;
      case 'notes': return <NotesTab />;
      case 'files': return <FilesTab />;
      case 'agenda': return <AgendaTab />;
    }
  };

  return (
    <aside ref={sidebarRef} className="h-full bg-white border-r border-zinc-200 flex flex-col relative z-20 flex-shrink-0 self-stretch" style={{ width: sidebarWidth }}>
      <div onMouseDown={startResizing} className={clsx("absolute top-0 right-[-4px] w-4 h-full cursor-default z-50 transition-all bg-transparent group", isResizing.current && "bg-zinc-900/5")}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-0.5 rounded-full bg-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="pt-4 flex flex-col h-full overflow-hidden">
        <nav className="px-5 mb-6">
          <div className="flex p-1.5 bg-zinc-50 border border-zinc-200 rounded-2xl gap-1 shadow-inner">
            {TABS.map(tab => (
              <button key={tab.id} aria-label={tab.label} onClick={() => setSidebarTab(tab.id)} title={tab.label} className={clsx('flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all', sidebarTab === tab.id ? 'bg-white shadow-lg shadow-zinc-200 text-[#5850EC] border border-zinc-100' : 'text-zinc-400 hover:text-zinc-700')}>
                {tab.icon}
                <span className={clsx("text-[9px] font-black uppercase tracking-tighter mt-1 transition-opacity", sidebarTab === tab.id ? "opacity-100" : "opacity-0 invisible h-0")}>{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
        <div data-lenis-prevent className="flex-1 overflow-hidden px-5 pb-6 flex flex-col h-full bg-white">
          <AnimatePresence mode="wait">
            <motion.div key={sidebarTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2, ease: "easeOut" }} className="flex-1 overflow-hidden flex flex-col h-full">
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;