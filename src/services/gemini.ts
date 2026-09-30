/**
 * OpenRouter API service for UI Auditor.
 * Calls OpenRouter (OpenAI-compatible) API directly — no backend server needed in extension mode.
 * Uses GPT 5.6 Luna via OpenRouter.
 * The API key is stored in chrome.storage.sync via the options page.
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL_NAME = 'openai/gpt-5.6-luna';

/**
 * Retrieves the stored OpenRouter API key from chrome.storage.
 * Must be configured via the extension Options page.
 */
async function getApiKey(): Promise<string> {
  if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['openrouterApiKey'], (result) => {
        if (result.openrouterApiKey) {
          resolve(result.openrouterApiKey);
        } else {
          reject(new Error('No API key configured. Please set your OpenRouter API key in the extension options (right-click the extension icon → Options).'));
        }
      });
    });
  }
  throw new Error('Chrome storage not available. Please use the extension in a supported browser.');
}

/**
 * Checks if we're running inside a Chrome extension context.
 */
function isExtensionContext(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.sync;
}

/**
 * Ensures a data URL has the proper prefix for OpenAI vision format.
 */
function ensureDataUrl(imageData: string): string {
  if (imageData.startsWith('data:')) return imageData;
  return `data:image/png;base64,${imageData}`;
}

/**
 * Makes a direct OpenRouter API call (OpenAI chat completions format).
 */
async function callOpenRouterAPI(params: {
  apiKey: string;
  messages: any[];
}): Promise<string> {
  const { apiKey, messages } = params;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://ui-auditor.extension',
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
    const message = errorData?.error?.message || `OpenRouter API error: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || 'No response generated.';
}

// ─── Public API ──────────────────────────────────────────────────────

export async function runUIAudit(figmaImageBase64: string, webImageBase64: string): Promise<string> {
  // Extension mode: call OpenRouter API directly
  if (isExtensionContext()) {
    const apiKey = await getApiKey();
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

    return callOpenRouterAPI({
      apiKey,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: ensureDataUrl(figmaImageBase64) },
            },
            {
              type: 'image_url',
              image_url: { url: ensureDataUrl(webImageBase64) },
            },
          ],
        },
      ],
    });
  }

  // Web mode fallback: call the Express backend
  const response = await fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      figmaImage: figmaImageBase64,
      webImage: webImageBase64,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  const data = await response.json();
  return data.result || 'No discrepancies found.';
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function sendChatMessage(params: {
  messages: ChatMessage[];
  figmaImage: string | null;
  webImage: string | null;
  auditResult: string | null;
}): Promise<string> {
  const { messages, figmaImage, webImage, auditResult } = params;

  // Extension mode: call OpenRouter API directly
  if (isExtensionContext()) {
    const apiKey = await getApiKey();

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

    // Build the first user message with image context
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const role = msg.role === 'model' ? 'assistant' : 'user';

      if (i === 0 && role === 'user') {
        // Attach images to the first user message
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

    return callOpenRouterAPI({
      apiKey,
      messages: openAiMessages,
    });
  }

  // Web mode fallback: call the Express backend
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  const data = await response.json();
  return data.text || '';
}
