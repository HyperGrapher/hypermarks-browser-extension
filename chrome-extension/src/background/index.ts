import 'webextension-polyfill';

// const manifest = chrome.runtime.getManifest();
// const apiKey = manifest.key;

console.log('background loaded ok..656');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'open-side-panel') {
    chrome.sidePanel.setOptions(
      {
        path: 'side-panel/index.html',
        enabled: true, // Make sure it's enabled
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Error opening side panel:', chrome.runtime.lastError);
        } else {
          console.log('Side panel opened successfully');
        }
      },
    );
  }
});
