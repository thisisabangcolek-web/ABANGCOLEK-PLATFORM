import { expect, test, type Page } from '@playwright/test';

const heroSelector = '.ac-world-journey';

async function openLanding(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Terokai dunia ABANGCOLEK', exact: true })).toBeVisible();
  await expect(page.locator(heroSelector)).toHaveAttribute('data-motion', 'scene');
  await expect(page.locator(heroSelector)).toHaveAttribute('data-scene', 'produk');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

async function idle(page: Page) {
  await expect(page.locator(heroSelector)).toHaveAttribute('data-phase', 'idle');
}

async function wheelTo(page: Page, delta: number, scene: string) {
  await idle(page);
  await page.mouse.move(1000, 450);
  await page.mouse.wheel(0, delta);
  await expect(page.locator(heroSelector)).toHaveAttribute('data-scene', scene);
  await idle(page);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
}

test.describe('Emons desktop scene experience', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });

  test('native hotspot dialog is centered within the viewport', async ({ page }, testInfo) => {
    await openLanding(page);
    await page.getByRole('button', { name: 'Terokai produk', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Kenali colek anda.', exact: true });
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds).not.toBeNull();
    await testInfo.attach('dialog-geometry', { body: JSON.stringify({ viewport: page.viewportSize(), bounds }), contentType: 'application/json' });
    await testInfo.attach('centered-dialog', { body: await page.screenshot(), contentType: 'image/png' });
    expect.soft(Math.abs(bounds!.x + bounds!.width / 2 - 720)).toBeLessThanOrEqual(2);
    expect.soft(Math.abs(bounds!.y + bounds!.height / 2 - 450)).toBeLessThanOrEqual(2);
    expect(bounds!.x).toBeGreaterThanOrEqual(16);
    expect(bounds!.y).toBeGreaterThanOrEqual(20);
    await expect(page.getByRole('button', { name: 'Tutup maklumat', exact: true })).toBeFocused();
  });

  test('trusted wheel advances and reverses chapters then releases the last chapter', async ({ page }, testInfo) => {
    await openLanding(page);
    await page.evaluate(() => {
      const receipt: { trusted: boolean; cancelable: boolean; deltaY: number }[] = [];
      (window as unknown as { emonsWheels: typeof receipt }).emonsWheels = receipt;
      window.addEventListener('wheel', event => receipt.push({ trusted: event.isTrusted, cancelable: event.cancelable, deltaY: event.deltaY }), { capture: true });
    });
    await wheelTo(page, 400, 'packing');
    await wheelTo(page, -400, 'produk');
    await wheelTo(page, 400, 'packing');
    await wheelTo(page, 400, 'penghantaran');
    await wheelTo(page, 400, 'rangkaian');
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(50);
    await expect(page.locator(heroSelector)).toHaveAttribute('data-scene', 'rangkaian');
    const wheels = await page.evaluate(() => (window as unknown as { emonsWheels: { trusted: boolean; cancelable: boolean; deltaY: number }[] }).emonsWheels);
    expect(wheels).toHaveLength(6);
    expect(wheels.every(event => event.trusted)).toBe(true);
    await testInfo.attach('native-wheel-receipt', { body: JSON.stringify(wheels), contentType: 'application/json' });
  });

  test('leaving Produk releases focus from the hidden photo attribution', async ({ page }) => {
    await openLanding(page);
    const attribution = page.locator('.ac-world-product-photo a');
    await attribution.focus();
    await expect(attribution).toBeFocused();
    await wheelTo(page, 400, 'packing');
    await expect(attribution).not.toBeFocused();
    await expect(attribution).toHaveAttribute('inert', '');
    await wheelTo(page, -400, 'produk');
    await expect(attribution).not.toHaveAttribute('inert', '');
    await attribution.focus();
    await expect(attribution).toBeFocused();
  });

  for (const dismissal of ['close button', 'Escape', 'backdrop'] as const) {
    test(`${dismissal} returns focus and permits the next trusted wheel`, async ({ page }) => {
      await openLanding(page);
      const trigger = page.getByRole('button', { name: 'Terokai produk', exact: true });
      await trigger.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(page.getByRole('button', { name: 'Tutup maklumat', exact: true })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(dialog.getByRole('link', { name: 'Foto TikTok rasmi', exact: true })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(dialog.getByRole('button', { name: 'Buka katalog', exact: true })).toBeFocused();
      if (dismissal === 'close button') await page.getByRole('button', { name: 'Tutup maklumat', exact: true }).click();
      else if (dismissal === 'Escape') await page.keyboard.press('Escape');
      else {
        const bounds = await dialog.boundingBox();
        expect(bounds).not.toBeNull();
        // A point outside the panel exercises the native backdrop, not panel padding.
        await page.mouse.click(bounds!.x > 20 ? 10 : bounds!.x + bounds!.width + 10, 450);
      }
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await wheelTo(page, 400, 'packing');
    });
  }

  test('pause exposes readable chapters and resume restores trusted wheel input', async ({ page }) => {
    await openLanding(page);
    await wheelTo(page, 400, 'packing');
    await page.getByRole('button', { name: 'Kurangkan animasi', exact: true }).click();
    await expect(page.locator(heroSelector)).toHaveAttribute('data-motion', 'static');
    for (const chapter of ['produk', 'packing', 'penghantaran', 'rangkaian']) {
      await expect(page.locator(`#world-${chapter}`)).toHaveAttribute('aria-hidden', 'false');
    }
    await expect(page.locator('.ac-world-animation')).toHaveCount(0);
    const pausedScrollY = await page.evaluate(() => window.scrollY);
    await page.mouse.move(1000, 450);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(pausedScrollY + 50);
    await page.getByRole('button', { name: 'Aktifkan animasi dunia', exact: true }).click();
    await expect(page.locator(heroSelector)).toHaveAttribute('data-motion', 'scene');
    // The top-of-story resume control returns to the first visible static chapter.
    await expect(page.locator(heroSelector)).toHaveAttribute('data-scene', 'produk');
    await wheelTo(page, 400, 'packing');
  });

  test('focused hero supports PageDown and PageUp without losing native End navigation', async ({ page }) => {
    await openLanding(page);
    await page.locator(heroSelector).focus();
    await page.keyboard.press('PageDown');
    await expect(page.locator(heroSelector)).toHaveAttribute('data-scene', 'packing');
    await idle(page);
    await page.keyboard.press('PageUp');
    await expect(page.locator(heroSelector)).toHaveAttribute('data-scene', 'produk');
    await idle(page);
    await page.keyboard.press('End');
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(50);
    await expect(page.locator(heroSelector)).toHaveAttribute('data-scene', 'produk');
  });
});

test.describe('Emons fresh reduced-motion experience', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

  test('static chapters are readable and native wheel scrolling is available', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(heroSelector)).toHaveAttribute('data-motion', 'static');
    await expect(page.getByRole('button', { name: 'Paparan tanpa animasi', exact: true })).toBeDisabled();
    await expect(page.locator('.ac-world-animation')).toHaveCount(0);
    for (const chapter of ['produk', 'packing', 'penghantaran', 'rangkaian']) {
      await expect(page.locator(`#world-${chapter}`)).toHaveAttribute('aria-hidden', 'false');
    }
    await page.mouse.move(1000, 450);
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(50);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  });
});

test.describe('Emons short desktop viewport', () => {
  test.use({ viewport: { width: 1440, height: 520 }, reducedMotion: 'no-preference' });

  test('uses static chapters rather than clipping the scene controls', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(heroSelector)).toHaveAttribute('data-motion', 'static');
    await expect(page.getByRole('button', { name: 'Paparan tanpa animasi', exact: true })).toBeDisabled();
    await expect(page.locator('.ac-world-animation')).toHaveCount(0);
    await expect(page.locator('#world-rangkaian')).toHaveAttribute('aria-hidden', 'false');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  });
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 900 }, { width: 1024, height: 900 }, { width: 390, height: 844 }]) {
  test.describe(`Emons Selection label layout ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport, isMobile: viewport.width === 390, hasTouch: viewport.width === 390, reducedMotion: 'no-preference' });

    test('Selection label and product photo remain separate from each other and the copy', async ({ page }, testInfo) => {
      await openLanding(page);
      await idle(page);
      const panel = await page.locator('.ac-aw-scene[data-scene="produk"] .ac-aw-label > rect').boundingBox();
      const photo = await page.locator('.ac-world-product-photo').boundingBox();
      const copy = await page.locator('#world-produk').boundingBox();
      expect(panel).not.toBeNull();
      expect(photo).not.toBeNull();
      expect(copy).not.toBeNull();
      const overlaps = (first: NonNullable<typeof panel>, second: NonNullable<typeof panel>) =>
        first.x < second.x + second.width && first.x + first.width > second.x
        && first.y < second.y + second.height && first.y + first.height > second.y;
      await testInfo.attach(`selection-layout-${viewport.width}`, { body: JSON.stringify({ viewport, panel, photo, copy }), contentType: 'application/json' });
      await testInfo.attach(`selection-screenshot-${viewport.width}`, { body: await page.screenshot(), contentType: 'image/png' });
      expect.soft(overlaps(panel!, photo!), 'Selection label must not sit under the product photo').toBe(false);
      expect.soft(overlaps(panel!, copy!), 'Selection label must avoid the active copy').toBe(false);
      expect.soft(overlaps(photo!, copy!), 'Product photo must avoid the active copy').toBe(false);
      expect(panel!.x).toBeGreaterThanOrEqual(0);
      expect(panel!.x + panel!.width).toBeLessThanOrEqual(viewport.width);
      expect(panel!.y).toBeGreaterThanOrEqual(0);
      expect(panel!.y + panel!.height).toBeLessThanOrEqual(viewport.height);
    });
  });
}
