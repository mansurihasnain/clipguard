// Shared logic: keyword matching + event logging. Loaded in content scripts,
// the popup, and any extension page.

var BLOCKED_NOTICE =
  "⛔ Blocked by ClipGuard: this clipboard content matched a confidential " +
  "keyword and was removed to prevent it being pasted into AI tools.";

var AI_SITE_HOSTS = [
  'chat.openai.com', 'chatgpt.com', 'claude.ai', 'gemini.google.com',
  'copilot.microsoft.com', 'www.perplexity.ai', 'poe.com', 'grok.com',
  'www.deepseek.com',
];

function isAISite(hostname) {
  hostname = (hostname || location.hostname || '').toLowerCase();
  return AI_SITE_HOSTS.some(function (h) {
    return hostname === h || hostname.endsWith('.' + h);
  }) || (hostname === 'www.bing.com' && location.pathname.indexOf('/chat') === 0);
}

// Return the first matching keyword, or null.
// Plain text: case-insensitive substring. Prefix with "re:" for regex.
function findMatch(text, keywords) {
  if (!text) return null;
  for (var i = 0; i < keywords.length; i++) {
    var kw = keywords[i].keyword || keywords[i];
    try {
      if (kw.toLowerCase().indexOf('re:') === 0) {
        if (new RegExp(kw.slice(3), 'i').test(text)) return kw;
      } else if (text.toLowerCase().indexOf(kw.toLowerCase()) !== -1) {
        return kw;
      }
    } catch (e) { /* bad regex — skip */ }
  }
  return null;
}

// ---- storage helpers ----

function getState(cb) {
  chrome.storage.local.get(['keywords', 'enforcement', 'events'], function (s) {
    cb({
      keywords: s.keywords || [],
      enforcement: s.enforcement || 'on',
      events: s.events || [],
    });
  });
}

function logEvent(keyword, preview, action) {
  chrome.storage.local.get(['events'], function (s) {
    var events = s.events || [];
    events.unshift({ id: Date.now(), ts: Date.now() / 1000, keyword: keyword, preview: (preview || '').slice(0, 80), action: action });
    if (events.length > 200) events = events.slice(0, 200);
    chrome.storage.local.set({ events: events });
  });
}
