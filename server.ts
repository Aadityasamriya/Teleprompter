// Local development server only.
// Vercel production uses /api/ai/enhance.ts as a serverless function.
// Keep this file so the project can still be run with a traditional Node/Express setup if desired.
import express from 'express';
import path from 'node:path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MAX_TEXT_LENGTH = 20_000;

const instructions: Record<string, string> = {
  fix: 'Improve the script for clarity, flow, grammar, and natural spoken delivery. Preserve the original meaning. Provide only the rewritten text.',
  shorten: 'Rewrite the script to be concise and shorter without losing the main message. Provide only the rewritten text.',
  expand: 'Expand the script with useful detail and natural spoken delivery without adding unsupported claims. Provide only the rewritten text.',
  professional: 'Rewrite the script in a polished, confident, business-appropriate tone. Provide only the rewritten text.',
  engaging: 'Rewrite the script to be highly engaging for a modern YouTube/TikTok audience while preserving the core message. Provide only the rewritten text.',
};

app.use(express.json({ limit: '64kb' }));

app.post('/api/ai/enhance', async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  const mode = typeof req.body?.mode === 'string' ? req.body.mode : 'fix';

  if (!text) return res.status(400).json({ error: 'Text is required' });
  if (text.length > MAX_TEXT_LENGTH) return res.status(413).json({ error: 'Script is too long.' });
  if (!instructions[mode]) return res.status(400).json({ error: 'Invalid AI mode' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI service is not configured.' });

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'telemaster-pro' } },
    });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: text,
      config: { systemInstruction: `You are a professional teleprompter script editor. ${instructions[mode]}` },
    });
    const result = response.text?.trim();
    if (!result) return res.status(502).json({ error: 'AI returned an empty response.' });
    return res.json({ result });
  } catch (error) {
    console.error('AI enhancement failed:', error);
    return res.status(502).json({ error: 'The AI service could not process the script.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
