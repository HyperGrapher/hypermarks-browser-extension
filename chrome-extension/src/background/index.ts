import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

// const manifest = chrome.runtime.getManifest();
// const apiKey = manifest.key;

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded ok..');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
