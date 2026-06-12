import type { Participant } from '../types/meeting.types';

export class ParticipantService {
  constructor() {}

  public async fetchParticipants(meetingId: string): Promise<Participant[]> {
    console.log('[ParticipantService] Fetching participants for meeting:', meetingId);
    return [];
  }

  public async updateParticipantStatus(participantId: string, updates: Partial<Participant>): Promise<void> {
    console.log('[ParticipantService] Updating status for:', participantId, updates);
  }
}

export const participantService = new ParticipantService();
