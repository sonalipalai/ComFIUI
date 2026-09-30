# How to Load UI Auditor as a Browser Extension

This application is ready to be used as a Chrome/Edge browser extension. It works **fully standalone** — no backend server needed. All AI calls go directly to the Gemini API from the extension.

## 1. Build the Project
First, generate the production build:
```bash
npm run build
```
This will create a `dist` folder in your project root with all extension files.

## 2. Open Browser Extensions Page
- In Chrome: Go to `chrome://extensions/`
- In Edge: Go to `edge://extensions/`

## 3. Enable Developer Mode
Toggle the **Developer mode** switch in the top right corner of the extensions page.

## 4. Load Unpacked Extension
1. Click the **Load unpacked** button.
2. Navigate to your project folder and select the `dist` directory.

## 5. Configure Your API Key
1. Right-click the **UI Auditor** extension icon in the toolbar.
2. Select **Options** (or go to the extension's details page and click "Extension options").
3. Enter your **Gemini API Key** (get one free from [Google AI Studio](https://aistudio.google.com/apikey)).
4. Click **Save API Key**.

## 6. Pin and Use
1. Click the puzzle icon (Extensions) in your browser toolbar.
2. Pin **UI Auditor**.
3. Open any website you want to audit.
4. Click the UI Auditor icon.
5. Upload your Figma design image.
6. Click **Capture Current Tab** to automatically grab the web implementation.
7. Click **Run UI Audit** to get your results!

---

### Permissions Note
The extension requires `activeTab` and `scripting` permissions to capture screenshots of the pages you are auditing. It also uses `storage` to securely save your API key locally, and connects to `generativelanguage.googleapis.com` for Gemini AI calls. All permissions are defined in the `manifest.json` file.
