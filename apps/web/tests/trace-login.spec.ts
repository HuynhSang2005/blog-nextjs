import { test, expect } from '@playwright/test'

test('trace login', async ({ page }) => {
  const requests: Array<{
    url: string
    method: string
    postData: string | null
  }> = []
  const responses: Array<{ url: string; status: number }> = []
  const consoleMsgs: Array<{ type: string; text: string }> = []

  page.on('request', r =>
    requests.push({ url: r.url(), method: r.method(), postData: r.postData() })
  )
  page.on('response', async r =>
    responses.push({ url: r.url(), status: r.status() })
  )
  page.on('console', msg =>
    consoleMsgs.push({ type: msg.type(), text: msg.text() })
  )

  const url = 'http://localhost:3000/vi/login'
  await page.goto(url, { waitUntil: 'networkidle' })

  await page.waitForSelector('input[type="email"]', { timeout: 5000 })
  await page.fill('input[type="email"]', 'admin@huynhsang.blog')
  await page.fill('input[type="password"]', 'Admin@123456')

  await Promise.all([
    page
      .waitForNavigation({ waitUntil: 'networkidle', timeout: 8000 })
      .catch(() => null),
    page.click('button[type="submit"]'),
  ])

  // Give some time for any background actions to finish
  await page.waitForTimeout(1000)

  console.log('CURRENT_URL:', page.url())
  console.log('CONSOLE_MSGS:', consoleMsgs.slice(-20))
  console.log('REQUESTS:', requests.slice(-20))
  console.log('RESPONSES:', responses.slice(-20))

  expect(page.url()).toMatch(/login|admin/)
})
