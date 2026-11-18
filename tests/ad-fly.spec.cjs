// 規格：貓打掉的廣告會變成線稿，從廣告原位置（貓的舞台）沿軌跡飛到展示區（看不見的框）落定；
// 飛行途中線稿在展示區外面看得到，落地後才算進展示區的數字。
const { test, expect } = require('@playwright/test');

test('打掉的廣告線稿會從舞台飛到展示區', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.removeItem('ohl_art'));
  await page.reload();
  // 線稿一出現就記下它的起點（飛行一開始的位置），不受量測時間影響
  await page.evaluate(() => {
    window.__flyStart = null;
    new MutationObserver((ms, ob) => {
      for (const m of ms) for (const n of m.addedNodes) {
        if (n.nodeName.toLowerCase() === 'svg' && n.parentNode === document.body) {
          const g = n.querySelector('g').getBoundingClientRect(), s = document.getElementById('stage').getBoundingClientRect(), a = document.getElementById('art').getBoundingClientRect();
          window.__flyStart = { cy: g.top + g.height / 2, stageTop: s.top, stageBottom: s.bottom, artTop: a.top };
          ob.disconnect();
        }
      }
    }).observe(document.body, { childList: true });
  });
  const ad = page.locator('.ad').first();
  await ad.waitFor();
  await ad.click();
  await page.waitForFunction(() => window.__flyStart, null, { timeout: 15000 });
  const st = await page.evaluate(() => window.__flyStart);
  expect(st.cy).toBeGreaterThan(st.stageTop);
  expect(st.cy).toBeLessThan(st.stageBottom);
  expect(st.cy).toBeLessThan(st.artTop);
  // 落地後飛行用的線稿移除，展示區多一筆
  const flyer = page.locator('body > svg[aria-hidden="true"]');
  await expect(flyer).toHaveCount(0, { timeout: 5000 });
  await expect(page.locator('#artn')).toHaveText('1');
  await expect(page.locator('#art > g')).toHaveCount(1);
});
