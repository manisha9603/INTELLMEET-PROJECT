import Groq from 'groq-sdk';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const withRetry = async (fn, retries = 3, delayMs = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isLast = i === retries - 1;
      const isRetryable = err?.status === 429 || err?.status >= 500;
      if (isLast || !isRetryable) throw err;
      await sleep(delayMs * 2 ** i);
    }
  }
};

// ────────────────────────────────────────
// WEEK 3: Transcribe audio using Whisper (Groq)
// ────────────────────────────────────────
export const processTranscription = async (audioFilePath, language = 'en') => {
  // Guard: file must exist before streaming
  if (!fs.existsSync(audioFilePath)) {
    throw Object.assign(new Error(`Audio file not found: ${audioFilePath}`), { code: 'FILE_NOT_FOUND' });
  }

  try {
    const transcription = await withRetry(() =>
      groq.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-large-v3',
        language,
      })
    );
    console.log('✅ Transcription complete');
    return transcription.text;
  } catch (error) {
    const code = error.status === 429 ? 'RATE_LIMITED' : 'TRANSCRIPTION_FAILED';
    console.error(`❌ Transcription Error [${code}]:`, error.message);
    throw Object.assign(error, { code });
  } finally {
    // Always clean up the temp file
    try { fs.unlinkSync(audioFilePath); } catch (_) {}
  }
};

// Validate + fill defaults so callers never crash on .map()
const normalizeInsights = (raw) => ({
  summary:      typeof raw.summary === 'string'     ? raw.summary     : '',
  actionItems:  Array.isArray(raw.actionItems)       ? raw.actionItems : [],
  sentiment:    ['positive','neutral','negative'].includes(raw.sentiment) ? raw.sentiment : 'neutral',
  keyDecisions: Array.isArray(raw.keyDecisions)      ? raw.keyDecisions : [],
  topics:       Array.isArray(raw.topics)            ? raw.topics      : [],
});

const MAX_TRANSCRIPT_CHARS = 60_000; // ~15k tokens, safe under Groq limits

// ────────────────────────────────────────────────
// WEEK 3: Generate meeting insights using Groq LLaMA
// Returns: { summary, actionItems, sentiment, keyDecisions, topics }
// ────────────────────────────────────────────────
export const generateMeetingInsights = async (transcript, meetingTitle) => {
  if (!transcript?.trim()) {
    throw Object.assign(new Error('Transcript is empty'), { code: 'EMPTY_TRANSCRIPT' });
  }

  // Warn + truncate rather than silently hitting token limits
  let safeTranscript = transcript;
  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    console.warn(`⚠️ Transcript truncated from ${transcript.length} to ${MAX_TRANSCRIPT_CHARS} chars`);
    safeTranscript = transcript.slice(0, MAX_TRANSCRIPT_CHARS) + '\n\n[transcript truncated]';
  }

  try {
    const response = await withRetry(() =>
      groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are an AI meeting assistant. Analyze the meeting transcript and return a JSON object with exactly these keys:
{
  "summary": "2-3 sentence overview of what was discussed",
  "actionItems": [
    { "task": "task description", "assignee": "person name or Unknown", "deadline": "mentioned deadline or null" }
  ],
  "sentiment": "positive | neutral | negative",
  "keyDecisions": ["decision 1", "decision 2"],
  "topics": ["topic 1", "topic 2"]
}
Return ONLY valid JSON, no extra text.`,
          },
          {
            role: 'user',
            content: `Meeting Title: ${meetingTitle}\n\nTranscript:\n${safeTranscript}`,
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      })
    );

    const raw = JSON.parse(response.choices[0].message.content);
    const insights = normalizeInsights(raw);
    console.log('✅ Meeting insights generated');
    return insights;
  } catch (error) {
    const code = error.status === 429 ? 'RATE_LIMITED' : 'INSIGHT_GENERATION_FAILED';
    console.error(`❌ Insight Generation Error [${code}]:`, error.message);
    throw Object.assign(error, { code });
  }
};