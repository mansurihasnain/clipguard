# 🛡️ ClipGuard (standalone extension)

Same protection as the Python ClipGuard, but with **no dashboard and no
localhost app** — keywords, enforcement toggle, and the event log all live
inside the extension.

## What it does

- **Copy/cut guard** (all pages): when you copy text matching a keyword,
  the clipboard is replaced with a warning (enforcement ON), or the match
  is only logged (enforcement OFF).
- **Paste guard** (AI sites: ChatGPT, Claude, Gemini, Copilot, Perplexity,
  Poe, Bing Chat, Grok, DeepSeek): pasting matching text is blocked.
- **Popup UI**: click the ClipGuard toolbar icon to add/remove keywords,
  toggle enforcement, and review/clear the event log.

## Install

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this `standalone-extension/` folder

## Keywords

- Plain text: case-insensitive substring (e.g. `project phoenix`)
- Regex: prefix with `re:` (e.g. `re:\b\d{16}\b`)

## Notes

- Unlike the Python daemon, the extension can't watch clipboard copies made
  *outside* the browser (desktop apps, other OS clipboard tools). Copy
  events inside web pages are covered.
- Everything is stored locally in `chrome.storage.local`.
"# clipguard" 
# clipguard
