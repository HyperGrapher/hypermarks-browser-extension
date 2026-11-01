import { initYoutubeMenu } from './youtube-menu';

console.log('>>>>>>>> 999 Content script loaded <<<<<<<<');

initYoutubeMenu();

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'getElementBounds') {
    console.log('getElementBounds');
    const selectorForScreenshot = request.selectorForScreenshot as string;
    // TODO: Add a check for the betslip--active class. If sidebar closed click and open it
    // not working currently
    if (selectorForScreenshot.includes('.betslip.')) {
      const isOpen = document.querySelector('.betslip--active');
      if (!isOpen) {
        console.log('betslip not open');
        document.querySelector<HTMLButtonElement>('[title="Maç"].btn.btn--atrium')?.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('awaited');
      }
    }

    const element = document.querySelector(selectorForScreenshot);
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
