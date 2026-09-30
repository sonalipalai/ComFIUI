import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware for parsing large image payloads in JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// OpenRouter configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL_NAME = 'openai/gpt-5.6-luna';

/**
 * Helper: call OpenRouter API (OpenAI-compatible chat completions).
 */
async function callOpenRouter(messages: any[]): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://ui-auditor.app',
      'X-Title': 'UI Auditor',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

/**
 * Ensures a base64 string has the data URL prefix for OpenAI vision format.
 */
function ensureDataUrl(imageData: string): string {
  if (imageData.startsWith('data:')) return imageData;
  return `data:image/png;base64,${imageData}`;
}

// API endpoint to run UI comparison audit
app.post('/api/audit', async (req: Request, res: Response) => {
  try {
    const { figmaImage, webImage } = req.body;

    if (!figmaImage || !webImage) {
      res.status(400).json({ error: 'Both figmaImage and webImage are required.' });
      return;
    }

    const prompt = `
You are a Senior Frontend Developer, QA Engineer, and Pixel-Perfect UI Auditor.
Compare the Figma Design Source (Image 1) against the Live Web Implementation (Image 2).

Analysis Criteria:
- Layout (Flexbox/Grid structure, alignment, widths, overflows)
- Spacing (Padding, Margins, Gap, component distribution)
- Typography (Font family, size, weight, line-height, letter-spacing, hierarchy)
- Visuals & Styling (Colors, background fills, border-radius, shadows, borders, opacity)

Required Output Format:
Provide a clear, structured markdown report with actionable implementation fixes.
Structure:

## 🛠 Required Implementation Changes

### [Component Name]
* **Layout:** [Specific instruction or CSS rule]
* **Spacing:** [Specific instruction]
* **Typography:** [Specific instruction]
* **Visuals:** [Specific instruction]

... repeat for any other components that have discrepancies.

Conclude with a short "⚡ Priority Fixes" summary highlighting the top 2-3 most noticeable visual gaps.
`;

    const result = await callOpenRouter([
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: { url: ensureDataUrl(figmaImage) },
          },
          {
            type: 'image_url',
            image_url: { url: ensureDataUrl(webImage) },
          },
        ],
      },
    ]);

    res.json({ result: result || 'No discrepancies found. Design implementation matches.' });
  } catch (error: any) {
    console.error('Audit generation error:', error);
    res.status(500).json({ 
      error: error?.message || 'Failed to execute UI audit. Please ensure your OpenRouter API key is valid.' 
    });
  }
});

// API endpoint for contextual chat
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, figmaImage, webImage, auditResult } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const systemMessage = `
You are an expert Frontend Architect and Design System Specialist.
You have the full context of a Figma source design, a live web implementation screenshot, and the UI audit results.

${auditResult ? `CURRENT AUDIT REPORT CONTEXT:\n${auditResult}\n` : ''}

Your goal is to help the user resolve all UI discrepancies quickly and precisely.
- Provide concrete CSS code snippets, preferably using Tailwind CSS.
- Explain exact pixel / rem values or standard Tailwind spacing classes (e.g. p-4, gap-3, rounded-2xl).
- Keep responses concise, clean, and developer-friendly.
`;

    const openAiMessages: any[] = [
      { role: 'system', content: systemMessage },
    ];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const role = msg.role === 'model' ? 'assistant' : 'user';

      if (i === 0 && role === 'user') {
        const contentParts: any[] = [];
        if (figmaImage) {
          contentParts.push({
            type: 'image_url',
            image_url: { url: ensureDataUrl(figmaImage) },
          });
          contentParts.push({ type: 'text', text: 'Context: Figma Design source image' });
        }
        if (webImage) {
          contentParts.push({
            type: 'image_url',
            image_url: { url: ensureDataUrl(webImage) },
          });
          contentParts.push({ type: 'text', text: 'Context: Live Web Implementation image' });
        }
        contentParts.push({ type: 'text', text: msg.content || '' });
        openAiMessages.push({ role, content: contentParts });
      } else {
        openAiMessages.push({ role, content: msg.content || '' });
      }
    }

    const result = await callOpenRouter(openAiMessages);
    res.json({ text: result });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: error?.message || 'Failed to process chat message.' 
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
