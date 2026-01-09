import { expect, test } from '@playwright/test'
import { gotoProtected } from './_helpers/auth'

test('Media: trang list load + filter/search cập nhật URL', async ({
  page,
  baseURL,
}) => {
  const resolvedBaseURL = baseURL ?? 'http://localhost:3000'
  const locale = 'vi'

  await gotoProtected(page, resolvedBaseURL, locale, `/${locale}/admin/media`)

  await expect(
    page.getByRole('heading', { name: 'Thư viện Media', level: 1 })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Upload Media' })).toBeVisible()

  // Search updates URL and reloads.
  const searchValue = `e2e-${Date.now()}`
  await page.getByPlaceholder('Tìm kiếm theo tên file...').fill(searchValue)

  await page.waitForURL(new RegExp(`\\?(.+&)?search=${searchValue}`), {
    timeout: 20_000,
  })

  // Type filter updates URL and reloads.
  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Hình ảnh' }).click()

  await page.waitForURL(/type=image/, { timeout: 20_000 })
})
