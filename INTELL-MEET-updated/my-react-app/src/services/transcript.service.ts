import type { TranscriptChunk } from '../types/ai.types';

export class TranscriptService {
  private buffer: TranscriptChunk[] = [];

  constructor() {}

  public async processAudioChunk(audioData: Blob): Promise<TranscriptChunk | null> {
    // Stub: send to Whisper / Speech-to-Text APi
    console.log('[TranscriptService] Processing audio chunk...', audioData.size);
    return null;
  }

  public flushBuffer(): TranscriptChunk[] {
    const data = [...this.buffer];
    this.buffer = [];
    return data;
  }

  public async retryChunk(chunkId: string): Promise<boolean> {
    // Stub: Retry processing a failed chunk
    console.log('[TranscriptService] Retrying chunk processing:', chunkId);
    return true;
  }
}

export const transcriptService = new TranscriptService();
