function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function refresh() {
  getState(function (s) {
    document.getElementById('enforcementState').textContent =
      s.enforcement === 'on'
        ? '🟢 ON — flagged copies are sanitized'
        : '🟡 OFF — matches are only logged';

    document.getElementById('kwList').innerHTML = s.keywords.map(function (k, i) {
      var kw = typeof k === 'string' ? k : k.keyword;
      return '<li><code>' + esc(kw) + '</code><button class="danger" data-i="' + i + '">Delete</button></li>';
    }).join('');

    document.querySelectorAll('#kwList button').forEach(function (b) {
      b.onclick = function () {
        getState(function (s2) {
          s2.keywords.splice(+b.dataset.i, 1);
          chrome.storage.local.set({ keywords: s2.keywords }, refresh);
        });
      };
    });

    document.getElementById('evBody').innerHTML = s.events.map(function (e) {
      var cls = e.action === 'logged_only' ? 'ok' : 'blocked';
      return '<tr><td>' + new Date(e.ts * 1000).toLocaleString() + '</td><td><code>' +
        esc(e.keyword) + '</code></td><td>' + esc(e.preview) + '</td><td class="' + cls + '">' +
        esc(e.action) + '</td></tr>';
    }).join('');
  });
}

document.getElementById('addBtn').onclick = function () {
  var v = document.getElementById('kwInput').value.trim();
  if (!v) return;
  getState(function (s) {
    var kws = s.keywords.map(function (k) { return typeof k === 'string' ? k : k.keyword; });
    if (kws.indexOf(v) === -1) kws.push(v);
    chrome.storage.local.set({ keywords: kws.map(function (k) { return { keyword: k, created_at: Date.now() / 1000 }; }) }, function () {
      document.getElementById('kwInput').value = '';
      refresh();
    });
  });
};

document.getElementById('toggleBtn').onclick = function () {
  getState(function (s) {
    chrome.storage.local.set({ enforcement: s.enforcement === 'on' ? 'off' : 'on' }, refresh);
  });
};

document.getElementById('clearBtn').onclick = function () {
  chrome.storage.local.set({ events: [] }, refresh);
};

document.getElementById('kwInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') document.getElementById('addBtn').click();
});

chrome.storage.onChanged.addListener(refresh);
refresh();
