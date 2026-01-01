const { chromium } = require('playwright');

(async () => {
  const url = 'http://localhost:3000/vi/login';
  const email = 'admin@huynhsang.blog';
  const password = 'Admin@123456';

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const requests = [];
  const responses = [];
  const consoleMsgs = [];
  const pageErrors = [];

  page.on('request', (req) => {
    requests.push({ url: req.url(), method: req.method(), postData: req.postData() });
  });

  page.on('response', async (res) => {
    let body = '';
    try { body = await res.text(); } catch (e) { /* ignore */ }
    responses.push({ url: res.url(), status: res.status(), bodySnippet: body.slice(0, 200) });
  });

  page.on('console', (msg) => {
    consoleMsgs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', (err) => {
    pageErrors.push(String(err));
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for form inputs
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });

    // Fill using real input events
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    // Click submit
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 8000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ]);

    // Wait a bit for any background actions
    await page.waitForTimeout(1500);

    // Capture current URL
    const currentUrl = page.url();

    // Output findings
    const result = {
      currentUrl,
      requests,
      responses,
      consoleMsgs,
      pageErrors,
    };

    console.log('===TRACE-RESULT-START===');
    console.log(JSON.stringify(result, null, 2));
    console.log('===TRACE-RESULT-END===');
  } catch (err) {
    console.error('Error during trace:', err);
  } finally {
    await browser.close();
  }
})();