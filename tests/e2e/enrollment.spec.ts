import { test, expect } from '@playwright/test'

test('enrollment: page loads with empty state', async ({ page }) => {
  await page.goto('/enrollment')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: /Enrollment trends/i })).toBeVisible()
})
