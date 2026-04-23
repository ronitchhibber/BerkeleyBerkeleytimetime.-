import { test, expect } from '@playwright/test'

test('gradtrak: hero + Plan my path + sidebar buttons render', async ({ page }) => {
  await page.goto('/gradtrak')
  await page.waitForLoadState('networkidle')

  await expect(page.getByRole('heading', { name: /Map your.*path to.*graduation/s })).toBeVisible()
  await expect(page.getByRole('button', { name: /Plan my path/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Share link/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Import from CalCentral/i })).toBeVisible()
})

test('gradtrak: Add semester button opens picker', async ({ page }) => {
  await page.goto('/gradtrak')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /Add semester/i }).click()
  await expect(page.getByText('New Semester')).toBeVisible()
})
