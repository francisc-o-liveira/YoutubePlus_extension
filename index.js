document.addEventListener('DOMContentLoaded', function () {
    const adBlockToggle = document.getElementById('enableExtension');
    const refreshPageButton = document.getElementById('reloadPage');

    chrome.storage.sync.get(['featureEnabled'], function (result) {
        adBlockToggle.checked = result.featureEnabled || false;
    });

    adBlockToggle.addEventListener('change', function () {
        chrome.storage.sync.set({ 'featureEnabled': this.checked }, function () {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.reload(tabs[0].id);
            });
        });
    });

    refreshPageButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.reload(tabs[0].id);
        });
    });
});


document.getElementById('downloadButton').addEventListener('click', function() {
    const url = document.getElementById('downloadUrl').value;
    if (url) {
        window.location.href = url;
    } else {
        alert('Please enter a valid URL.');
    }
});