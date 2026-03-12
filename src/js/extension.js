// StandupNOW App JavaScript

// DOM Elements
const notificationBtn = document.getElementById('notificationBtn');
const refreshBtn = document.getElementById('refreshBtn');
const settingsBtn = document.getElementById('settingsBtn');
const syncTimeText = document.getElementById('syncTimeText');

// Initialize Components
let quickJotComponent;
let entriesComponent;
let syncManager;
let syncModalComponent;
let syncTimeInterval;

// Sync time update function
async function updateSyncTime() {
    if (!syncTimeText) return;

    try {
        const result = await new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get(['standupnow_sync_config'], (result) => {
                    resolve(result.standupnow_sync_config);
                });
            } else {
                resolve(null);
            }
        });

        if (result && result.lastSyncTime) {
            const lastSync = new Date(result.lastSyncTime);
            const now = new Date();
            const diffMs = now - lastSync;
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 1) {
                syncTimeText.textContent = 'Just now';
            } else if (diffMins < 60) {
                syncTimeText.textContent = `${diffMins}m ago`;
            } else if (diffMins < 1440) {
                const hours = Math.floor(diffMins / 60);
                syncTimeText.textContent = `${hours}h ago`;
            } else {
                const days = Math.floor(diffMins / 1440);
                syncTimeText.textContent = `${days}d ago`;
            }
        } else {
            syncTimeText.textContent = 'Never';
        }
    } catch (error) {
        console.error('Error updating sync time:', error);
        syncTimeText.textContent = 'Never';
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize the Quick Jot Down component
    quickJotComponent = new QuickJotComponent('quickJotContainer');
    quickJotComponent.init();
    
    // Initialize the entries component
    entriesComponent = new EntriesComponent('entriesContainer');
    entriesComponent.init();
    
    // Initialize sync manager
    syncManager = new SyncManager();
    await syncManager.init();
    
    // Initialize sync modal
    syncModalComponent = new SyncModalComponent(syncManager);
    syncModalComponent.init();
    
    // Start sync time updater
    updateSyncTime();
    syncTimeInterval = setInterval(updateSyncTime, 30000); // Update every 30 seconds
    
    // Connect Quick Jot to Entries - when user submits, add to entries
    quickJotComponent.onSubmit((content) => {
        if (entriesComponent) {
            return entriesComponent.addEntry(content);
        }
        return false;
    });
    
    // Listen for sync complete events to refresh entries and sync time
    window.addEventListener('syncComplete', () => {
        if (entriesComponent) {
            entriesComponent.render();
        }
        updateSyncTime();
    });
});

// Notification button
notificationBtn.addEventListener('click', () => {
    alert('Notifications feature coming soon!');
});

// Refresh button - Opens sync modal
refreshBtn.addEventListener('click', () => {
    if (syncModalComponent) {
        syncModalComponent.show();
    }
    
    // Add rotation animation
    refreshBtn.style.transform = 'rotate(360deg)';
    refreshBtn.style.transition = 'transform 0.5s ease';
    setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
    }, 500);
});

// Settings button
settingsBtn.addEventListener('click', () => {
    const confirmClear = confirm('Settings:\n\nWould you like to clear all entries?');
    if (confirmClear && entriesComponent) {
        entriesComponent.clearAll();
    }
});


// Made with Bob
