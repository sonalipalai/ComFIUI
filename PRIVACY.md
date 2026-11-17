# UI Auditor: Privacy Policy

_Last updated: November 18, 2026_

UI Auditor is a browser extension that compares a design image with a screenshot of a web page and reports visual differences.

## What data the extension handles
- **Images you provide:** the design image you upload and the screenshot of the current tab that you choose to capture.
- **Chat messages** you type in the extension's Chat tab.
- **Your OpenRouter API key and model choice.** You enter these on the Options page.

## How the data is used
- The images and chat messages are sent over HTTPS to the OpenRouter API (https://openrouter.ai) **only when you click "Run UI Audit" or send a chat message**, so the AI model can analyse them. OpenRouter forwards the request to the model provider you selected. Their handling of the data is covered by the [OpenRouter Privacy Policy](https://openrouter.ai/privacy).
- Your API key and model choice are stored with `chrome.storage.sync` in your browser and are sent only to OpenRouter, to authenticate your requests.

## What we do NOT do
- We do not run any server of our own that receives your data.
- We do not collect analytics, browsing history or personal information.
- We do not sell, rent or share your data with anyone other than OpenRouter as described above.
- Screenshots are taken only when you click **Capture Current Tab**. Nothing is captured in the background.

## Removing your data
To remove your stored API key, uninstall the extension or clear the key on its Options page.

## Contact
Questions: open an issue at https://github.com/sonalipalai/ComFIUI/issues
