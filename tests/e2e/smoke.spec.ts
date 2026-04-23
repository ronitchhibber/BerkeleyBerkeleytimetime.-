import { test, expect } from '@playwright/test'

const ROUTES = ['/catalog', '/scheduler', '/gradtrak', '/grades', '/enrollment']

for (const route of ROUTES) {
  test(`route ${route} renders without error boundary`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    // Top nav should always be present
    await expect(page.getByRole('link', { name: 'Catalog' })).toBeVisible()
    // Error boundary fallback should NOT be visible
    await expect(page.getByText(/Something went wrong/i)).not.toBeVisible()
    expect(errors).toEqual([])
  })
}
