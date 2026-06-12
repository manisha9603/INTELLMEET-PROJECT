export class RecordingService {
  private isRecording: boolean = false;

  constructor() {}

  public async startRecording(meetingId: string): Promise<boolean> {
    console.log('[RecordingService] Starting recording for:', meetingId);
    this.isRecording = true;
    return true;
  }

  public async stopRecording(meetingId: string): Promise<boolean> {
    console.log('[RecordingService] Stopping recording for:', meetingId);
    this.isRecording = false;
    return true;
  }

  public getStatus(): boolean {
    return this.isRecording;
  }
}

export const recordingService = new RecordingService();
