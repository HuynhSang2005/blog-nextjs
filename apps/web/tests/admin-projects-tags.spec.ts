import { expect, test } from '@playwright/test'

import { gotoProtected } from './_helpers/auth'

function slugifyForProject(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function ensureTagExistsAndGetUsageCount(
  page: import('@playwright/test').Page,
  resolvedBaseURL: string,
  locale: string,
  tagName: string
): Promise<number> {
  await gotoProtected(page, resolvedBaseURL, locale, `/${locale}/admin/tags`)

  // UI copy may vary slightly ("Quản lý Tags" vs "Quản lý thẻ").
  await expect(
    page
      .getByRole('heading', { name: 'Quản lý Tags', level: 1 })
      .or(page.getByRole('heading', { name: 'Quản lý thẻ', level: 1 }))
  ).toBeVisible()

  const searchInput = page
    .getByPlaceholder('Lọc theo slug...')
    .or(page.getByPlaceholder('Tìm kiếm thẻ...'))

  // Tags admin currently filters by slug, so search using a slug-like term.
  const slugTerm = tagName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  await searchInput.fill(slugTerm)

  // Nếu chưa có tag (table empty), tạo mới.
  const rowCandidate = page
    .getByRole('row', { name: new RegExp(tagName) })
    .first()
  const hasRow = await rowCandidate.isVisible().catch(() => false)
  if (!hasRow) {
    await page
      .getByRole('button', { name: 'Tạo tag mới' })
      .or(page.getByRole('button', { name: 'Tạo thẻ mới' }))
      .click()

    const dialog = page.getByRole('dialog')

    await dialog.getByLabel(/Tên/i).fill(tagName)
    await dialog.getByRole('button', { name: /^Tạo/i }).click()

    await expect(dialog).not.toBeVisible({ timeout: 20_000 })
  }

  // Re-apply filter to be safe after create.
  await searchInput.fill(slugTerm)

  const row = page.getByRole('row', { name: new RegExp(tagName) }).first()
  await expect(row).toBeVisible()

  const usageCell = row.locator('td').nth(3)
  const usageText = (await usageCell.innerText()).trim()
  const usage = Number.parseInt(usageText, 10)

  return Number.isFinite(usage) ? usage : 0
}

test('Projects ↔ Tags: create + edit (usageCount tăng/giảm)', async ({
  page,
  baseURL,
}) => {
  test.setTimeout(120_000)

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
  await gotoProtected(
    page,
    resolvedBaseURL,
    locale,
    `/${locale}/admin/projects/new`
  )

  const titleInput = page.getByPlaceholder('Nhập tiêu đề dự án...')
  await expect(titleInput).toBeVisible({ timeout: 20_000 })
  await titleInput.fill(projectTitle)
  await titleInput.blur()

  // Slug is required; it should auto-generate from the title, but ensure it's
  // actually populated before submitting.
  const slugInput = page
    .getByLabel('Đường dẫn (slug)')
    .or(page.getByPlaceholder('project-slug'))
  const expectedSlug = slugifyForProject(projectTitle)
  await expect(slugInput)
    .toHaveValue(/.+/, { timeout: 5_000 })
    .catch(async () => {
      await slugInput.fill(expectedSlug)
    })

  // Select tag in the multi-select.
  const tagsComboboxButton = page.getByRole('combobox', { name: 'Thẻ' })

  await tagsComboboxButton.click()

  const tagSearch = page.getByPlaceholder('Tìm thẻ...')
  const tagSearchVisibleAfterClick = await tagSearch
    .isVisible()
    .catch(() => false)

  if (!tagSearchVisibleAfterClick) {
    await tagsComboboxButton.focus()
    await page.keyboard.press('Enter')
  }

  await expect(tagSearch).toBeVisible({ timeout: 10_000 })
  await tagSearch.fill(tagName)

  // Cmdk items are exposed as role=option in most cases.
  const option = page.getByRole('option', { name: tagName })
  if (await option.isVisible().catch(() => false)) {
    await option.click()
  } else {
    await page.getByText(tagName, { exact: true }).click()
  }

  await expect(tagsComboboxButton).toHaveText(/Đã chọn\s+1\s+thẻ/i)

  await page.keyboard.press('Escape')

  // Ensure required fields are still populated before submit.
  await titleInput.fill(projectTitle)
  await expect(titleInput).toHaveValue(projectTitle)
  await expect(slugInput)
    .toHaveValue(/.+/)
    .catch(async () => {
      await slugInput.fill(expectedSlug)
    })

  await page.getByRole('button', { name: 'Lưu' }).click()

  // Ensure the create action actually succeeded (otherwise the test can
  // incorrectly continue after a navigation fallback).
  await expect(page.getByText(/Đã tạo dự án thành công/i)).toBeVisible({
    timeout: 20_000,
  })

  await page.waitForURL(new RegExp(`/${locale}/admin/projects(\\?|$)`), {
    timeout: 30_000,
  })

  // Ensure the project was created.
  const projectSearch = page.getByPlaceholder('Tìm kiếm dự án...')
  await expect(projectSearch).toBeVisible({ timeout: 20_000 })

  await projectSearch.fill(projectTitle)
  await page.waitForURL(/search=/, { timeout: 20_000 })
  await expect
    .poll(
      async () =>
        page
          .getByRole('row', { name: new RegExp(projectTitle) })
          .first()
          .isVisible()
          .catch(() => false),
      { timeout: 30_000 }
    )
    .toBe(true)

  // usageCount is derived from relation counts and may be eventually consistent.
  let afterCreate = before
  for (let attempt = 0; attempt < 10; attempt++) {
    afterCreate = await ensureTagExistsAndGetUsageCount(
      page,
      resolvedBaseURL,
      locale,
      tagName
    )

    if (afterCreate === before + 1) break
    await page.waitForTimeout(1000)
  }

  expect(afterCreate).toBe(before + 1)

  // Edit project: remove the tag.
  await gotoProtected(
    page,
    resolvedBaseURL,
    locale,
    `/${locale}/admin/projects`
  )

  await page.getByPlaceholder('Tìm kiếm dự án...').fill(projectTitle)

  const projectRow = page
    .getByRole('row', { name: new RegExp(projectTitle) })
    .first()
  await expect(projectRow).toBeVisible()

  await projectRow.getByRole('button', { name: 'Mở menu' }).click()
  await page.getByRole('menuitem', { name: 'Chỉnh sửa' }).click()

  await page.waitForURL(
    new RegExp(`/${locale}/admin/projects/[0-9a-f-]{36}(\\?|$)`),
    {
      timeout: 20_000,
    }
  )

  // Deselect the tag.
  const tagsComboboxButton2 = page.getByRole('combobox', { name: 'Thẻ' })

  // The project should currently have this tag selected.
  await expect(tagsComboboxButton2).toHaveText(/Đã chọn\s+1\s+thẻ/i, {
    timeout: 20_000,
  })

  await tagsComboboxButton2.click()

  const tagSearch2 = page.getByPlaceholder('Tìm thẻ...')
  const tagSearch2VisibleAfterClick = await tagSearch2
    .isVisible()
    .catch(() => false)

  if (!tagSearch2VisibleAfterClick) {
    await tagsComboboxButton2.focus()
    await page.keyboard.press('Enter')
  }

  await expect(tagSearch2).toBeVisible({ timeout: 10_000 })
  await tagSearch2.fill(tagName)

  const option2 = page.getByRole('option', { name: tagName })
  if (await option2.isVisible().catch(() => false)) {
    await option2.click()
  } else {
    await page.getByText(tagName, { exact: true }).click()
  }

  // After toggling off, there should be no selected tags.
  await page.keyboard.press('Escape')
  await expect(tagsComboboxButton2).toHaveText(/^Chọn thẻ$/i, {
    timeout: 10_000,
  })

  await page.getByRole('button', { name: 'Lưu' }).click()

  await expect(page.getByText(/Đã cập nhật dự án thành công/i)).toBeVisible({
    timeout: 20_000,
  })

  await page.waitForURL(new RegExp(`/${locale}/admin/projects(\\?|$)`), {
    timeout: 30_000,
  })

  let afterEdit = before + 1
  for (let attempt = 0; attempt < 10; attempt++) {
    afterEdit = await ensureTagExistsAndGetUsageCount(
      page,
      resolvedBaseURL,
      locale,
      tagName
    )
    if (afterEdit === before) break
    await page.waitForTimeout(1000)
  }

  expect(afterEdit).toBe(before)
})
