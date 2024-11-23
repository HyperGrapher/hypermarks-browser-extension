export async function getActiveTabIcon(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const activeTab = tabs[0];
      if (activeTab && activeTab.favIconUrl) {
        resolve(activeTab.favIconUrl);
      } else {
        resolve(null);
      }
    });
  });
}

export async function getAllTabIcons(): Promise<
  Array<{ id: number | undefined; title: string | undefined; icon: string | null }>
> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({}, tabs => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const tabIcons = tabs.map(tab => ({
        id: tab.id,
        title: tab.title,
        icon: tab.favIconUrl || null,
      }));
      resolve(tabIcons);
    });
  });
}
