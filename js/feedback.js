/* onholdlab 玩家回饋:所有網站與遊戲共用。
   用法:在頁面載入 https://onholdlab.github.io/js/feedback.js
         OHLFeedback.send({ source: 'crossroad-bump', kind: 'bug', message: '...', contact: '' })
           .then(r => r.ok ? 已收到 : 依 r.reason 顯示訊息)
   r.reason:not_configured / rate_limited / invalid / network / http_<狀態碼>
   後端是 Cloudflare Worker「ohl-api」+ D1 資料庫(程式在 onholdlab/ohl-api)。 */
window.OHLFeedback = (function () {
  /* 只要填這一行:ohl-api 部署後的網址,例如 https://ohl-api.xxxx.workers.dev */
  var CFG = { api: 'https://ohl-api.onholdlab.workers.dev' };

  function configured() { return !!CFG.api; }

  function send(o) {
    o = o || {};
    var msg = String(o.message || '').trim();
    if (!msg) return Promise.resolve({ ok: false, reason: 'invalid' });
    if (!configured()) return Promise.resolve({ ok: false, reason: 'not_configured' });
    var kinds = ['message', 'bug', 'idea', 'question'];
    var body = {
      source: String(o.source || 'home').slice(0, 40),
      kind: kinds.indexOf(o.kind) >= 0 ? o.kind : 'message',
      message: msg.slice(0, 2000),
      contact: o.contact ? String(o.contact).trim().slice(0, 200) || null : null,
      page: String(location.href).slice(0, 300),
      ua: String(navigator.userAgent).slice(0, 200)
    };
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
    return fetch(CFG.api.replace(/\/+$/, '') + '/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (r.status === 201 || r.status === 200) return { ok: true };
      if (r.status === 429) return { ok: false, reason: 'rate_limited' };
      if (r.status === 400) return { ok: false, reason: 'invalid' };
      return { ok: false, reason: 'http_' + r.status };
    }, function () {
      clearTimeout(timer);
      return { ok: false, reason: 'network' };
    });
  }

  return { send: send, configured: configured, config: CFG };
})();
