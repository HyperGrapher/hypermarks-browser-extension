console.log('>>>>>>>> 888 Content script loaded <<<<<<<<');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getElementBounds') {
    console.log('getElementBounds');

    console.log('yes received co');

    const element = document.querySelector('article[data-testid="tweet"][tabindex="-1"]');
    console.log(element ? 'Yes element found' : 'nope element not found');

    if (element) {
      const rect = element.getBoundingClientRect();
      console.log({
        content: true,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });

      sendResponse({
        success: true,
        bounds: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
      });
    } else {
      sendResponse({ success: false, error: 'Element not found' });
    }
  }
  return true;
});
