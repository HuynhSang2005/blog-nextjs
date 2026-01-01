import { expect, test } from '@playwright/test'

import { gotoProtected } from './_helpers/auth'

test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

test('Settings: trang load + copy button hiển thị toast', async ({ page, baseURL }) => {
  const resolvedBaseURL = baseURL ?? 'http://localhost:3000'
  const locale = 'vi'

  await gotoProtected(page, resolvedBaseURL, locale, `/${locale}/admin/settings`)

  await expect(page.getByRole('heading', { name: 'Cài đặt', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Thông tin trang web' })).toBeVisible()

  // Click copy button next to "Tên trang web" and expect toast.
  const siteNameBlock = page.locator('label', { hasText: 'Tên trang web' }).first().locator('..')
  await siteNameBlock.getByRole('button').click()

  await expect(page.getByText(/Đã sao chép/i)).toBeVisible({ timeout: 10_000 })
})
