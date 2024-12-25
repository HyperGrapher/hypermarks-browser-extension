chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'processImage') {
    console.log('processImage');

    const { screenshot, bounds } = message;

    try {
      const img = new Image();
      img.src = screenshot;

      img.onload = () => {
        const canvas = new OffscreenCanvas(bounds.width, bounds.height);
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);

        canvas
          .convertToBlob({ type: 'image/png' })
          .then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
              sendResponse({ success: true, screenshot: reader.result });
            };
            console.log('processImage Done');

            reader.readAsDataURL(blob);
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message });
          });
      };

      img.onerror = () => {
        sendResponse({ success: false, error: 'Failed to load image' });
      };
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }

    return true; // Keep message channel open for async response
  }

  return true;
});
