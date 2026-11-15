import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 規格：開發日誌裡「只有文字」的手寫筆記改用打字呈現；畫的圖（草稿）才放手寫圖片。
const html = readFileSync(new URL('../devlog/index.html', import.meta.url), 'utf8');
const note = id => {
  const m = html.match(new RegExp(`<(figure|div)[^>]*data-note="${id}"[\\s\\S]*?</\\1>`));
  assert.ok(m, `note ${id} exists`);
  return m[0];
};
const strip = s => s.replace(/<[^>]+>/g, '');

test('text-only notes are typed, not images', () => {
  for (const id of ['standard', 'why']) {
    const n = note(id);
    assert.doesNotMatch(n, /<img/, `${id} should be typed text`);
    assert.match(n, /class="note text"/);
  }
  assert.match(strip(note('standard')), /把當時的喜好保存下來/);
  assert.match(strip(note('why')), /不同畫師接力的影片/);
});

test('drawn sketch stays a handwritten image', () => {
  assert.match(note('sketch'), /<img src="img\/relay-sketch\.webp"/);
});
