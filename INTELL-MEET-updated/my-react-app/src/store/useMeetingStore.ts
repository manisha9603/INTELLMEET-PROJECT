import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Participant,
  TimelineEvent,
  ActionItem,
  TranscriptLine,
  ChatMessage,
  MeetingFile,
  AgendaItem,
  LayoutMode,
  MediaPermissionState,
  SentimentType,
  ConnectionStatus,
  AIStatus,
  SidebarTab,
} from '../types/meeting.types';

// Re-export LayoutMode so Controls.tsx import stays unchanged:
// import { useMeetingStore, type LayoutMode } from '../../store/useMeetingStore'
export type { LayoutMode } from '../types/meeting.types';

// ─── State Interface ──────────────────────────────────────────────────────────

interface MeetingState {
  // Participants
  participants:    Participant[];
  activeSpeakerId: string | null;

  // Media & Controls
  micOn:             boolean;
  camOn:             boolean;
  isRecording:       boolean;
  isScreenSharing:   boolean;
  screenShareStream: MediaStream | null;
  localStream:       MediaStream | null;
  mediaPermission:   MediaPermissionState;
  connectionStatus:  ConnectionStatus;
  aiStatus:          AIStatus;

  // AI Intelligence
  transcript:  TranscriptLine[];
  aiSummary:   string;
  actionItems: ActionItem[];
  timeline:    TimelineEvent[];
  sentiment:   SentimentType;

  // Chat
  chatMessages: ChatMessage[];

  // Notes
  notes: string;

  // Files
  files: MeetingFile[];

  // Layout
  layout:              LayoutMode;
  pinnedParticipantId: string | null;

  // Meeting meta
  meetingTitle:     string;
  meetingStartTime: number;

  // Agenda
  agendaItems:        AgendaItem[];
  currentAgendaIndex: number;

  // Hand raise
  handRaiseQueue: string[];

  // UI Panels
  isAIPanelOpen: boolean;
  isSidebarOpen: boolean;
  sidebarTab:    SidebarTab;
  sidebarWidth:  number;
  aiPanelWidth:  number;

  // ─── Actions ───────────────────────────────────────────────────────────────

  toggleMic:       () => void;
  toggleCam:       () => void;
  toggleRecording: () => void;
  toggleAIPanel:   () => void;
  toggleSidebar:   () => void;
  setSidebarTab:   (tab: SidebarTab) => void;
  setSidebarWidth: (width: number) => void;
  setAIPanelWidth: (width: number) => void;

  requestMediaDevices: () => Promise<void>;
  stopLocalStream:     () => void;
  setLocalStream:      (stream: MediaStream | null) => void;
  setMediaPermission:  (state: MediaPermissionState) => void;

  addTranscriptLine: (speakerId: string, text: string) => void;
  updateSummary:     (summary: string) => void;
  addActionItem:     (task: string, assignee: string) => void;
  toggleActionItem:  (id: string) => void;
  addTimelineEvent:  (event: string, type: TimelineEvent['type']) => void;
  setSentiment:      (sentiment: SentimentType) => void;
  setActiveSpeaker:  (id: string | null) => void;

  // ✅ 2 args only — senderName auto-resolved from participants
  sendMessage: (text: string, senderId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;

  uploadFile: (file: File, uploadedBy: string) => void;

  setLayout:      (layout: LayoutMode) => void;
  pinParticipant: (id: string | null) => void;

  raiseHand: (participantId: string) => void;
  lowerHand: (participantId: string) => void;

  setNotes: (notes: string) => void;

  admitParticipant:  (id: string) => void;
  removeParticipant: (id: string) => void;
  muteAll:           () => void;
  makeHost:          (id: string) => void;

  setScreenShareStream: (stream: MediaStream | null) => void;

  addAgendaItem:    (title: string, duration: number) => void;
  removeAgendaItem: (id: string) => void;
  markAgendaDone:   () => void;
  toggleAgendaItem: (id: string) => void;

  addBotParticipant: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HOST: Participant = {
  id:                'host-local',
  name:              'You',
  role:              'host',
  avatar:            'YO',
  isSpeaking:        false,
  isMuted:           false,
  isVideoOn:         true,
  connectionQuality: 'good',
  joinedAt:          Date.now(),
};

const BOT_NAMES: { name: string; avatar: string }[] = [
  { name: 'Sarah Jameson',    avatar: 'SJ' },
  { name: 'Michael Chen',     avatar: 'MC' },
  { name: 'Elena Rodriguez',  avatar: 'ER' },
  { name: 'Alex Thompson',    avatar: 'AT' },
  { name: 'Priya Patel',      avatar: 'PP' },
  { name: 'James Wilson',     avatar: 'JW' },
  { name: 'Aiko Tanaka',      avatar: 'AK' },
  { name: 'David Kim',        avatar: 'DK' },
];

const defaultAgenda: AgendaItem[] = [
  { id: uuidv4(), title: 'Team check-in & blockers',     duration: 10, completed: false },
  { id: uuidv4(), title: 'Product roadmap Q2 review',    duration: 20, completed: false },
  { id: uuidv4(), title: 'Sprint planning & assignments', duration: 15, completed: false },
  { id: uuidv4(), title: 'Open Q&A',                     duration: 10, completed: false },
];

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMeetingStore = create<MeetingState>()(
  persist(
    (set, get) => ({

      // ── Initial State ─────────────────────────────────────────────────────
      participants:      [HOST],
      activeSpeakerId:   null,

      micOn:             true,
      camOn:             true,
      isRecording:       false,
      isScreenSharing:   false,
      screenShareStream: null,
      localStream:       null,
      mediaPermission:   'prompt',
      connectionStatus:  'connected',
      aiStatus:          'online',

      transcript:  [],
      aiSummary:   'Waiting for meeting to begin…',
      actionItems: [],
      timeline: [
        { id: uuidv4(), timestamp: Date.now(), label: 'Meeting Started', type: 'summary' },
      ],
      sentiment: 'neutral',

      chatMessages: [],
      notes:        '',
      files:        [],

      layout:              'gallery',
      pinnedParticipantId: null,
      meetingTitle:        'Project Nexus Planning',
      meetingStartTime:    Date.now(),
      agendaItems:         defaultAgenda,
      currentAgendaIndex:  0,
      handRaiseQueue:      [],

      isAIPanelOpen: false,
      isSidebarOpen: true,
      sidebarTab:    'participants',
      sidebarWidth:  340,
      aiPanelWidth:  380,

      // ── Media ─────────────────────────────────────────────────────────────
      requestMediaDevices: async () => {
        set({ mediaPermission: 'loading' });
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          set({
            localStream:     stream,
            mediaPermission: 'granted',
            camOn:           true,
            micOn:           true,
            participants: get().participants.map(p =>
              p.id === 'host-local' ? { ...p, isVideoOn: true, isMuted: false } : p
            ),
          });
        } catch (err: any) {
          set({
            mediaPermission: err.name === 'NotAllowedError' ? 'denied' : 'error',
            camOn:           false,
            micOn:           false,
            participants: get().participants.map(p =>
              p.id === 'host-local' ? { ...p, isVideoOn: false, isMuted: true } : p
            ),
          });
        }
      },

      stopLocalStream: () => {
        get().localStream?.getTracks().forEach(t => t.stop());
        set({ localStream: null });
      },

      setLocalStream:     (stream) => set({ localStream: stream }),
      setMediaPermission: (state)  => set({ mediaPermission: state }),

      // ── Controls ──────────────────────────────────────────────────────────
      toggleMic: () => {
        const { micOn, localStream } = get();
        localStream?.getAudioTracks().forEach(t => { t.enabled = !micOn; });
        set((s) => ({
          micOn: !s.micOn,
          participants: s.participants.map(p =>
            p.id === 'host-local' ? { ...p, isMuted: s.micOn } : p
          ),
        }));
      },

      toggleCam: () => {
        const { camOn, localStream } = get();
        localStream?.getVideoTracks().forEach(t => { t.enabled = !camOn; });
        set((s) => ({
          camOn: !s.camOn,
          participants: s.participants.map(p =>
            p.id === 'host-local' ? { ...p, isVideoOn: !s.camOn } : p
          ),
        }));
      },

      toggleRecording: () => set((s) => ({ isRecording: !s.isRecording })),
      toggleAIPanel:   () => set((s) => ({ isAIPanelOpen: !s.isAIPanelOpen })),
      toggleSidebar:   () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      setSidebarTab:   (tab)   => set({ sidebarTab: tab, isSidebarOpen: true }),
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
      setAIPanelWidth: (width) => set({ aiPanelWidth: width }),

      // ── AI Pipeline ────────────────────────────────────────────────────────
      addTranscriptLine: (speakerId, text) => {
        const speaker = get().participants.find(p => p.id === speakerId);
        const newLine: TranscriptLine = {
          id:          uuidv4(),
          speakerId,
          speakerName: speaker?.name || 'Unknown',
          text,
          timestamp:   Date.now(),
          confidence:  0.95,
        };
        set((s) => ({
          transcript: [...s.transcript, newLine],
          participants: s.participants.map(p =>
            p.id === speakerId ? { ...p, isSpeaking: true } : { ...p, isSpeaking: false }
          ),
          activeSpeakerId: speakerId,
        }));
        setTimeout(() => {
          if (get().activeSpeakerId === speakerId) {
            set((s) => ({
              participants:    s.participants.map(p => ({ ...p, isSpeaking: false })),
              activeSpeakerId: null,
            }));
          }
        }, 3000);
      },

      updateSummary: (summary) => set({ aiSummary: summary }),

      addActionItem: (task, assignee) => {
        const newItem: ActionItem = {
          id:        uuidv4(),
          task,
          assignee,             // required string — caller passes 'Unassigned' if unknown
          completed: false,
          priority:  'medium',
        };
        set((s) => ({ actionItems: [...s.actionItems, newItem] }));
      },

      toggleActionItem: (id) => {
        set((s) => ({
          actionItems: s.actionItems.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        }));
      },

      addTimelineEvent: (event, type) => {
        const newEvent: TimelineEvent = {
          id: uuidv4(), timestamp: Date.now(), label: event, type,
        };
        set((s) => ({ timeline: [...s.timeline, newEvent] }));
      },

      setSentiment:     (sentiment) => set({ sentiment }),
      setActiveSpeaker: (id) =>
        set((s) => ({
          activeSpeakerId: id,
          participants: s.participants.map(p =>
            p.id === id ? { ...p, isSpeaking: true } : { ...p, isSpeaking: false }
          ),
        })),

      // ── Chat ──────────────────────────────────────────────────────────────
      // ✅ sendMessage — exactly 2 args: (text, senderId)
      sendMessage: (text, senderId) => {
        const sender = get().participants.find(p => p.id === senderId);
        const msg: ChatMessage = {
          id:         uuidv4(),
          senderId,
          senderName: sender?.name || 'You',
          text,
          timestamp:  Date.now(),
          reactions:  [],
        };
        set((s) => ({ chatMessages: [...s.chatMessages, msg] }));
      },

      addReaction: (messageId, emoji) => {
        set((s) => ({
          chatMessages: s.chatMessages.map(m =>
            m.id === messageId ? { ...m, reactions: [...m.reactions, emoji] } : m
          ),
        }));
      },

      // ── Files ─────────────────────────────────────────────────────────────
      uploadFile: (file, uploadedBy) => {
        const newFile: MeetingFile = {
          id:         uuidv4(),
          name:       file.name,
          size:       file.size,
          url:        URL.createObjectURL(file),
          uploadedBy,
          uploadedAt: Date.now(),
          type:       file.type,
        };
        set((s) => ({ files: [...s.files, newFile] }));
      },

      // ── Layout ────────────────────────────────────────────────────────────
      setLayout:      (layout) => set({ layout }),
      pinParticipant: (id)     => set({ pinnedParticipantId: id }),

      // ── Hand Raise ────────────────────────────────────────────────────────
      raiseHand: (participantId) => {
        set((s) => ({
          handRaiseQueue: s.handRaiseQueue.includes(participantId)
            ? s.handRaiseQueue
            : [...s.handRaiseQueue, participantId],
        }));
      },
      lowerHand: (participantId) => {
        set((s) => ({
          handRaiseQueue: s.handRaiseQueue.filter(id => id !== participantId),
        }));
      },

      // ── Notes ─────────────────────────────────────────────────────────────
      setNotes: (notes) => set({ notes }),

      // ── Host Controls ─────────────────────────────────────────────────────
      admitParticipant:  (_id) => { /* WebSocket placeholder */ },
      removeParticipant: (id)  => {
        set((s) => ({ participants: s.participants.filter(p => p.id !== id) }));
      },
      muteAll: () => {
        set((s) => ({
          participants: s.participants.map(p => ({ ...p, isMuted: true })),
        }));
      },
      makeHost: (id) => {
        set((s) => ({
          participants: s.participants.map(p =>
            p.id === id ? { ...p, role: 'host' } : p
          ),
        }));
      },

      // ── Screen Share ──────────────────────────────────────────────────────
      setScreenShareStream: (stream) => {
        set({ screenShareStream: stream, isScreenSharing: stream !== null });
      },

      // ── Agenda ────────────────────────────────────────────────────────────
      addAgendaItem: (title, duration) => {
        const item: AgendaItem = { id: uuidv4(), title, duration, completed: false };
        set((s) => ({ agendaItems: [...s.agendaItems, item] }));
      },
      removeAgendaItem: (id) => {
        set((s) => ({ agendaItems: s.agendaItems.filter(a => a.id !== id) }));
      },
      markAgendaDone: () => {
        set((s) => {
          const idx     = s.currentAgendaIndex;
          const updated = s.agendaItems.map((a, i) =>
            i === idx ? { ...a, completed: true } : a
          );
          return {
            agendaItems:        updated,
            currentAgendaIndex: Math.min(idx + 1, updated.length - 1),
          };
        });
      },
      toggleAgendaItem: (id) => {
        set((s) => ({
          agendaItems: s.agendaItems.map(a =>
            a.id === id ? { ...a, completed: !a.completed } : a
          ),
        }));
      },

      // ── Dev Helpers ───────────────────────────────────────────────────────
      addBotParticipant: () => {
        const existing = get().participants;
        const botIdx   = existing.length - 1;   // offset by 1 for host
        if (botIdx >= BOT_NAMES.length) return;
        const bot  = BOT_NAMES[botIdx];
        const newP: Participant = {
          id:                uuidv4(),
          name:              bot.name,
          role:              'participant',
          avatar:            bot.avatar,
          isSpeaking:        false,
          isMuted:           Math.random() > 0.5,
          isVideoOn:         Math.random() > 0.3,
          connectionQuality: (['good', 'moderate', 'good'] as const)[Math.floor(Math.random() * 3)],
          joinedAt:          Date.now(),
        };
        set((s) => ({
          participants: [...s.participants, newP],
          timeline: [
            ...s.timeline,
            {
              id:        uuidv4(),
              timestamp: Date.now(),
              label:     `${bot.name} joined`,
              type:      'join' as TimelineEvent['type'],
            },
          ],
        }));
      },
    }),

    // ── Persistence ───────────────────────────────────────────────────────────
    {
      name:    'intellmeet-session-v3',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        transcript:         state.transcript,
        aiSummary:          state.aiSummary,
        actionItems:        state.actionItems,
        timeline:           state.timeline,
        isAIPanelOpen:      state.isAIPanelOpen,
        isSidebarOpen:      state.isSidebarOpen,
        chatMessages:       state.chatMessages,
        notes:              state.notes,
        agendaItems:        state.agendaItems,
        currentAgendaIndex: state.currentAgendaIndex,
        meetingTitle:       state.meetingTitle,
        meetingStartTime:   state.meetingStartTime,
        layout:             state.layout,
      }),
    }
  )
);