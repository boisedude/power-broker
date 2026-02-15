import { test, expect } from '@playwright/test';

const PROD_URL = 'https://powerbrokergame.com';

test.describe('Power Broker - Production Smoke Tests', () => {
  test('main menu loads', async ({ page }) => {
    await page.goto(PROD_URL);
    await expect(page.getByText('POWERBROKER')).toBeVisible();
    await expect(page.getByText('New Campaign')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('new game screen loads and shows difficulties', async ({ page }) => {
    await page.goto(`${PROD_URL}/new-game`);
    await expect(page.getByText('Select Difficulty')).toBeVisible();
    await expect(page.getByText('Toss-Up')).toBeVisible();
    await expect(page.getByText('Safe Seat')).toBeVisible();
    await expect(page.getByText('Hostile')).toBeVisible();
  });

  test('can start a game and see dashboard', async ({ page }) => {
    await page.goto(`${PROD_URL}/new-game`);
    await page.getByText('Toss-Up').click();
    await expect(page).toHaveURL(`${PROD_URL}/game`);
    await expect(page.getByText('Week 1 of 26')).toBeVisible();
    await expect(page.getByText('Start Campaign')).toBeVisible();
  });

  test('can begin turn and navigate tabs', async ({ page }) => {
    await page.goto(`${PROD_URL}/new-game`);
    await page.getByText('Toss-Up').click();
    await page.getByText('Start Campaign').click();
    await expect(page.getByText('End Turn')).toBeVisible();

    // Navigate tabs
    await page.getByRole('button', { name: 'Actions' }).click();
    await expect(page).toHaveURL(`${PROD_URL}/game/actions`);

    await page.getByRole('button', { name: 'Polls' }).click();
    await expect(page).toHaveURL(`${PROD_URL}/game/polls`);

    await page.getByRole('button', { name: 'Home' }).click();
    await expect(page).toHaveURL(`${PROD_URL}/game`);
  });

  test('can end a turn successfully', async ({ page }) => {
    await page.goto(`${PROD_URL}/new-game`);
    await page.getByText('Toss-Up').click();
    await page.getByText('Start Campaign').click();
    await page.getByText('End Turn →').click();

    const briefingOrEvents = page.getByText('Morning Briefing').or(page.getByText('Campaign Events'));
    await expect(briefingOrEvents).toBeVisible({ timeout: 10000 });
  });

  test('SPA routing works (direct URL access)', async ({ page }) => {
    await page.goto(`${PROD_URL}/settings`);
    await expect(page.getByText('Animations')).toBeVisible();
    await expect(page.getByText('Auto-Save')).toBeVisible();
  });
});
