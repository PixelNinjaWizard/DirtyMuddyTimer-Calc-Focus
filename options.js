// Saves options to chrome.storage
function saveOptions() {
    const defaultTimerDuration = document.getElementById('defaultTimerDuration').value;
    chrome.storage.sync.set({
        defaultTimerDuration: defaultTimerDuration
    }, function() {
        // Update status to let user know options were saved
        const status = document.createElement('div');
        status.textContent = 'Options saved.';
        document.body.appendChild(status);
        setTimeout(() => {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences stored in chrome.storage
function restoreOptions() {
    // Use default value 25 minutes
    chrome.storage.sync.get({
        defaultTimerDuration: 25
    }, function(items) {
        document.getElementById('defaultTimerDuration').value = items.defaultTimerDuration;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('settingsForm').addEventListener('submit', event => {
    event.preventDefault(); // Prevent form from submitting normally
    saveOptions();
});
