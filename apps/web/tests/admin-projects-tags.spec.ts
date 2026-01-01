import { expect, test } from '@playwright/test'

import { gotoProtected } from './_helpers/auth'

async function ensureTagExistsAndGetUsageCount(
  page: import('@playwright/test').Page,
  resolvedBaseURL: string,
  locale: string,
  tagName: string
): Promise<number> {
  await gotoProtected(page, resolvedBaseURL, locale, `/${locale}/admin/tags`)

  await expect(
    page.getByRole('heading', { name: 'Quản lý thẻ', level: 1 })
  ).toBeVisible()

  const searchInput = page.getByPlaceholder('Tìm kiếm thẻ...')
  await searchInput.fill(tagName)

  // Nếu chưa có tag (table empty), tạo mới.
  const empty = page.getByText('Chưa có thẻ nào.', { exact: false })
  if (await empty.isVisible()) {
    await page.getByRole('button', { name: 'Tạo thẻ mới' }).click()

    await page.getByLabel('Tên thẻ *').fill(tagName)

    await page.getByRole('button', { name: 'Tạo mới' }).click()

    // Table should now show the new tag row.
    await expect(empty).not.toBeVisible({ timeout: 20_000 })
  }

  // Re-apply filter to be safe after create.
  await searchInput.fill(tagName)

  const row = page.getByRole('row', { name: new RegExp(tagName) }).first()
  await expect(row).toBeVisible()

  const usageCell = row.locator('td').nth(3)
  const usageText = (await usageCell.innerText()).trim()
  const usage = Number.parseInt(usageText, 10)

  return Number.isFinite(usage) ? usage : 0
}

test('Projects ↔ Tags: create + edit (usageCount tăng/giảm)', async ({ page, baseURL }) => {
  const resolvedBaseURL = baseURL ?? 'http://localhost:3000'
  const locale = 'vi'

  const tagName = 'Tag Integration E2E'

  const before = await ensureTagExistsAndGetUsageCount(
    page,
    resolvedBaseURL,
    locale,
    tagName
  )

  const now = Date.now()
  const projectTitle = `E2E Project Tags ${now}`

  // Create project with the tag.
  await gotoProtected(page, resolvedBaseURL, locale, `/${locale}/admin/projects/new`)

  await page.getByLabel('Tiêu đề').fill(projectTitle)

  // Select tag in the multi-select.
  await page.getByRole('combobox', { name: /Chọn thẻ|Đã chọn/ }).click()
  await page.getByPlaceholder('Tìm thẻ...').fill(tagName)

  // Cmdk items are exposed as role=option in most cases.
  const option = page.getByRole('option', { name: tagName })
  if (await option.isVisible().catch(() => false)) {
    await option.click()
  } else {
    await page.getByText(tagName, { exact: true }).click()
  }

  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Lưu' }).click()
  await page.waitForURL(`${resolvedBaseURL}/${locale}/admin/projects`, { timeout: 20_000 })

  const afterCreate = await ensureTagExistsAndGetUsageCount(
    page,
    resolvedBaseURL,
    locale,
    tagName
  )

  expect(afterCreate).toBe(before + 1)

  // Edit project: remove the tag.
  await gotoProtected(page, resolvedBaseURL, locale, `/${locale}/admin/projects`)

  await page.getByPlaceholder('Tìm kiếm dự án...').fill(projectTitle)

  const projectRow = page.getByRole('row', { name: new RegExp(projectTitle) }).first()
  await expect(projectRow).toBeVisible()

  await projectRow.getByRole('button', { name: 'Mở menu' }).click()
  await page.getByRole('menuitem', { name: 'Chỉnh sửa' }).click()

  await page.waitForURL(new RegExp(`${resolvedBaseURL}/${locale}/admin/projects/[0-9a-f-]{36}`), {
    timeout: 20_000,
  })

  // Deselect the tag.
  await page.getByRole('combobox', { name: /Chọn thẻ|Đã chọn/ }).click()
  await page.getByPlaceholder('Tìm thẻ...').fill(tagName)

  const option2 = page.getByRole('option', { name: tagName })
  if (await option2.isVisible().catch(() => false)) {
    await option2.click()
  } else {
    await page.getByText(tagName, { exact: true }).click()
  }

  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Lưu' }).click()
  await page.waitForURL(`${resolvedBaseURL}/${locale}/admin/projects`, { timeout: 20_000 })

  const afterEdit = await ensureTagExistsAndGetUsageCount(
    page,
    resolvedBaseURL,
    locale,
    tagName
  )

  expect(afterEdit).toBe(before)
})
