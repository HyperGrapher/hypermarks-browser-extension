import 'webextension-polyfill';

// const manifest = chrome.runtime.getManifest();
// const apiKey = manifest.key;

console.log('background loaded ok..656');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openSidePanel',
    // TODO: change to your app name
    title: 'SuperTabs side panel',
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openSidePanel') {
    // This will open the panel in all the pages on the current window.
    chrome.sidePanel.open({ windowId: tab?.windowId ?? 0 });
  }
});

// no use
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
