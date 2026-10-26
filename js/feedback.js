/* onholdlab 共用回饋：首頁與所有遊戲都載入這支檔案，資料寫進 Supabase 的 feedback 表。
   這兩個值本來就是公開的（publishable key 只能新增、不能讀），可以放在網頁裡。
   用法：onholdFeedback.send({source:'home', kind:'idea', message:'...', contact:'IG @x'}) → Promise<{ok, reason}> */
(function () {
  var URL = 'https://zfghylavaxulytlbbxqi.supabase.co';
  var KEY = 'sb_publishable_13fkPXai231g3G0JU4mWhA_G_hctIxL';
  var KINDS = ['message', 'bug', 'idea', 'question'];

  function send(o) {
    o = o || {};
    var msg = String(o.message || '').trim();
    if (!msg) return Promise.resolve({ ok: false, reason: 'empty' });
    var body = {
      source: String(o.source || 'home').slice(0, 40),
      kind: KINDS.indexOf(o.kind) >= 0 ? o.kind : 'message',
      message: msg.slice(0, 2000),
      page: location.href.slice(0, 300)
    };
    var c = String(o.contact || '').trim();
    if (c) body.contact = c.slice(0, 200);
    return fetch(URL + '/rest/v1/feedback', {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify(body)
    }).then(function (r) {
      if (r.ok) return { ok: true };
      return { ok: false, reason: 'server', status: r.status };
    }, function () { return { ok: false, reason: 'offline' }; });
  }

  window.onholdFeedback = { send: send };
})();
