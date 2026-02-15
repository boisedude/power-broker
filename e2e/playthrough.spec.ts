import { test, expect, Page } from '@playwright/test';

const URL = 'https://powerbrokergame.com';

test.describe('Full Playthrough', () => {
  test('play through multiple turns and report experience', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    const log: string[] = [];
    const snap = async (label: string) => {
      const text = await page.locator('body').innerText();
      log.push(`\n=== ${label} ===`);
      log.push(text.slice(0, 2000));
    };

    // START GAME
    await page.goto(URL);
    await snap('MAIN MENU');
    await page.getByText('New Campaign').click();
    await snap('DIFFICULTY SELECT');
    await page.getByText('Toss-Up').click();
    await expect(page.getByText('Week 1 of 26')).toBeVisible();
    await snap('DASHBOARD - Week 1 (initial)');

    // Start campaign
    await page.getByText('Start Campaign').click();
    await expect(page.getByText('End Turn')).toBeVisible();
    await snap('DASHBOARD - Week 1 (actions phase)');

    // CHECK EACH TAB
    // Actions tab
    await page.getByRole('button', { name: 'Actions' }).click();
    await page.waitForTimeout(500);
    await snap('ACTIONS TAB');

    // Try to allocate some actions
    const actionButtons = page.locator('button:has-text("Allocate")');
    const actionCount = await actionButtons.count();
    log.push(`\n--- Action buttons found: ${actionCount}`);
    if (actionCount > 0) {
      // Allocate fundraise
      await actionButtons.first().click();
      await page.waitForTimeout(300);
      await snap('AFTER FIRST ACTION ALLOCATION');
    }

    // Strategy tab
    await page.getByRole('button', { name: 'Strategy' }).click();
    await page.waitForTimeout(500);
    await snap('STRATEGY TAB');

    // Polls tab
    await page.getByRole('button', { name: 'Polls' }).click();
    await page.waitForTimeout(500);
    await snap('POLLS TAB');

    // Finance tab
    await page.getByRole('button', { name: 'Finance' }).click();
    await page.waitForTimeout(500);
    await snap('FINANCE TAB');

    // PLAY THROUGH TURNS
    for (let turn = 1; turn <= 10; turn++) {
      // Go to home
      await page.getByRole('button', { name: 'Home' }).click();
      await page.waitForTimeout(300);

      // Check if game over
      const gameOver = await page.locator('text=ELECTION NIGHT').count();
      if (gameOver > 0) {
        await snap(`GAME OVER at turn ${turn}`);
        break;
      }

      // Handle events if on events screen
      const eventsVisible = await page.locator('text=Campaign Events').count();
      if (eventsVisible > 0) {
        log.push(`\n--- Turn ${turn}: Events detected`);
        // Try to resolve events by clicking first choice
        for (let e = 0; e < 3; e++) {
          const choiceButtons = page.locator('.space-y-2 button, button:has-text("choice")');
          const choiceCount = await choiceButtons.count();
          if (choiceCount > 0) {
            await choiceButtons.first().click();
            await page.waitForTimeout(500);
          } else {
            break;
          }
        }
        // Click continue to actions if visible
        const continueBtn = page.locator('button:has-text("Continue to Actions")');
        if (await continueBtn.count() > 0) {
          await continueBtn.click();
          await page.waitForTimeout(300);
        }
      }

      // Handle morning briefing
      const beginTurn = page.locator('button:has-text("Begin Turn")');
      if (await beginTurn.count() > 0) {
        await snap(`BRIEFING - Turn ${turn}`);
        await beginTurn.click();
        await page.waitForTimeout(300);
      }

      // Allocate some actions on the actions tab
      await page.getByRole('button', { name: 'Actions' }).click();
      await page.waitForTimeout(300);

      // Click allocate buttons (up to 3 actions per turn)
      for (let a = 0; a < 3; a++) {
        const allocBtns = page.locator('button:has-text("Allocate")');
        const count = await allocBtns.count();
        if (count > 0) {
          // Try different actions each turn
          const idx = Math.min(a % count, count - 1);
          await allocBtns.nth(idx).click();
          await page.waitForTimeout(200);
        }
      }

      // Go back home and end turn
      await page.getByRole('button', { name: 'Home' }).click();
      await page.waitForTimeout(300);

      const endTurnBtn = page.locator('button:has-text("End Turn")');
      if (await endTurnBtn.count() > 0) {
        await endTurnBtn.click();
        await page.waitForTimeout(1000);
        await snap(`AFTER END TURN ${turn}`);
      }

      // Handle events that appear after ending turn
      await page.waitForTimeout(500);
      const currentUrl = page.url();
      if (currentUrl.includes('/events')) {
        log.push(`\n--- Turn ${turn}: Post-turn events`);
        for (let e = 0; e < 5; e++) {
          const eventChoices = page.locator('button.w-full:not(:has-text("Continue"))').filter({ hasText: /.{10,}/ });
          const cnt = await eventChoices.count();
          if (cnt > 0) {
            const choiceText = await eventChoices.first().innerText();
            log.push(`  Event choice: "${choiceText.slice(0, 80)}..."`);
            await eventChoices.first().click();
            await page.waitForTimeout(500);
          }

          const contBtn = page.locator('button:has-text("Continue to Actions")');
          if (await contBtn.count() > 0) {
            await contBtn.click();
            await page.waitForTimeout(300);
            break;
          }
        }
      }
    }

    // Final state
    await page.getByRole('button', { name: 'Home' }).click();
    await page.waitForTimeout(300);
    await snap('FINAL STATE');

    // Check polls
    await page.getByRole('button', { name: 'Polls' }).click();
    await page.waitForTimeout(300);
    await snap('FINAL POLLS');

    // Check finance
    await page.getByRole('button', { name: 'Finance' }).click();
    await page.waitForTimeout(300);
    await snap('FINAL FINANCE');

    // Output the full log
    console.log('\n\n' + '='.repeat(80));
    console.log('PLAYTHROUGH LOG');
    console.log('='.repeat(80));
    console.log(log.join('\n'));
    console.log('='.repeat(80));
  });
});
