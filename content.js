// Content script:
//  - copy/cut of matching text  -> sanitize clipboard (enforcement ON) or log (OFF)
//  - paste on AI sites          -> block matching text outright

var cgKeywords = [];
var cgEnforcement = 'on';

function refreshState() {
  getState(function (s) {
    cgKeywords = s.keywords.map(function (k) { return typeof k === 'string' ? { keyword: k } : k; });
    cgEnforcement = s.enforcement;
  });
}
refreshState();
chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === 'local' && (changes.keywords || changes.enforcement)) refreshState();
});

document.addEventListener('copy', function (e) {
  var text = (window.getSelection() || '').toString();
  var match = findMatch(text, cgKeywords);
  if (!match) return;
  if (cgEnforcement === 'on') {
    e.preventDefault();
    e.clipboardData.setData('text/plain', BLOCKED_NOTICE);
    logEvent(match, text, 'blocked_clipboard');
  } else {
    logEvent(match, text, 'logged_only');
  }
}, true);

document.addEventListener('cut', function (e) {
  var text = (window.getSelection() || '').toString();
  var match = findMatch(text, cgKeywords);
  if (!match) return;
  if (cgEnforcement === 'on') {
    e.preventDefault();
    e.clipboardData.setData('text/plain', BLOCKED_NOTICE);
    logEvent(match, text, 'blocked_clipboard');
  } else {
    logEvent(match, text, 'logged_only');
  }
}, true);

document.addEventListener('paste', function (e) {
  if (!isAISite(location.hostname)) return;
  var text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
  var match = findMatch(text, cgKeywords);
  if (!match) return;
  e.preventDefault();
  e.stopPropagation();
  logEvent(match, text, 'blocked_paste');
  alert('🚫 ClipGuard blocked this paste.\nMatched confidential keyword: "' + match + '"');
}, true);
