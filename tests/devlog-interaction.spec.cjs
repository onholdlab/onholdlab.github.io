const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 320, height: 640 }, reducedMotion: 'reduce' });

test('jump to a wrapped phrase moves focus and keeps its start above the panel', async ({ page }) => {
  await page.goto('/devlog/');
  const original = page.getByRole('button', { name: '24小時內提交' });
  await original.click();
  const target = page.getByRole('button', { name: '畫畫遊戲都有一定的時間限制' });
  expect(await target.evaluate(el => el.getClientRects().length)).toBeGreaterThan(1);
  await page.getByRole('link', { name: /去看另一句/ }).press('Enter');
  await expect(target).toBeFocused();
  await expect.poll(() => target.evaluate(el => {
    const firstLine = el.getClientRects()[0];
    return firstLine.top >= 0 && firstLine.bottom <= document.querySelector('#sheet').getBoundingClientRect().top;
  })).toBe(true);
  await page.getByRole('button', { name: /收起/ }).click();
  await expect(original).toBeFocused();
  await expect(original).toBeInViewport();
});

test('holding a key keeps the selected reaction open and exposes the sketch quote', async ({ page }) => {
  await page.goto('/devlog/');
  const phrase = page.getByRole('button', { name: '畫畫遊戲都有一定的時間限制' });
  for (const key of ['Enter', 'Space']) {
    await phrase.focus();
    await page.keyboard.down(key);
    await page.keyboard.down(key);
    await page.keyboard.up(key);
    await expect(phrase).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('region', { name: /反應/ }).getByRole('img', { name: '24小時內提交' })).toBeVisible();
    await expect(page.locator('#rxs .k').filter({ hasText: '矛盾' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(phrase).toHaveAttribute('aria-expanded', 'false');
  }
});

test('holding Enter on the sketch opens its reaction once', async ({ page }) => {
  await page.goto('/devlog/');
  const phrase = page.getByRole('button', { name: '24小時內提交' });
  await phrase.focus();
  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await expect(phrase).toHaveAttribute('aria-expanded', 'true');
});
