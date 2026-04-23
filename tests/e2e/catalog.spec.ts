import { test, expect } from '@playwright/test'

test('catalog: search alias resolves and detail panel opens', async ({ page }) => {
  await page.goto('/catalog')
  await page.waitForLoadState('networkidle')

  // Sidebar filters present
  await expect(page.getByRole('heading', { name: /Filter classes/i })).toBeVisible()
  await expect(page.getByText('Rate My Professor')).toBeVisible()

  // Search "CS 61A" → should find COMPSCI 61A via alias
  const search = page.getByPlaceholder(/Search Fall 2026/)
  await search.fill('CS 61A')
  await expect(page.getByText('COMPSCI 61A').first()).toBeVisible()

  // Click first result
  await page.getByText('COMPSCI 61A').first().click()

  // Detail panel: instructor visible
  await expect(page.locator('text=/Instructor/i').first()).toBeVisible()

  // Switch through detail tabs without errors
  for (const tabName of ['Sections', 'Ratings', 'Grades', 'Enrollment', 'Overview']) {
    await page.getByRole('button', { name: tabName, exact: true }).click()
    await page.waitForTimeout(150)
  }

  // No error boundary
  await expect(page.getByText(/Something went wrong/i)).not.toBeVisible()
})

test('catalog: RMP filter restricts results', async ({ page }) => {
  await page.goto('/catalog')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: '> 4', exact: true }).click()
  // Chip should appear
  await expect(page.getByText('RMP > 4')).toBeVisible()
})
