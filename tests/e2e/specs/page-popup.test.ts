describe('Webextension Popup', () => {
  it('should open the popup successfully', async () => {
    const extensionPath = await browser.getExtensionPath();
    const popupUrl = `${extensionPath}/popup/index.html`;
    await browser.url(popupUrl);

    const appDiv = await $('.App').getElement();
    await expect(appDiv).toBeExisting();
  });
});
