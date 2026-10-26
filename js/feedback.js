/* onholdlab 玩家回饋:所有網站與遊戲共用。
   用法:在頁面載入 https://onholdlab.github.io/js/feedback.js
         OHLFeedback.send({ source: 'crossroad-bump', kind: 'bug', message: '...', contact: '' })
           .then(r => r.ok ? 已收到 : 依 r.reason 顯示訊息)
   r.reason:not_configured / rate_limited / invalid / network / http_<狀態碼> */
window.OHLFeedback = (function () {
  /* 只要填這兩行。key 用 Supabase 的「publishable」或舊版「anon」公開金鑰,不能用 service_role / secret。 */
  var CFG = {
    url: 'https://zfghylavaxulytlbbxqi.supabase.co',   // 例如 https://abcdefgh.supabase.co
    key: 'sb_publishable_13fkPXai231g3G0JU4mWhA_G_hctIxL'    // 例如 sb_publishable_xxx 或 eyJhbGciOi...
  };

  function configured() { return !!(CFG.url && CFG.key); }

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
    var headers = { 'Content-Type': 'application/json', 'apikey': CFG.key, 'Prefer': 'return=minimal' };
    if (CFG.key.indexOf('sb_') !== 0) headers.Authorization = 'Bearer ' + CFG.key; // 舊版 anon JWT 要帶
    var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
    return fetch(CFG.url.replace(/\/+$/, '') + '/rest/v1/feedback', {
      method: 'POST', headers: headers, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (r.status === 201 || r.status === 204) return { ok: true };
      return r.text().then(function (t) {
        if (/rate_limited/.test(t)) return { ok: false, reason: 'rate_limited' };
        if (r.status === 400 || /check constraint/.test(t)) return { ok: false, reason: 'invalid' };
        return { ok: false, reason: 'http_' + r.status };
      }, function () { return { ok: false, reason: 'http_' + r.status }; });
    }, function () {
      clearTimeout(timer);
      return { ok: false, reason: 'network' };
    });
  }

  return { send: send, configured: configured, config: CFG };
})();
