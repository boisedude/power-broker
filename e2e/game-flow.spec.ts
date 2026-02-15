import { test, expect } from '@playwright/test';

test.describe('Power Broker - Game Flow', () => {
  test('main menu loads and has expected elements', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('POWERBROKER')).toBeVisible();
    await expect(page.getByText('New Campaign')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('can navigate to new game screen and select difficulty', async ({ page }) => {
    await page.goto('/');
    await page.getByText('New Campaign').click();
    await expect(page).toHaveURL('/new-game');
    await expect(page.getByText('Select Difficulty')).toBeVisible();
    await expect(page.getByText('Toss-Up')).toBeVisible();
    await expect(page.getByText('Safe Seat')).toBeVisible();
  });

  test('can start a new game on Toss-Up difficulty', async ({ page }) => {
    await page.goto('/new-game');
    await page.getByText('Toss-Up').click();
    await expect(page).toHaveURL('/game');
    await expect(page.getByText('Week 1 of 26')).toBeVisible();
    await expect(page.getByText('Start Campaign')).toBeVisible();
  });

  test('can begin turn and see dashboard', async ({ page }) => {
    await page.goto('/new-game');
    await page.getByText('Toss-Up').click();
    await page.getByText('Start Campaign').click();
    await expect(page.getByText('End Turn')).toBeVisible();
    await expect(page.getByText('Gonzalez')).toBeVisible();
    await expect(page.getByText('Lee', { exact: true }).first()).toBeVisible();
  });

  test('bottom navigation works', async ({ page }) => {
    await page.goto('/new-game');
    await page.getByText('Toss-Up').click();
    await page.getByText('Start Campaign').click();

    // Navigate to Actions tab via bottom nav button
    await page.getByRole('button', { name: 'Actions' }).click();
    await expect(page).toHaveURL('/game/actions');

    // Navigate to Strategy tab
    await page.getByRole('button', { name: 'Strategy' }).click();
    await expect(page).toHaveURL('/game/strategy');

    // Navigate to Polls tab
    await page.getByRole('button', { name: 'Polls' }).click();
    await expect(page).toHaveURL('/game/polls');

    // Navigate to Finance tab
    await page.getByRole('button', { name: 'Finance' }).click();
    await expect(page).toHaveURL('/game/finance');

    // Navigate back to Home
    await page.getByRole('button', { name: 'Home' }).click();
    await expect(page).toHaveURL('/game');
  });

  test('can end a turn and see results', async ({ page }) => {
    await page.goto('/new-game');
    await page.getByText('Toss-Up').click();
    await page.getByText('Start Campaign').click();

    // End the turn
    await page.getByText('End Turn →').click();

    // Should either show events or advance to briefing
    const briefingOrEvents = page.getByText('Morning Briefing').or(page.getByText('Campaign Events'));
    await expect(briefingOrEvents).toBeVisible({ timeout: 5000 });
  });

  test('settings page works', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('Animations')).toBeVisible();
    await expect(page.getByText('Auto-Save')).toBeVisible();
    await expect(page.getByText('Reset Campaign')).toBeVisible();
  });
});
