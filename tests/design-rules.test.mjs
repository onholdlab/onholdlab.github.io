import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// 設計規則（AGENTS.md）：不要有框、不要有底線；區分用文字顏色或粗細，鍵盤焦點用變色。
// 首頁場景裡「畫出來的東西」（叫號窗口、被貓打的假廣告、舞台與地板、特效）是插畫，不算介面框，暫不套用。
const PAGES = ['index.html', 'devlog/index.html', 'privacy/index.html', 'weekly/index.html',
  'weekly/2026-11-10/index.html', 'weekly/2026-11-03/index.html'];
const SCENE_ART = /^(\[data-d="a"\]\s*)?\.(win|ad|stage|deco|ringfx|spark|ghost|shutter|sh-l)\b|\.lang::after/;

const rules = file => {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1].trim(), body: m[2].replace(/\s+/g, '') }));
};

for (const file of PAGES) {
  test(`${file}: no underlines anywhere`, () => {
    for (const { sel, body } of rules(file)) {
      assert.doesNotMatch(body, /text-decoration:underline|text-underline-offset/, `${sel}`);
    }
  });

  test(`${file}: links are not underlined by default and focus is shown by colour, not an outline`, () => {
    const all = rules(file);
    const a = all.filter(r => r.sel === 'a');
    assert.ok(a.some(r => /text-decoration:none/.test(r.body)), 'a { text-decoration:none }');
    const focus = all.filter(r => r.sel === ':focus-visible');
    assert.ok(focus.length && focus.every(r => /outline:none/.test(r.body) && /color:/.test(r.body)), ':focus-visible uses colour');
  });

  test(`${file}: no boxes, lines, shadows or panel fills outside the drawn scene`, () => {
    for (const { sel, body } of rules(file)) {
      if (sel.split(',').every(s => SCENE_ART.test(s.trim()))) continue;
      assert.doesNotMatch(body, /border(-(top|bottom|left|right))?:(?!0|none)[^;]+/, `${sel} has a border`);
      assert.doesNotMatch(body, /box-shadow:(?!none)/, `${sel} has a shadow`);
      assert.doesNotMatch(body, /outline:(?!none)/, `${sel} has an outline`);
      if (!/^(body|html|:root)$/.test(sel)) assert.doesNotMatch(body, /background(-color)?:(?!none|transparent)/, `${sel} has a fill`);
      assert.doesNotMatch(body, /appearance:(?!none)/, `${sel}`);
    }
  });
}

test('homepage devlog entry no longer promises reactions', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const entry = html.match(/<a class="onn" href="devlog\/">[\s\S]*?<\/a>/)[0];
  assert.doesNotMatch(entry, /反應|react/);
});
