import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { build } from './build-works.mjs';

const published = [
  { repo: 'first', title: 'First', url: 'https://onholdlab.com/first/', lang_only: 'zh',
    translations: { ja: { title: 'First in Japanese' } } },
  { repo: 'second', title: 'Second', url: 'https://onholdlab.com/second/', translations: {} }
];
const repo = (name, extra = {}) => ({
  name, has_pages: true, created_at: '2026-11-11T00:00:00Z',
  description: '新名稱｜新介紹｜New name｜New description', topics: ['game'], ...extra
});

test('refresh only published works, preserving order, deployment URLs and language restrictions', () => {
  const result = build([
    repo('not-on-cloudflare'),
    ...published.toReversed().map(work => repo(work.repo, {
      has_pages: false, homepage: `https://onholdlab.github.io/${work.repo}/`
    }))
  ], published);
  assert.deepEqual(result.map(work => work.repo), published.map(work => work.repo));
  assert.deepEqual(result.map(work => work.url), published.map(work => work.url));
  assert.equal(result[0].lang_only, 'zh');
  assert.equal(result[0].title, '新名稱');
  assert.equal(result[0].title_en, 'New name');
  assert.deepEqual(result[0].translations, published[0].translations);
});

test('missing GitHub records cannot remove published works or their settings', () => {
  assert.deepEqual(build([repo('not-on-cloudflare')], published), published);
  const custom = { repo: 'custom', url: 'https://onholdlab.com/custom/', lang_only: 'zh',
    translations: { ja: { title: 'Custom' } }, customSetting: true };
  assert.deepEqual(build([], [custom]), [custom]);
  assert.deepEqual(build([repo('custom')], [custom])[0].translations, custom.translations);
  assert.equal(build([repo('custom')], [custom])[0].customSetting, true);
});

test('the default published set comes from works.json, including works without Pages', () => {
  const catalog = JSON.parse(readFileSync(new URL('../works.json', import.meta.url), 'utf8')).works;
  const result = build([repo('not-on-cloudflare')]);
  assert.deepEqual(result.map(work => work.repo), catalog.map(work => work.repo));
  assert.deepEqual(result.map(work => work.url), catalog.map(work => work.url));
});
