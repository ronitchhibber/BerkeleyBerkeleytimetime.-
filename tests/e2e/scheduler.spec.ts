import { test, expect } from '@playwright/test'

test('scheduler: page renders calendar + add buttons', async ({ page }) => {
  await page.goto('/scheduler')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('heading', { name: /My classes/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Add class/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Add event/i })).toBeVisible()

  // Calendar day headers
  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
    await expect(page.getByText(day, { exact: true })).toBeVisible()
  }
})

test('scheduler: Add event modal opens + closes', async ({ page }) => {
  await page.goto('/scheduler')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /Add event/i }).click()
  await expect(page.getByText('Add a custom event')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByText('Add a custom event')).not.toBeVisible()
})
