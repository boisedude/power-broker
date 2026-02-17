import { test } from '@playwright/test';

test('Full game playthrough with screenshots', async ({ page }) => {
  test.setTimeout(120000);
  const ss = async (name: string) => {
    await page.waitForTimeout(500);
    await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
  };

  // 1. Main Menu
  await page.goto('/');
  await page.waitForSelector('text=POWERBROKER');
  await ss('01-main-menu');

  // 2. New Game / Difficulty Select
  await page.getByText('New Campaign').click();
  await page.waitForSelector('text=Select Difficulty');
  await ss('02-new-game');

  // 3. Start game on Toss-Up
  await page.getByText('Toss-Up').click();
  await page.waitForSelector('text=Week 1 of 26');
  await ss('03-dashboard-week1');

  // 4. Start Campaign
  await page.getByText('Start Campaign').click();
  await page.waitForTimeout(500);
  await ss('04-dashboard-actions-phase');

  // 5. Actions screen
  await page.getByText('Actions', { exact: true }).click();
  await page.waitForSelector('text=Allocate Actions');
  await ss('05-actions-5ap');

  // 6. Allocate 3 AP
  const apButtons = page.locator('button:has-text("1 AP"):not([disabled])');
  for (let i = 0; i < 3; i++) {
    await apButtons.first().click();
    await page.waitForTimeout(300);
  }
  await ss('06-actions-2ap');

  // 7. Spend all AP — verify End Turn button is visible (sticky)
  for (let i = 0; i < 2; i++) {
    await apButtons.first().click();
    await page.waitForTimeout(300);
  }
  // Take viewport screenshot (not fullPage) to confirm End Turn is visible
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'e2e/screenshots/07-actions-0ap-viewport.png', fullPage: false });
  await ss('07-actions-0ap-full');

  // 8. End turn from Actions via sticky button
  await page.getByText('End Turn →', { exact: true }).click();
  await page.waitForTimeout(1000);

  // 9. Should now see briefing on Dashboard (not jump to events!)
  await ss('08-week2-briefing');

  // 10. Click Begin Turn — should go to events if any
  const beginBtn = page.getByText('Begin Turn →');
  if (await beginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await beginBtn.click();
    await page.waitForTimeout(500);
    await ss('09-after-begin-turn');
  }

  // 11. If on events, resolve them
  if (page.url().includes('/events')) {
    await ss('10-events-screen');
    while (true) {
      const choiceBtn = page.locator('.space-y-2 button').first();
      if (await choiceBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await choiceBtn.click();
        await page.waitForTimeout(500);
      } else {
        break;
      }
    }
    // After events, navigate back
    if (page.url().includes('/events')) {
      await page.getByRole('button', { name: 'Home' }).click();
      await page.waitForTimeout(500);
    }
  }

  // 12. Play turns 2-5
  for (let turn = 2; turn <= 5; turn++) {
    // Check for briefing
    const briefBtn = page.getByText('Begin Turn →');
    if (await briefBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await briefBtn.click();
      await page.waitForTimeout(500);
    }

    // Handle events
    if (page.url().includes('/events')) {
      while (true) {
        const choiceBtn = page.locator('.space-y-2 button').first();
        if (await choiceBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await choiceBtn.click();
          await page.waitForTimeout(500);
        } else {
          break;
        }
      }
      if (page.url().includes('/events')) {
        await page.getByRole('button', { name: 'Home' }).click();
        await page.waitForTimeout(500);
      }
    }

    // Allocate actions
    await page.getByRole('button', { name: 'Actions' }).click();
    await page.waitForTimeout(300);
    const btns = page.locator('button:has-text("1 AP"):not([disabled])');
    for (let i = 0; i < 5; i++) {
      if (await btns.first().isVisible({ timeout: 500 }).catch(() => false)) {
        await btns.first().click();
        await page.waitForTimeout(200);
      }
    }

    // End turn
    const endBtn = page.getByText('End Turn →', { exact: true });
    if (await endBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await endBtn.click();
      await page.waitForTimeout(800);
    }
  }

  // Go home for dashboard screenshot
  await page.getByRole('button', { name: 'Home' }).click();
  await page.waitForTimeout(500);
  await ss('11-dashboard-after-5-turns');

  // 13. Strategy - Endorsements (compact check)
  await page.getByRole('button', { name: 'Strategy' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Endorsements' }).click();
  await page.waitForTimeout(500);
  await ss('12-endorsements-compact');

  // 14. Settings
  await page.goto('/settings');
  await page.waitForTimeout(500);
  await ss('13-settings');
});
