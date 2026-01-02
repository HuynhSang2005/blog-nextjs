import { expect, test } from '@playwright/test'

import { gotoProtected } from './_helpers/auth'

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

test('Admin tạo Docs → public truy cập được theo slug', async ({
  page,
  baseURL,
}) => {
  const resolvedBaseURL = baseURL ?? 'http://localhost:3000'
  const locale = 'vi'

  const now = Date.now()
  const slug = `e2e-doc-${now}`
  const title = `E2E Docs ${now}`
  const description = 'Trang test e2e để xác nhận public docs không 404.'
  const content = `# Nội dung test\n\nSlug: ${slug}`

  await gotoProtected(
    page,
    resolvedBaseURL,
    locale,
    `/${locale}/admin/docs/new`
  )

  await expect(
    page.getByRole('heading', { name: 'Tạo tài liệu mới', level: 1 })
  ).toBeVisible()

  await page.getByLabel('Tiêu đề *').fill(title)
  await page.getByLabel('Slug *').fill(slug)
  await page.getByLabel('Mô tả').fill(description)

  // MDX editor: dùng aria-label "editable markdown" để tránh flaky.
  await page.getByRole('textbox', { name: 'editable markdown' }).fill(content)

  // Submit chắc chắn: form.requestSubmit() + đợi POST 200 + đợi redirect sang trang edit.
  const postUrl = `${resolvedBaseURL}/${locale}/admin/docs/new`

  const postResponsePromise = page.waitForResponse(resp => {
    const request = resp.request()
    return (
      request.method() === 'POST' &&
      resp.status() === 200 &&
      resp.url().startsWith(postUrl)
    )
  })

  await page.evaluate(() => {
    const form = document.querySelector('form') as HTMLFormElement | null
    form?.requestSubmit()
  })

  await postResponsePromise

  await page.waitForURL(new RegExp(`/${locale}/admin/docs/[0-9a-f-]{36}`), {
    timeout: 20_000,
  })

  // Verify public route resolves (no 404) and renders expected title/description.
  await page.goto(`${resolvedBaseURL}/${locale}/docs/${slug}`, {
    waitUntil: 'domcontentloaded',
  })

  await expect(
    page.getByRole('heading', { name: title, level: 1 })
  ).toBeVisible()

  await expect(page.getByText(description)).toBeVisible()
  // Public docs renders MDX -> HTML (heading is parsed, no leading '#').
  await expect(
    page.getByRole('heading', { name: 'Nội dung test' })
  ).toBeVisible()

  // Extra guard: ensure we're not on the not-found UI.
  await expect(
    page.getByText('Không tìm thấy', { exact: false })
  ).not.toBeVisible()

  // Optional: ensure slug is present in rendered content.
  await expect(page.getByText(new RegExp(escapeRegExp(slug)))).toBeVisible()
})
