export type {
  TranscriptChunk,
  ActionItem,
  SentimentData,
} from './meeting.types';

// ─── AI-only types ────────────────────────────────────────────────────────────

export interface ConfidenceMetrics {
  summary:   number;
  decision:  number;
  sentiment: number;
  speaker:   number;
}

export interface AIInsight {
  type:      'decision' | 'action' | 'risk' | 'summary';
  text:      string;
  confidence: number;
  timestamp: number;
}

export interface SpeakerStats {
  speakerId:    string;
  speakerName:  string;
  talkTime:     number;   // ms
  wordCount:    number;
  sentenceCount: number;
}