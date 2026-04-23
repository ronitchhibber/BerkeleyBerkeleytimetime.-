import { test, expect } from '@playwright/test'

test('grades: page loads with empty state', async ({ page }) => {
  await page.goto('/grades')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: /Grade history/i })).toBeVisible()
  await expect(page.getByText(/Read the/i)).toBeVisible()
})

test('grades: search alias finds COMPSCI 61A', async ({ page }) => {
  await page.goto('/grades')
  await page.waitForLoadState('networkidle')
  await page.getByPlaceholder(/Search for a class/).fill('CS 61A')
  await expect(page.getByText('COMPSCI 61A').first()).toBeVisible()
})
