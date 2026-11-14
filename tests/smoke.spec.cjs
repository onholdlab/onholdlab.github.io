// 網頁作品的煙霧測試（Playwright）：每個頁面都能開、沒有 JS 錯誤、本站的檔案沒有 404。
// 來源：onholdlab/rules 的 templates/harness-web（2026-11-14）。頁面清單在 .claude/hooks/config.json 的 site.pages。
const { test, expect } = require('@playwright/test');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const site = JSON.parse(readFileSync(join(__dirname, '..', '.claude/hooks/config.json'), 'utf8')).site || {};
const pages = site.pages || ['index.html'];

test('測試伺服器拒絕錯誤路徑，並繼續提供頁面', async ({ request }) => {
  expect((await request.get('/%ZZ')).status()).toBe(400);
  expect((await request.get('/%00')).status()).toBe(400);
  expect((await request.get('/')).status()).toBe(200);
  expect((await request.get('/weekly')).status()).toBe(200);
});

for (const page of pages) {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    test(`${page} @${viewport.width}px：能開、沒有 JS 錯誤、本站檔案沒有 404`, async ({ browser, baseURL }) => {
      const ctx = await browser.newContext({ viewport });
      const p = await ctx.newPage();
      const errors = [], broken = [];
      p.on('pageerror', e => errors.push(e.message));
      p.on('response', r => { if (r.url().startsWith(baseURL) && r.status() >= 400) broken.push(`${r.status()} ${r.url()}`); });
      await p.goto('/' + page.replace(/index\.html$/, ''), { waitUntil: 'load' });
      await p.waitForTimeout(site.settleMs || 1500);
      expect(await p.title(), '頁面沒有標題').not.toBe('');
      expect(errors, 'JS 錯誤').toEqual([]);
      expect(broken, '本站檔案載入失敗').toEqual([]);
      await ctx.close();
    });
  }
}
