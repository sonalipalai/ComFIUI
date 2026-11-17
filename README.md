# UI Auditor

Compare a Figma design against a live web page with an AI vision model (via [OpenRouter](https://openrouter.ai)) and get a list of layout, spacing, typography and styling fixes.

It runs two ways:

| Mode | Where the API key lives | How AI is called |
|---|---|---|
| **Chrome/Edge extension** (`dist/`) | Extension Options page (`chrome.storage.sync`) | Directly from the extension to OpenRouter |
| **Web app** (`server.ts`) | `OPENROUTER_API_KEY` env var on the server | Browser → Express `/api/*` → OpenRouter |

Default model: `openai/gpt-5.6-luna`. Any vision-capable model from [openrouter.ai/models](https://openrouter.ai/models?input_modalities=image) works (e.g. `google/gemini-…`, `anthropic/claude-…`).

## Run locally (web app)

Prerequisite: Node.js 20+

```bash
npm install
cp .env.example .env.local     # then put your OpenRouter key in it
npm run dev                    # http://localhost:3000
```

`.env.local`:
```
OPENROUTER_API_KEY="sk-or-v1-..."
# OPENROUTER_MODEL="openai/gpt-5.6-luna"   # optional
```

## Build & load the extension

```bash
npm run build          # outputs dist/
```
Then `chrome://extensions` → **Developer mode** → **Load unpacked** → pick `dist/`. Open the extension's **Options** and paste your OpenRouter key. Full steps, including publishing to the Chrome Web Store, are in [EXTENSION_GUIDE.md](EXTENSION_GUIDE.md).

## Host the web app

The Express server serves the built frontend and proxies AI calls, so your key never reaches the browser.

```bash
npm install
npm run build
npm start              # NODE_ENV=production, listens on $PORT (default 3000)
```

Any Node host works. On **Render / Railway / Fly.io / Google Cloud Run**:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Environment variables:** `OPENROUTER_API_KEY` (required), `OPENROUTER_MODEL` (optional), `APP_URL` (optional, your public URL)
- The server reads `PORT` from the environment automatically.

> Static-only hosts (Netlify, GitHub Pages, Vercel static) won't work on their own: the web mode needs the `/api/audit` and `/api/chat` server routes.
