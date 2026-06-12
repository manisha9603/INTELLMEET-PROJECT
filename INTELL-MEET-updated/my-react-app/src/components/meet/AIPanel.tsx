import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Brain, ChevronRight, Terminal, CircleCheck, Clock, Zap,
  FileText, Sparkles, MessageSquare, X, Bot, User,
  CornerDownLeft, List as ListIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeetingStore } from '../../store/useMeetingStore';
import { summaryService } from '../../services/summary.service';

// ─── Transcript Row ────────────────────────────────────────────────────────────
const TranscriptRow: React.FC<{ line: ReturnType<typeof useMeetingStore.getState>['transcript'][number] }> = ({ line }) => {
  const timeString = new Date(line.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-[13px] leading-relaxed border-l-2 border-[#5850EC]/30 pl-4 py-1.5"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-[#5850EC] text-[12px]">{line.speakerName}</span>
        <span className="text-[11px] text-zinc-400 font-mono">{timeString}</span>
      </div>
      <span className="text-zinc-700 font-medium">{line.text}</span>
    </motion.div>
  );
};

// ─── AI Panel ─────────────────────────────────────────────────────────────────
const AIPanel: React.FC = () => {
  const isAIPanelOpen = useMeetingStore(s => s.isAIPanelOpen);
  const toggleAIPanel = useMeetingStore(s => s.toggleAIPanel);
  const transcript = useMeetingStore(s => s.transcript);
  const aiSummary = useMeetingStore(s => s.aiSummary);
  const actionItems = useMeetingStore(s => s.actionItems);
  const timeline = useMeetingStore(s => s.timeline);
  const sentiment = useMeetingStore(s => s.sentiment);
  const toggleActionItem = useMeetingStore(s => s.toggleActionItem);
  const addActionItem = useMeetingStore(s => s.addActionItem);
  const participants = useMeetingStore(s => s.participants);

  const isHostOnly = participants.length === 1;
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showAskAI, setShowAskAI] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am your AI meeting assistant. How can I help you today?' }
  ]);
  const [aiStreaming, setAiStreaming] = useState(false);

  // Resize logic
  const [width, setWidth] = useState(380);
  const isResizing = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 320 && newWidth < 600) {
      setWidth(newWidth);
    }
  }, []);

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

  const decisions = timeline.filter(t => t.type === 'decision');

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript.length]);

  // Auto-scroll chat
  useEffect(() => {
    if (showAskAI) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages.length, showAskAI]);

  // ── Gen Minutes ──
  const handleGenMinutes = () => {
    const now = new Date().toLocaleString();
    const lines = [
      `MEETING MINUTES`,
      `Generated: ${now}`,
      ``,
      `EXECUTIVE SUMMARY`,
      `─────────────────`,
      aiSummary,
      ``,
      `ACTION ITEMS`,
      `─────────────────`,
      ...actionItems.map((a, i) => `${i + 1}. [${a.completed ? 'x' : ' '}] ${a.task} (${a.assignee || 'Unassigned'})`),
      ``,
      `TIMELINE`,
      `─────────────────`,
      ...timeline.map(e => `${new Date(e.timestamp).toLocaleTimeString()} — ${e.label}`),
      ``,
      `TRANSCRIPT`,
      `─────────────────`,
      ...transcript.map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speakerName}: ${t.text}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-minutes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Extract Tasks ──
  const handleExtractTasks = async () => {
    const fullTranscript = transcript.map(t => `${t.speakerName}: ${t.text}`).join('\n');
    if (!fullTranscript.trim()) return;
    try {
      const items = await summaryService.extractActionItems(fullTranscript);
      items.forEach(item => addActionItem(item.task, item.assignee ?? 'Unknown'));
    } catch (err) {
      console.error('[AIPanel] Extract tasks failed:', err);
    }
  };

  // ── Ask AI ──
  const handleAskAI = async () => {
    if (!aiInput.trim() || aiStreaming) return;
    const userMsg = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiInput('');
    setAiStreaming(true);

    const fullTranscript = transcript.map(t => `${t.speakerName}: ${t.text}`).join('\n');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/api/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, transcript: fullTranscript }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamed = '';
      setAiMessages(prev => [...prev, { role: 'ai', text: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamed += decoder.decode(value, { stream: true });
        setAiMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'ai', text: streamed };
          return copy;
        });
      }
    } catch (err) {
      console.error('[AIPanel] Ask AI failed:', err);
      setAiMessages(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, I could not reach the AI backend. Please check the connection.',
      }]);
    } finally {
      setAiStreaming(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isAIPanelOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-full self-stretch bg-white border-l border-zinc-200 flex flex-col relative z-50 overflow-hidden flex-shrink-0 shadow-2xl shadow-zinc-900/5"
          >
            {/* Resizer Handle */}
            <div
              onMouseDown={startResizing}
              className="absolute top-0 left-0 w-1.5 h-full cursor-default hover:bg-zinc-900/5 transition-colors z-[60] group"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-0.5 rounded-full bg-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100 bg-gradient-to-br from-white to-zinc-50/50">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#5850EC]/10 flex items-center justify-center text-[#5850EC] shadow-sm border border-[#5850EC]/20 animate-pulse">
                  <Brain size={18} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-zinc-900 font-display">AI Copilot</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-tighter">Live Analysis</span>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleAIPanel}
                className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 transition-all active:scale-95 border border-zinc-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto px-6 space-y-8 pb-6 pt-6 custom-scrollbar min-h-0 bg-white">

              {/* Sentiment */}
              <section>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Meeting Sentiment</span>
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  </div>
                </div>
                <div className="flex space-x-2.5 h-2">
                  <div className={clsx('flex-1 rounded-full transition-all duration-700', sentiment === 'positive' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-zinc-100')} />
                  <div className={clsx('flex-1 rounded-full transition-all duration-700', sentiment === 'neutral' ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]' : 'bg-zinc-100')} />
                  <div className={clsx('flex-1 rounded-full transition-all duration-700', sentiment === 'negative' ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'bg-zinc-100')} />
                </div>
              </section>

              {/* Live Transcript */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-[#5850EC]/10 flex items-center justify-center text-[#5850EC]">
                      <Terminal size={12} />
                    </div>
                    <span className="text-[13px] font-bold text-zinc-800">Transcript Workspace</span>
                  </div>
                </div>
                <div className="h-56 bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden shadow-inner group transition-all hover:bg-white hover:border-[#5850EC]/20">
                  {isHostOnly || transcript.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-zinc-50/50">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-300 mb-3 shadow-sm">
                        <Terminal size={24} />
                      </div>
                      <p className="text-[14px] font-bold text-zinc-800 mb-1">
                        {isHostOnly ? 'Host is setting up' : 'Awaiting transcript...'}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-medium px-4">Neural processing active. AI will start transcribing once conversation begins.</p>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {transcript.map(line => (
                        <TranscriptRow key={line.id} line={line} />
                      ))}
                      <div ref={transcriptEndRef} />
                    </div>
                  )}
                </div>
              </section>

              {/* AI Summary */}
              <section>
                <div className="flex items-center space-x-2.5 mb-4 px-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                    <Sparkles size={14} />
                  </div>
                  <span className="text-[14px] font-bold text-zinc-800">Executive Briefing</span>
                </div>
                <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl shadow-sm hover:shadow-xl hover:bg-white hover:border-[#5850EC]/30 transition-all duration-300 group">
                  <div className="bg-[#5850EC] w-8 h-1 rounded-full mb-4 opacity-30 group-hover:opacity-100 group-hover:w-12 transition-all" />
                  <p className="text-[14px] text-zinc-800 leading-relaxed font-bold italic tracking-tight">
                    {isHostOnly ? 'The AI is waiting for participants to join before generating a briefing.' : aiSummary}
                  </p>
                </div>
              </section>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="p-5 bg-white border border-zinc-100 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-[#5850EC]/5 hover:border-[#5850EC]/20 transition-all duration-500 shadow-sm hover:shadow-xl">
                  <div className="w-10 h-10 rounded-2xl bg-[#5850EC]/10 flex items-center justify-center text-[#5850EC] mb-3 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 border border-[#5850EC]/10">
                    <CircleCheck size={18} />
                  </div>
                  <h4 className="text-[28px] font-black text-[#5850EC] leading-none font-display">{actionItems.filter(i => !i.completed).length}</h4>
                  <span className="text-[11px] font-bold text-zinc-400 capitalize tracking-tight mt-1.5">Action items</span>
                </div>
                <div className="p-5 bg-white border border-zinc-100 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-amber-50 hover:border-amber-200 transition-all duration-500 shadow-sm hover:shadow-xl">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-3 group-hover:-rotate-12 group-hover:scale-110 transition-all duration-500 border border-amber-100">
                    <Zap size={18} />
                  </div>
                  <h4 className="text-[28px] font-black text-amber-500 leading-none font-display">{decisions.length}</h4>
                  <span className="text-[11px] font-bold text-zinc-400 capitalize tracking-tight mt-1.5">Key decisions</span>
                </div>
              </div>

              {/* Action Items */}
              <section>
                <div className="flex items-center space-x-2.5 mb-4 px-1">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <ListIcon size={12} />
                  </div>
                  <span className="text-[14px] font-bold text-zinc-800">Pending Actions</span>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {actionItems.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={clsx(
                          'flex items-center space-x-4 p-4 bg-white border rounded-2xl cursor-pointer group transition-all duration-300 shadow-sm',
                          item.completed ? 'border-emerald-200 bg-emerald-50/50 grayscale' : 'border-zinc-100 hover:border-[#5850EC]/30 hover:shadow-lg'
                        )}
                        onClick={() => toggleActionItem(item.id)}
                      >
                        <div className={clsx(
                          "flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                          item.completed ? "bg-emerald-500 text-white" : "bg-zinc-50 border-2 border-zinc-100 group-hover:border-[#5850EC]/40"
                        )}>
                          {item.completed ? <CircleCheck size={14} /> : <div className="w-2 h-2 rounded-full bg-zinc-200" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={clsx('text-[14px] font-bold truncate leading-tight', item.completed ? 'text-zinc-400 line-through' : 'text-zinc-800')}>{item.task}</p>
                          {item.assignee && (
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#5850EC]/60 mt-1 block">Assignee: {item.assignee}</span>
                          )}
                        </div>
                        {!item.completed && (
                          <div className="w-8 h-8 rounded-xl bg-zinc-50 flex items-center justify-center text-[10px] font-black text-[#5850EC] border border-zinc-100 group-hover:bg-white transition-all shadow-inner">
                            {item.assignee}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {actionItems.length === 0 && <p className="text-[12px] text-zinc-400 italic text-center py-4 bg-zinc-50 rounded-2xl border border-zinc-100">No pending actions detected.</p>}
                </div>
              </section>

              {/* Timeline */}
              <section>
                <div className="flex items-center space-x-2.5 mb-5 px-1">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                    <Clock size={12} />
                  </div>
                  <span className="text-[14px] font-bold text-zinc-800">Meeting Timeline</span>
                </div>
                <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[17px] before:w-px before:bg-gradient-to-b before:from-zinc-100 before:via-zinc-200 before:to-zinc-50">
                  {timeline.map(event => (
                    <div key={event.id} className="relative pl-6">
                      <div className={clsx(
                        'absolute left-[-21px] top-1 w-2.5 h-2.5 rounded-full ring-[4px] ring-white shadow-sm',
                        event.type === 'decision' ? 'bg-amber-400' : event.type === 'task' ? 'bg-[#5850EC]' : event.type === 'join' ? 'bg-blue-400' : 'bg-emerald-400'
                      )} />
                      <div className="bg-zinc-50/50 p-3 rounded-xl border border-zinc-100 hover:bg-white hover:border-[#5850EC]/20 transition-all duration-300 shadow-inner group">
                        <span className="block text-[11px] font-bold font-mono text-zinc-400 mb-1 group-hover:text-[#5850EC] transition-colors">
                          {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <p className="text-[13px] text-zinc-700 font-bold leading-tight">{event.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex-shrink-0 bg-white border-t border-zinc-100 px-6 py-5 space-y-3.5 bg-gradient-to-t from-zinc-50 to-white shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleGenMinutes}
                  className="flex-1 min-w-[100px] flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-700 hover:border-[#5850EC] hover:text-[#5850EC] hover:shadow-xl transition-all text-[13px] font-bold active:scale-95 group shadow-sm"
                >
                  <FileText size={15} className="group-hover:rotate-6 transition-transform" />
                  <span>Minutes</span>
                </button>
                <button
                  onClick={handleExtractTasks}
                  className="flex-1 min-w-[100px] flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-zinc-200 rounded-xl text-zinc-700 hover:border-[#5850EC] hover:text-[#5850EC] hover:shadow-xl transition-all text-[13px] font-bold active:scale-95 group shadow-sm"
                >
                  <Zap size={15} className="group-hover:rotate-6 transition-transform" />
                  <span>Extract</span>
                </button>
                <button
                  onClick={() => setShowAskAI(!showAskAI)}
                  className={clsx(
                    'w-full flex items-center justify-center space-x-2 px-4 py-3.5 rounded-2xl transition-all text-[14px] font-black shadow-xl active:scale-95 group',
                    showAskAI ? 'bg-zinc-900 text-white' : 'bg-[#5850EC] text-white shadow-[#5850EC]/20 hover:bg-[#4843C8]'
                  )}
                >
                  <MessageSquare size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                  <span>{showAskAI ? 'Close Assistant' : 'Launch AI Assistant'}</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── AI Chat Popup Box ─── */}
      <AnimatePresence>
        {showAskAI && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAskAI(false)}
              className="fixed inset-0 bg-black/10 backdrop-blur-[4px] z-[2000]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30, x: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30, x: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed bottom-28 right-8 w-[440px] max-w-[calc(100vw-64px)] h-[580px] bg-white border border-zinc-200 rounded-[2rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] z-[2001] flex flex-col overflow-hidden ring-1 ring-black/5"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-white relative">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#5850EC] flex items-center justify-center text-white shadow-2xl shadow-[#5850EC]/40 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 translate-y-10 group-hover:translate-y-0 transition-transform duration-500" />
                    <Bot size={22} className="relative z-10" />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-black text-zinc-900 font-display tracking-tight">AI Workspace</h4>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Quantum Engine Ready</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAskAI(false)}
                  className="w-10 h-10 rounded-2xl hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white shadow-inner">
                {aiMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15, x: msg.role === 'user' ? 30 : -30 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    className={clsx(
                      'flex items-start space-x-4',
                      msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    )}
                  >
                    <div className={clsx(
                      'w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 shadow-sm',
                      msg.role === 'user' ? 'bg-zinc-50 border-zinc-100 text-zinc-600' : 'bg-[#5850EC]/10 border-[#5850EC]/20 text-[#5850EC]'
                    )}>
                      {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className={clsx(
                      'max-w-[80%] p-4 rounded-2xl text-[14px] leading-relaxed shadow-lg font-medium',
                      msg.role === 'user'
                        ? 'bg-[#5850EC] text-white rounded-tr-none shadow-[#5850EC]/10'
                        : 'bg-zinc-50 border border-zinc-100 text-zinc-800 rounded-tl-none'
                    )}>
                      {msg.text}
                      {msg.role === 'ai' && aiStreaming && i === aiMessages.length - 1 && (
                        <span className="inline-block w-1.5 h-4 bg-[#5850EC] ml-2 animate-pulse rounded-full" />
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-zinc-100 bg-white">
                <div className="relative group">
                  <input
                    autoFocus
                    type="text"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAskAI()}
                    placeholder="Message AI Assistant..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-[1.25rem] pl-5 pr-14 py-4 text-[14px] text-zinc-900 font-bold placeholder:text-zinc-400 focus:bg-white focus:border-[#5850EC] focus:ring-8 focus:ring-[#5850EC]/5 focus:outline-none transition-all shadow-inner"
                  />
                  <button
                    onClick={handleAskAI}
                    disabled={!aiInput.trim() || aiStreaming}
                    className={clsx(
                      'absolute right-2.5 top-2.5 w-11 h-11 rounded-[1rem] flex items-center justify-center transition-all duration-300',
                      aiInput.trim() ? 'bg-[#5850EC] text-white shadow-2xl shadow-[#5850EC]/40 scale-100 rotate-0' : 'bg-zinc-100 text-zinc-300 scale-90 -rotate-12 opacity-50'
                    )}
                  >
                    <CornerDownLeft size={18} />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-center space-x-3">
                  <div className="h-[1px] w-8 bg-zinc-100" />
                  <span className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.1em]">Spectral Engine v2.0</span>
                  <div className="h-[1px] w-8 bg-zinc-100" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIPanel;
