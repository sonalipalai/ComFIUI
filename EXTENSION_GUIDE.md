# UI Auditor — Browser Extension Guide

The extension works **fully standalone**: no backend server needed. AI calls go straight from the extension to the [OpenRouter](https://openrouter.ai) API using the key you save on the Options page.

## 1. Build
```bash
npm install
npm run build
```
This creates `dist/` containing `manifest.json`, `index.html` (the popup), `options.html`, icons and assets.

## 2. Load it (for yourself / testing)
1. Go to `chrome://extensions/` (Edge: `edge://extensions/`, Brave: `brave://extensions/`).
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the `dist` folder.
4. After code changes, run `npm run build` again and click the **↻ reload** icon on the extension card.

## 3. Configure OpenRouter
1. Right-click the **UI Auditor** toolbar icon → **Options**.
2. Paste your **OpenRouter API key** (create one at https://openrouter.ai/keys and add a few dollars of credit).
3. Optional: enter a different **model** slug, any vision-capable model from https://openrouter.ai/models?input_modalities=image. Leave blank for `openai/gpt-5.6-luna`.
4. Click **Save Settings**.

## 4. Use
1. Pin UI Auditor from the puzzle-piece menu.
2. Open the page you want to audit and click the icon.
3. Upload the Figma export, click **Capture Current Tab**, then **Run UI Audit**.

## 5. Share it without the store
- Run `npm run zip:ext` to get `ui-auditor-extension.zip`.
- Teammates unzip it and use **Load unpacked** (step 2). Each person enters their own OpenRouter key.

## 6. Publish to the Chrome Web Store
1. Register at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) (one-time US$5 fee).
2. Bump `"version"` in `public/manifest.json` for every upload, then run `npm run zip:ext`.
3. In the dashboard, click **New item** and upload `ui-auditor-extension.zip`. The zip must contain `manifest.json` at its root, which the script already handles.
4. Fill in the listing: description, 128×128 icon, at least one 1280×800 screenshot, and category (Developer Tools).
5. **Privacy tab:** say that screenshots and uploaded images are sent to OpenRouter for analysis, that the API key is stored locally in `chrome.storage`, and that no data is sold. You'll need a public **privacy policy URL** (a GitHub Pages or Notion page is fine).
6. **Permission justifications:**
   - `activeTab` / `tabs`: capture a screenshot of the current tab for comparison
   - `storage`: save the user's OpenRouter API key and model choice
   - host `https://openrouter.ai/*`: send images to the AI model for analysis
7. Submit for review. It usually takes a few days. Updates go through the same steps with a higher version number.

**Microsoft Edge Add-ons:** upload the same zip at https://partner.microsoft.com/dashboard/microsoftedge (free developer account).

## Permissions
Defined in `public/manifest.json`: `activeTab`, `tabs`, `storage`, and host access to `https://openrouter.ai/*`. The CSP allows network connections only to OpenRouter.
