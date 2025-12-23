// Mở sidePanel khi click vào icon extension
chrome.action.onClicked.addListener(async (tab) => {
    try {
        await chrome.sidePanel.open({ tabId: tab.id });
    } catch (error) {
        console.error('Lỗi khi mở sidePanel:', error);
    }
});
