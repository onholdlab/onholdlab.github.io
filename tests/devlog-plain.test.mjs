import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 規格（2026-11-16）：開發日誌先拿掉「句子反應」功能，只放筆記和手繪草稿。
// 設計規則：沒有任何框，也沒有任何底線（連結、焦點、強調都不用底線）；鍵盤焦點用變色表示。
const html = readFileSync(new URL('../devlog/index.html', import.meta.url), 'utf8');
const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];

test('no reaction feature: no clickable phrases, reaction panel or reaction script', () => {
  assert.doesNotMatch(html, /PHRASES|REACTIONS|id="sheet"|class="ph/);
  assert.doesNotMatch(html, /<mark/);
  assert.doesNotMatch(html, /反應/);
});

test('no boxes: no shadows, fixed panels, fills, rounded panels or outlines', () => {
  assert.doesNotMatch(css, /box-shadow|position:fixed|linear-gradient|mix-blend-mode|border-radius/);
  assert.doesNotMatch(css, /outline:(?!none)/);
});

test('no underlines anywhere; links have text-decoration:none and focus is shown by colour', () => {
  assert.doesNotMatch(html, /text-decoration:underline|text-underline-offset|border-bottom/);
  assert.match(css, /(^|[}\s])a\{[^}]*text-decoration:none/);
  assert.match(css, /:focus-visible\{[^}]*outline:none[^}]*color:var\(--accent\)/);
});

test('the sketch is still shown as the handwritten image, with nothing drawn on it', () => {
  const fig = html.match(/<figure class="note" data-note="sketch">[\s\S]*?<\/figure>/)[0];
  assert.match(fig, /<img src="img\/relay-sketch\.webp"/);
  assert.doesNotMatch(fig, /<button|<mark/);
});
