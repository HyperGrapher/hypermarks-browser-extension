import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';

describe('Chrome Extension Popup Test', () => {
  let browser: Browser;
  let extensionPage: Page;

  beforeAll(async () => {
    const distPath = path.resolve(__dirname, '../../../dist');

    console.log({ distPath });

    // Launch Puppeteer with the extension loaded
    browser = await puppeteer.launch({
      args: ['--no-sandbox', `--disable-extensions-except=${distPath}`, `--load-extension=${distPath}`],
    });

    const page = await browser.newPage();
    await page.goto('https://example.com/');

    // wait for the background page to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    const targets = browser.targets();
    const backgroundTarget = targets.find(
      target => target.type() === 'background_page' || target.type() === 'service_worker',
    );
    if (!backgroundTarget) throw new Error('Could not find background page');

    // Retrieve the extension ID
    const extensionId = backgroundTarget.url().split('/')[2];
    const popupUrl = `chrome-extension://${extensionId}/popup/index.html`;

    // Open the extension popup
    extensionPage = await browser.newPage();
    await extensionPage.setViewport({ width: 320, height: 400 });

    await extensionPage.goto(popupUrl);
    await extensionPage.screenshot({ path: 'caps/popup-1.png' });
    await new Promise(resolve => setTimeout(resolve, 250));
    await extensionPage.screenshot({ path: 'caps/popup-2.png' });

    // take a screenshot
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Button with ID "test" should exist in the popup', async () => {
    const button = await extensionPage.$('#save-tab');
    expect(button).not.toBeNull();
  });
});
