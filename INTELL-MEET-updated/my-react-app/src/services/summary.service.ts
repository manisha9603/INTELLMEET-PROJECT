import type { ActionItem, SentimentData } from '../types/ai.types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export class SummaryService {
  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw Object.assign(new Error(err.message ?? `HTTP ${res.status}`), { status: res.status });
    }
    return res.json();
  }

  public async generateSummary(transcript: string): Promise<string> {
    const data = await this.post<{ summary: string }>('/api/ai/insights', {
      transcript,
      meetingTitle: 'Live Meeting',
    });
    return data.summary ?? '';
  }

  public async extractActionItems(transcript: string): Promise<ActionItem[]> {
    const data = await this.post<{ actionItems: ActionItem[] }>('/api/ai/insights', {
      transcript,
      meetingTitle: 'Live Meeting',
    });
    return data.actionItems ?? [];
  }

  public async inferSentiment(transcriptChunk: string): Promise<SentimentData> {
    const data = await this.post<{ sentiment: string }>('/api/ai/insights', {
      transcript: transcriptChunk,
      meetingTitle: 'Live Meeting',
    });
    const overall = (['positive', 'neutral', 'negative'].includes(data.sentiment)
      ? data.sentiment
      : 'neutral') as SentimentData['overall'];
    return {
      overall,
      confidence: 0.85,
      scores: {
        positive: overall === 'positive' ? 0.8 : 0.1,
        neutral:  overall === 'neutral'  ? 0.8 : 0.1,
        negative: overall === 'negative' ? 0.8 : 0.1,
      },
    };
  }
}

export const summaryService = new SummaryService();