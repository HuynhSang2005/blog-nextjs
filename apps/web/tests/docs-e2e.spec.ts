import { test, expect } from '@playwright/test'

test('create doc via admin UI with MDX editor (keyboard typing) and verify public render', async ({
  page,
}) => {
  const base = 'http://localhost:3000'
  const locale = 'vi'
  const loginUrl = `${base}/${locale}/login`
  const newDocUrl = `${base}/${locale}/admin/docs/new`

  // Login
  await page.goto(loginUrl, { waitUntil: 'networkidle' })
  await page.fill('input[type="email"]', 'admin@huynhsang.blog')
  await page.fill('input[type="password"]', 'Admin@123456')
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => null),
    page.click('button[type="submit"]'),
  ])

  // Go to New Doc page
  await page.goto(newDocUrl, { waitUntil: 'networkidle' })
  // Wait for the title input (label: "Tiêu đề") to appear
  await page.getByLabel('Tiêu đề').waitFor({ timeout: 5000 })

  // Fill title & slug
  const timestamp = Date.now()
  const title = `E2E Doc ${timestamp}`
  const slug = `e2e-doc-${timestamp}`

  await page.getByLabel('Tiêu đề').fill(title)
  // slug may auto-generate; set it explicitly using the label for the slug field
  await page.getByLabel('Slug').fill(slug)

  // Wait for MDX editor to initialize (editor shows editor area with contentEditable)
  await page.waitForSelector('.prose[contenteditable="true"]', {
    timeout: 10000,
  })

  // Focus the MDX editor and type content via keyboard events
  const editor = await page.$('.prose[contenteditable="true"]')
  if (!editor) throw new Error('MDX editor not found on page')

  await editor.click()

  const mdxContent =
    '# E2E Editor Content\n\nThis was typed by Playwright.\n\n- item 1\n- item 2\n\n```tsx\nexport default function X() { return <div>hello</div> }\n```'

  // Type the content (simulate human typing)
  await page.keyboard.type(mdxContent, { delay: 10 })

  // Verify that the editor contains the typed text before saving
  await expect(
    page.locator('.prose:has-text("This was typed by Playwright.")')
  ).toBeVisible({ timeout: 5000 })

  // Click Save and wait for navigation to detail page
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }),
    page.click('button[type="submit"]'),
  ])
  // After save, URL should be /vi/admin/docs/<id>
  const currentUrl = page.url()
  expect(currentUrl).toMatch(new RegExp(`/${locale}/admin/docs/`))

  // Read the actual slug from the slug input on the detail page (may have been normalized)
  const actualSlug = await page.getByLabel('Slug').inputValue()

  // Verify that the content saved in admin detail page contains the typed text
  await expect(
    page.locator('.prose:has-text("This was typed by Playwright." )')
  ).toBeVisible({ timeout: 5000 })

  // Verify the saved doc exists in the DB via Supabase REST API (fast deterministic check)
  const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!apiUrl || !anonKey) {
    console.warn('Supabase env vars not found; skipping REST check')
  } else {
    const apiResp = await fetch(
      `${apiUrl}/rest/v1/docs?slug=eq.${encodeURIComponent(actualSlug)}&select=id,slug,title,content,locale`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      }
    )

    const docs = await apiResp.json()
    if (!Array.isArray(docs) || docs.length === 0) {
      throw new Error('Doc not found in Supabase after save')
    }

    // Optionally inspect content server-side
    if (
      !docs[0].content ||
      !docs[0].content.includes('This was typed by Playwright.')
    ) {
      console.log('Saved doc content (server):', docs[0].content?.slice(0, 200))
      throw new Error('Saved doc content does not contain expected text')
    }
  }

  // Verify public page using the actual slug — poll for revalidation to catch eventual consistency
  const publicUrl = `${base}/${locale}/docs/${actualSlug}`
  const maxAttempts = 20
  let found = false
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await page.goto(publicUrl, { waitUntil: 'networkidle' })
    } catch (_err) {
      // continue retrying
    }

    // Try to find either title or the typed content
    const titleFound = await page
      .locator('h1')
      .first()
      .innerText()
      .catch(() => null)
    const contentFound = await page
      .locator('text=This was typed by Playwright.')
      .first()
      .isVisible()
      .catch(() => false)

    if (titleFound?.includes(title) || contentFound) {
      found = true
      break
    }

    // Wait and retry
    await page.waitForTimeout(1000)
  }

  if (!found) {
    const html = await page.content()
    console.log('PUBLIC PAGE HTML SNIPPET (final):', html.slice(0, 800))
    throw new Error('Doc content not found on public page after retries')
  }

  await expect(page.locator('text=item 1')).toBeVisible()
  await expect(page.locator('text=hello')).toBeVisible()
})
