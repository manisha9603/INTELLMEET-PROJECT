

export type ConnectionQuality = 'good' | 'moderate' | 'poor';
export type ParticipantRole   = 'host' | 'participant' | 'guest';

export interface Participant {
  id:                string;
  name:              string;
  role:              ParticipantRole;
  avatar:            string;    // required — always 2-char initials e.g. 'YO'
  isMuted:           boolean;
  isVideoOn:         boolean;
  isSpeaking:        boolean;
  connectionQuality: ConnectionQuality;
  joinedAt:          number;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export type TimelineEventType =
  | 'decision'
  | 'task'
  | 'summary'
  | 'join'
  | 'leave'
  | 'action';

export interface TimelineEvent {
  id:        string;
  type:      TimelineEventType;
  label:     string;
  timestamp: number;
}

// ─── Transcript ───────────────────────────────────────────────────────────────

export interface TranscriptChunk {
  id:         string;
  speakerId:  string;
  text:       string;
  timestamp:  number;
  confidence: number;
}

// TranscriptLine adds resolved speaker name — used in store & UI
export type TranscriptLine = TranscriptChunk & {
  speakerName: string;
};

// ─── Action Items ─────────────────────────────────────────────────────────────

export interface ActionItem {
  id:        string;
  task:      string;
  assignee:  string;    // required — pass 'Unassigned' if unknown, never undefined
  priority:  'low' | 'medium' | 'high';
  completed: boolean;
  dueDate?:  string;    // optional ISO date string
}

// ─── Sentiment ────────────────────────────────────────────────────────────────

// SentimentType includes 'analyzing' for loading state in store
export type SentimentType = 'positive' | 'neutral' | 'negative' | 'analyzing';

export interface SentimentData {
  overall:    'positive' | 'neutral' | 'negative';
  confidence: number;
  scores: {
    positive: number;
    neutral:  number;
    negative: number;
  };
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsMetrics {
  talkTimeRatio:   Record<string, number>;
  engagementScore: number;
  dominanceRatio:  number;
}

export interface ConfidenceMetrics {
  summary:   number;
  decision:  number;
  sentiment: number;
  speaker:   number;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface MeetingSession {
  id:         string;
  startedAt:  number;
  endedAt?:   number;
  status:     'idle' | 'live' | 'ended';
  analytics?: AnalyticsMetrics;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id:         string;
  senderId:   string;
  senderName: string;
  text:       string;
  timestamp:  number;
  reactions:  string[];
}

// ─── Files ────────────────────────────────────────────────────────────────────

export interface MeetingFile {
  id:         string;
  name:       string;
  size:       number;
  url:        string;
  uploadedBy: string;
  uploadedAt: number;
  type:       string;
}

// ─── Agenda ───────────────────────────────────────────────────────────────────

export interface AgendaItem {
  id:        string;
  title:     string;
  duration:  number;    // minutes
  completed: boolean;
}

// ─── UI / Layout ──────────────────────────────────────────────────────────────

export type LayoutMode           = 'gallery' | 'speaker' | 'spotlight' | 'sidebar';
export type MediaPermissionState = 'prompt' | 'granted' | 'denied' | 'error' | 'loading';
export type ConnectionStatus     = 'connected' | 'reconnecting' | 'failed';
export type AIStatus             = 'online' | 'degraded' | 'offline';
export type SidebarTab           = 'participants' | 'chat' | 'notes' | 'files' | 'agenda';