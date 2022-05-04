chrome.commands.onCommand.addListener((command) => {
  if (command === 'format-task-title') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs[0];

      if (!tab.url.match(/app.clickup.com/)) return;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['contentScript.js'],
      });
    });
  }
});
