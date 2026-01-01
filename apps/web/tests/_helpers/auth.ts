import { expect, test, type Locator, type Page } from '@playwright/test'

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function setInputValueStable(locator: Locator, value: string) {
  await locator.waitFor({ state: 'visible' })

  // Ensure the input is interactable (React Hook Form can briefly disable during hydration).
  await expect(locator).toBeEnabled()

  // Prefer native Playwright fill first; it triggers proper keyboard/input events.
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await locator.click()
    await locator.fill(value)

    // Hydration can race and wipe values; ensure it stays put long enough.
    await sleep(500)

    if ((await locator.inputValue()) === value) return
  }

  // Second attempt: type with a small delay (can be more reliable than fill on some hydrated forms).
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await locator.click()
    await locator.press('Control+A')
    await locator.type(value, { delay: 20 })

    await sleep(500)

    if ((await locator.inputValue()) === value) return
  }

  // Fallback: set via DOM events.
  await locator.evaluate((el, nextValue) => {
    const input = el as HTMLInputElement
    input.focus()
    input.value = nextValue
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)

  await expect(locator).toHaveValue(value)
}

export async function gotoProtected(
  page: Page,
  resolvedBaseURL: string,
  locale: string,
  targetPath: string
) {
  const adminEmail = process.env.E2E_ADMIN_EMAIL
  const adminPassword = process.env.E2E_ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) {
    test.skip(
      true,
      'Thiếu E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD trong env để đăng nhập admin'
    )
    return
  }

  await page.goto(`${resolvedBaseURL}${targetPath}`, {
    waitUntil: 'domcontentloaded',
  })

  // Already allowed in.
  if (!page.url().startsWith(`${resolvedBaseURL}/${locale}/login`)) return

  // Ensure login route is loaded with a stable redirectTo.
  await page.goto(
    `${resolvedBaseURL}/${locale}/login?redirectTo=${encodeURIComponent(targetPath)}`,
    { waitUntil: 'domcontentloaded' }
  )

  await page.locator('form').first().waitFor({ state: 'visible' })

  // Wait for hydration and fill credentials.
  const emailInput = page.locator('input[type="email"]').first()
  const passwordInput = page.locator('input[type="password"]').first()

  await setInputValueStable(emailInput, adminEmail)
  await setInputValueStable(passwordInput, adminPassword)

  // Submit via click to ensure React onSubmit runs.
  await page.locator('button[type="submit"]').click()

  // Wait for either navigation (router.push) or an inline error.
  const inlineError = page
    .locator(
      'form >> div[class*="bg-destructive"], form >> div[class*="text-destructive"]'
    )
    .first()

  const outcome = await Promise.race<'navigated' | 'error' | 'timeout'>([
    page
      .waitForURL(`${resolvedBaseURL}${targetPath}`, { timeout: 15_000 })
      .then(() => 'navigated' as const)
      .catch(() => 'timeout' as const),
    inlineError
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => 'error' as const)
      .catch(() => 'timeout' as const),
    sleep(15_000).then(() => 'timeout' as const),
  ])

  if (outcome === 'error') {
    const message = (await inlineError.innerText().catch(() => '')).trim()
    throw new Error(`Đăng nhập thất bại: ${message || 'Không rõ nguyên nhân'}`)
  }

  if (outcome === 'navigated') return

  // Some environments can be flaky with client-side router.push; enforce navigation.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await sleep(500)
    await page.goto(`${resolvedBaseURL}${targetPath}`, {
      waitUntil: 'domcontentloaded',
    })

    if (!page.url().startsWith(`${resolvedBaseURL}/${locale}/login`)) return
  }

  throw new Error(
    `Đăng nhập thất bại (vẫn bị redirect về /${locale}/login) khi truy cập: ${targetPath}`
  )
}
