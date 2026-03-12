// StandupNOW App JavaScript

// DOM Elements
const notificationBtn = document.getElementById('notificationBtn');
const refreshBtn = document.getElementById('refreshBtn');
const settingsBtn = document.getElementById('settingsBtn');

// Initialize Components
let quickJotComponent;
let entriesComponent;
let syncManager;
let syncModalComponent;

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
    
    // Connect Quick Jot to Entries - when user submits, add to entries
    quickJotComponent.onSubmit((content) => {
        if (entriesComponent) {
            return entriesComponent.addEntry(content);
        }
        return false;
    });
    
    // Listen for sync complete events to refresh entries
    window.addEventListener('syncComplete', () => {
        if (entriesComponent) {
            entriesComponent.render();
        }
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
