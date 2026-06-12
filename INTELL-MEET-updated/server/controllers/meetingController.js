import Meeting from '../models/Meeting.js';
import Task from '../models/Task.js';
import { processTranscription, generateMeetingInsights } from '../services/aiService.js';
import multer from 'multer';
import path from 'path';

// Multer setup for audio file uploads (for transcription)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `audio-${Date.now()}${path.extname(file.originalname)}`),
});
export const upload = multer({ storage });

export const createMeeting = async (req, res) => {
  const { title, description, scheduledAt } = req.body;
  try {
    const meeting = await Meeting.create({
      title,
      description,
      scheduledAt,
      hostId: req.user._id,
      participants: [req.user._id]
    });
    res.status(201).json(meeting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMeetingReport = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id).populate('participants hostId');
    if (meeting) {
      res.json(meeting);
    } else {
      res.status(404).json({ message: 'Meeting not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// WEEK 3: End meeting + trigger AI processing
export const endMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    meeting.status = 'Completed';

    // If an audio file was uploaded with this request, transcribe it
    if (req.file) {
      const audioPath = req.file.path;

      // Step 1: Whisper transcription
      const transcript = await processTranscription(audioPath);

      if (transcript) {
        meeting.transcript = transcript;

        // Step 2: GPT-4o insights
        const insights = await generateMeetingInsights(transcript, meeting.title);

        if (insights) {
          meeting.summary = insights.summary;

          // Step 3: Save action items as Tasks in DB
          if (insights.actionItems && insights.actionItems.length > 0) {
            const taskIds = [];
            for (const item of insights.actionItems) {
              const task = await Task.create({
                title: item.task,
                assignee: item.assignee,
                deadline: item.deadline,
                meetingId: meeting._id,
                status: 'Pending',
              });
              taskIds.push(task._id);
            }
            meeting.actionItems = taskIds;
          }
        }
      }
    }

    await meeting.save();

    res.json({
      message: 'Meeting ended and AI processing complete',
      meetingId: meeting._id,
      hasSummary: !!meeting.summary,
      hasTranscript: !!meeting.transcript,
      actionItemsCount: meeting.actionItems?.length || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
