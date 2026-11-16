import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 規格（對齊線上）：首頁的 ONHOLDNEWS 入口跟著語言切換。
// 中文連到 weekly/，其他語言連到英文版 weekly/en/，標題與說明也換成對應語言。
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('ONHOLDNEWS entry has ids the language switch can update', () => {
  assert.match(html, /<a class="onn" id="onnLink" href="weekly\/"><b>ONHOLDNEWS<\/b><span id="onnT">[^<]+<\/span><small id="onnS">[^<]+<\/small><\/a>/);
});

test('applyLang points non-Chinese visitors to the English weekly', () => {
  const fn = html.match(/function applyLang\(\)\{[\s\S]*?\n\}/)[0];
  assert.match(fn, /\$\('onnLink'\)\.href=lang==='zh'\?'weekly\/':'weekly\/en\/'/);
  assert.match(fn, /\$\('onnT'\)\.textContent=/);
  assert.match(fn, /\$\('onnS'\)\.textContent=/);
});
