import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 規格：開發日誌沒有任何框。可點的句子只換文字顏色（不用底色色塊）；
// 反應直接展開在筆記下方，沒有底色、邊線、陰影的面板；手繪草稿上不疊任何色塊，
// 草稿裡可點的句子列成圖下的一行文字。
const html = readFileSync(new URL('../devlog/index.html', import.meta.url), 'utf8');
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const script = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/)[1];
const rule = sel => [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(m => m[1].split(',').some(s => s.trim().startsWith(sel))).map(m => m[2]).join(';');

test('no shadows, fixed panels, fills or blend boxes anywhere on the page', () => {
  assert.doesNotMatch(css, /box-shadow/);
  assert.doesNotMatch(css, /position:fixed/);
  assert.doesNotMatch(css, /linear-gradient|mix-blend-mode/);
  for (const sel of ['.ph', '#sheet', '#shut', '.rx', '.quote', '.crop']) {
    assert.doesNotMatch(rule(sel), /background(?!:none)|border|box-shadow/, `${sel} has no fill, border or rounded box`);
  }
});

test('clickable phrases are shown by text colour only; keyboard focus is an underline, not an outline box', () => {
  assert.match(rule('.ph.tx'), /color:var\(--accent\)/);
  assert.match(rule('.ph.tx:focus-visible'), /outline:none/);
  assert.match(rule('.ph.tx:focus-visible'), /text-decoration:underline/);
});

test('the sketch has no overlays; its phrases are a line of text under it', () => {
  assert.doesNotMatch(script, /style\.cssText=`left:/);
  const after = html.slice(html.indexOf('data-note="sketch"'));
  for (const label of ['24小時內提交', '上一棒尾巴，右邊接著畫', '看歷史畫卷']) {
    assert.match(after, new RegExp(`<mark class="ph tx"[^>]*>${label}</mark>`));
  }
});
