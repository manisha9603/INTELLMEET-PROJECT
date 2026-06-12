import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/ai/ask
router.post('/ask', async (req, res) => {
  try {
    const { question, transcript } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    console.log('🤖 AI Question:', question);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an AI meeting assistant. You help users understand their meeting content.
${transcript ? `Here is the meeting transcript:\n${transcript}` : 'No transcript available yet.'}
Answer questions clearly and concisely.`,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      max_tokens: 500,
      stream: true,
    });

    // Stream response to frontend
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of response) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) res.write(text);
    }

    res.end();
    console.log('✅ AI response streamed');

  } catch (error) {
    console.error('❌ AI ask error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;