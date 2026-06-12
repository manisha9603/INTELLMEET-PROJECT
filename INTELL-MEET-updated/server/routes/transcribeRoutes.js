import express from 'express';
import multer from 'multer';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ Save file WITH .webm extension so Groq recognizes it
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `audio_${Date.now()}.webm`);
  },
});
const upload = multer({ storage });

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file required' });
    }
    console.log('📁 File info:', req.file.filename, req.file.size, 'bytes');
    console.log('🎙️ Transcribing audio:', req.file.filename);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-large-v3',
      language: 'en',
    });

    fs.unlinkSync(req.file.path);

    console.log('✅ Transcription:', transcription.text);
    res.json({ success: true, text: transcription.text });

  } catch (error) {
    console.error('❌ Transcription error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;