const { test, expect } = require('@playwright/test');

test('No.03 honours the homepage Chinese preference and preserves deep links', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('ohl_lang') === null) {
      localStorage.setItem('ohl_lang', JSON.stringify('zh-Hant'));
    }
  });
  await page.goto('/weekly/en/2026-11-17/?utm_source=review#g3');
  await expect(page).toHaveURL(/\/weekly\/2026-11-17\/\?utm_source=review#g3$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
  await page.locator('a.lang').click();
  await expect(page).toHaveURL(/\/weekly\/en\/2026-11-17\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

for (const prefix of ['/weekly/', '/weekly/en/']) {
  test(`${prefix}：首頁、No.02 和 No.03 的導覽互相接通`, async ({ page }) => {
    await page.goto(prefix);
    await expect(page.locator('.archive .lineup')).toHaveCount(0);
    await expect(page.locator('.archive li a[href="2026-11-10/"]')).toBeVisible();
    await page.locator('.cover a[href="2026-11-17/"], .archive a[href="2026-11-17/"]').click();
    await expect(page).toHaveURL(prefix + '2026-11-17/');
    await expect(page.locator('article.item')).toHaveCount(4);
    await page.locator(`.next-reading a[href="${prefix}2026-11-10/"]`).click();
    await page.locator(`.next-reading a[href="${prefix}2026-11-17/"]`).click({ timeout: 3000 });
    await expect(page).toHaveURL(prefix + '2026-11-17/');
  });
}

test('No.03 Medium 版的五張圖都有打包來源', async ({ page, request }) => {
  await page.route('https://onholdlab.com/**', route => route.abort());
  const response = await page.goto('/weekly/en/2026-11-17/medium/');
  expect(response.status()).toBe(200);
  const urls = await page.locator('figure img').evaluateAll(images => images.map(image => image.src));
  expect(urls).toHaveLength(5);
  for (const url of urls) {
    const asset = await request.get(new URL(url).pathname);
    expect(asset.status()).toBe(200);
    expect(asset.headers()['content-type']).toBe('image/png');
  }
});
