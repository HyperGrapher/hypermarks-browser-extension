import 'webextension-polyfill';

// const manifest = chrome.runtime.getManifest();
// const apiKey = manifest.key;

console.log('background loaded ok..888');
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

// I get the screenshot and bounds as a log. but logs doesn't fire after those. img.onload never fires and image is not croped and logged to the console. find the possible errors and fix please.

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('>>> background captureElement');

  if (request.action === 'captureElement') {
    const tab = sender.tab || (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

    if (!tab) {
      sendResponse({ success: false, error: 'Tab is undefined' });
      return true;
    }

    try {
      const offscreenUrl = chrome.runtime.getURL('offscreen.html');

      // Capture the visible tab
      const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
      console.log({ screenshot });

      const bounds = request.bounds;
      console.log({ BACKGROUND: true, ...bounds });

      // Ensure offscreen document is created
      await chrome.offscreen.createDocument({
        url: offscreenUrl,
        reasons: [chrome.offscreen.Reason.DOM_PARSER],
        justification: 'Crop captured screenshot to specific bounds',
      });

      // Send message to the offscreen document
      chrome.runtime.sendMessage(
        {
          action: 'processImage',
          screenshot,
          bounds,
        },
        response => {
          if (chrome.runtime.lastError) {
            console.error('Offscreen response error:', chrome.runtime.lastError.message);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
          }

          if (response?.success) {
            console.log('Processed screenshot:', response.screenshot);
            sendResponse({ success: true, screenshot: response.screenshot });
          } else {
            sendResponse({ success: false, error: response?.error || 'Image processing failed' });
          }
        },
      );
    } catch (error) {
      console.error('Error during captureElement:', error);
      sendResponse({ success: false, error: (error as Error).message });
    }

    return true; // Keep the message channel open for async response
  }

  sendResponse({ success: false, error: 'Invalid action' });
  return true;
});

// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//   console.log('>>> background captureElement');

//   if (request.action === 'captureElement') {
//     const tab = sender.tab || (await chrome.tabs.query({ active: true, currentWindow: true }))[0];

//     if (!tab) {
//       sendResponse({ success: false, error: 'Tab is undefined' });
//       return true;
//     }

//     try {
//       const offscreenUrl = chrome.runtime.getURL('offscreen.html');

//       // Capture the visible tab
//       const screenshot = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
//       console.log({ screenshot });

//       const bounds = request.bounds;
//       console.log({ BACKGROUND: true, ...bounds });

//       // Use the Offscreen Document API
//       await chrome.offscreen.createDocument({
//         url: offscreenUrl, //'offscreen.html',
//         // @ts-ignore
//         reasons: ['IMAGE_PROCESSING'],
//         // reasons: [chrome.offscreen.Reason.BLOBS],

//         justification: 'Crop captured screenshot to specific bounds',
//       });

//       // await doc

//       chrome.runtime.sendMessage(
//         {
//           action: 'processImage',
//           screenshot,
//           bounds,
//         },
//         response => {
//           if (response?.success) {
//             console.log({ backgrounCapture: response.screenshot });

//             sendResponse({ success: true, screenshot: response.screenshot });
//           } else {
//             sendResponse({ success: false, error: response?.error || 'Image processing failed' });
//           }
//         },
//       );
//     } catch (error) {
//       sendResponse({ success: false, error: (error as Error).message });
//     }

//     return true; // Keep the message channel open for async response
//   }

//   sendResponse({ success: false, error: 'Invalid action' });
//   return true;
// });
