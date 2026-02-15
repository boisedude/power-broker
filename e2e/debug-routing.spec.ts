import { test, expect } from '@playwright/test';

const URL = 'https://powerbrokergame.com';

test('debug: verify each tab renders unique content', async ({ page }) => {
  // Start a game
  await page.goto(`${URL}/new-game`);
  await page.getByText('Toss-Up').click();
  await page.getByText('Start Campaign').click();
  await expect(page.getByText('End Turn')).toBeVisible();

  // Dashboard should show "End Turn"
  const dashContent = await page.locator('main').innerText();
  console.log('=== DASHBOARD main content ===');
  console.log(dashContent.slice(0, 500));

  // Navigate to Actions
  await page.getByRole('button', { name: 'Actions' }).click();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(`${URL}/game/actions`);
  const actionsContent = await page.locator('main').innerText();
  console.log('\n=== ACTIONS main content ===');
  console.log(actionsContent.slice(0, 500));

  // Check for Actions-specific content
  const hasAllocateActions = await page.locator('text=Allocate Actions').count();
  const hasFundraise = await page.locator('text=Fundraise').count();
  console.log(`Has "Allocate Actions": ${hasAllocateActions}`);
  console.log(`Has "Fundraise": ${hasFundraise}`);

  // Navigate to Strategy
  await page.getByRole('button', { name: 'Strategy' }).click();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(`${URL}/game/strategy`);
  const strategyContent = await page.locator('main').innerText();
  console.log('\n=== STRATEGY main content ===');
  console.log(strategyContent.slice(0, 500));

  const hasCampaignStrategy = await page.locator('text=Campaign Strategy').count();
  const hasAdvertising = await page.locator('text=Advertising').count();
  console.log(`Has "Campaign Strategy": ${hasCampaignStrategy}`);
  console.log(`Has "Advertising": ${hasAdvertising}`);

  // Navigate to Polls
  await page.getByRole('button', { name: 'Polls' }).click();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(`${URL}/game/polls`);
  const pollsContent = await page.locator('main').innerText();
  console.log('\n=== POLLS main content ===');
  console.log(pollsContent.slice(0, 500));

  const hasPollingData = await page.locator('text=Polling Data').count();
  const hasDemographic = await page.locator('text=By Demographic').count();
  console.log(`Has "Polling Data": ${hasPollingData}`);
  console.log(`Has "By Demographic": ${hasDemographic}`);

  // Navigate to Finance
  await page.getByRole('button', { name: 'Finance' }).click();
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(`${URL}/game/finance`);
  const financeContent = await page.locator('main').innerText();
  console.log('\n=== FINANCE main content ===');
  console.log(financeContent.slice(0, 500));

  const hasCampaignFinances = await page.locator('text=Campaign Finances').count();
  const hasTotalRaised = await page.locator('text=Total Raised').count();
  console.log(`Has "Campaign Finances": ${hasCampaignFinances}`);
  console.log(`Has "Total Raised": ${hasTotalRaised}`);
});
