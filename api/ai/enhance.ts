import { GoogleGenAI } from '@google/genai';

const MAX_TEXT_LENGTH = 20_000;
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const rateLimit = new Map<string, { count: number; resetAt: number }>();

type RequestLike = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  statusCode: number;
  setHeader: (name: string, value: string | number) => void;
  end: (body?: string) => void;
};

const instructions: Record<string, string> = {
  fix: 'Improve the script for clarity, flow, grammar, and natural spoken delivery. Preserve the original meaning. Provide only the rewritten text.',
  shorten: 'Rewrite the script to be concise and shorter without losing the main message. Preserve important facts. Provide only the rewritten text.',
  expand: 'Expand the script with useful detail, stronger transitions, and natural spoken delivery without adding unsupported claims. Provide only the rewritten text.',
  professional: 'Rewrite the script in a polished, confident, business-appropriate tone while keeping it natural to speak aloud. Provide only the rewritten text.',
  engaging: 'Rewrite the script to be highly engaging for a modern YouTube/TikTok audience. Improve the hook, pacing, and spoken energy without using clickbait or changing the core message. Provide only the rewritten text.',
};

function json(res: ResponseLike, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function getClientKey(req: RequestLike) {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return 'anonymous';
}

function allowedRequest(req: RequestLike, res: ResponseLike) {
  const key = getClientKey(req);
  const now = Date.now();
  const current = rateLimit.get(key);

  if (!current || now >= current.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
    json(res, 429, { error: 'Too many AI requests. Please try again in a minute.' });
    return false;
  }

  current.count += 1;
  return true;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  if (!allowedRequest(req, res)) return;

  const body = (req.body ?? {}) as { text?: unknown; mode?: unknown };
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const mode = typeof body.mode === 'string' ? body.mode : 'fix';

  if (!text) return json(res, 400, { error: 'Text is required' });
  if (text.length > MAX_TEXT_LENGTH) {
    return json(res, 413, { error: `Script is too long. Maximum is ${MAX_TEXT_LENGTH.toLocaleString()} characters.` });
  }
  if (!instructions[mode]) return json(res, 400, { error: 'Invalid AI mode' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not configured');
    return json(res, 503, { error: 'AI service is not configured.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'telemaster-pro' } },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: text,
      config: { systemInstruction: `You are a professional teleprompter script editor. ${instructions[mode]}` },
    });

    const result = response.text?.trim();
    if (!result) return json(res, 502, { error: 'AI returned an empty response.' });

    return json(res, 200, { result });
  } catch (error) {
    console.error('AI enhancement failed:', error);
    return json(res, 502, { error: 'The AI service could not process the script. Please try again.' });
  }
}
