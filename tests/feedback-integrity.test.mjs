import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

function client() {
  const calls = [];
  const window = {};
  vm.runInNewContext(readFileSync(new URL('../js/feedback.js', import.meta.url), 'utf8'), {
    window, location: { href: 'https://onholdlab.com/' }, navigator: { userAgent: 'test' },
    setTimeout, clearTimeout, AbortController,
    fetch: async (url, options) => { calls.push({url, body: JSON.parse(options.body)}); return { status: 201 }; }
  });
  return { send: window.OHLFeedback.send, calls };
}
test('oversize feedback is rejected without sending or silently truncating', async () => {
  const c = client();
  const result = await c.send({message: '字'.repeat(2001)});
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'invalid');
  assert.equal(c.calls.length, 0);
});
test('boundary-length feedback reaches D1 API unchanged', async () => {
  const c = client();
  const message = '字'.repeat(1998) + '😀';
  assert.equal((await c.send({message: '  ' + message + '  ', source: 'midterm-sim'})).ok, true);
  assert.equal(c.calls[0].url, 'https://ohl-api.onholdlab.workers.dev/feedback');
  assert.equal(c.calls[0].body.message, message);
  assert.equal(c.calls[0].body.source, 'midterm-sim');
});
