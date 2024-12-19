const path = require('path');
const { executablePath } = require('puppeteer');
console.log({"the-chromium-executable-path": executablePath()});

module.exports = {
  launch: {
    headless: 'new',
    // slowMo: 50, // Optional: Slow down Puppeteer operations for better visibility
    executablePath: executablePath(), // Specify Puppeteer's browser executable path
    // executablePath:'/usr/bin/google-chrome-stable', // Specify Puppeteer's browser executable path
    args: [
      '--no-sandbox',
      // '--disable-setuid-sandbox',
      `--disable-extensions-except=${path.resolve(__dirname, '../../dist')}`, // Specify the `dist` folder
      `--load-extension=${path.resolve(__dirname, '../../dist')}`, // Load the extension
    ],
  },
  browserContext: 'default',
};
