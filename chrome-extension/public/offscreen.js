chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('PROCESS IMAGE IN OFFSCREEN');

  if (message.action === 'processImage') {
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
          .then(async blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const croppedScreenshot = reader.result; //as string;
              chrome.runtime.sendMessage({
                success: true,
                screenshot: croppedScreenshot,
              });
            };
            reader.readAsDataURL(blob);
          })
          .catch(error => {
            chrome.runtime.sendMessage({ success: false, error: error.message });
          });
      };

      img.onerror = () => {
        chrome.runtime.sendMessage({ success: false, error: 'Failed to load image in offscreen document' });
      };
    } catch (error) {
      chrome.runtime.sendMessage({ success: false, error: error.message });
    }
  }
});

// chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
//     if (message.action === 'processImage') {
//       const { screenshot, bounds } = message;

//       try {
//         const img = new Image();
//         img.src = screenshot;

//         img.onload = () => {
//           const canvas = new OffscreenCanvas(bounds.width, bounds.height);
//           const ctx = canvas.getContext('2d');
//           ctx?.drawImage(img, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);

//           canvas
//             .convertToBlob({ type: 'image/png' })
//             .then((blob) => {
//               const reader = new FileReader();
//               reader.onloadend = () => {
//                 const croppedScreenshot = reader.result as string;

//                 // Send the response back
//                 chrome.runtime.sendMessage({
//                   success: true,
//                   screenshot: croppedScreenshot,
//                 });
//               };
//               reader.readAsDataURL(blob);
//             })
//             .catch((error) => {
//               chrome.runtime.sendMessage({ success: false, error: error.message });
//             });
//         };

//         img.onerror = () => {
//           chrome.runtime.sendMessage({ success: false, error: 'Failed to load image in offscreen document' });
//         };
//       } catch (error) {
//         chrome.runtime.sendMessage({ success: false, error: (error as Error).message });
//       }
//     }
//   });

/*
is manifest correct?


*/
