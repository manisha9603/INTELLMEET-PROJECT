import type { MeetingSession } from '../types/meeting.types';

export class MeetingService {
  constructor() {}

  public async startSession(meetingId: string): Promise<MeetingSession> {
    console.log('[MeetingService] Starting session:', meetingId);
    return {
      id: meetingId,
      startedAt: Date.now(),
      status: 'live'
    };
  }

  public async endSession(meetingId: string): Promise<void> {
    console.log('[MeetingService] Ending session:', meetingId);
  }

  public async getSessionContext(meetingId: string): Promise<any> {
     console.log('[MeetingService] Fetching session context:', meetingId);
     return {};
  }
}

export const meetingService = new MeetingService();
