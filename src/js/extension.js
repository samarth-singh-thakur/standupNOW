// StandupNOW App JavaScript

// DOM Elements
const notificationBtn = document.getElementById('notificationBtn');
const refreshBtn = document.getElementById('refreshBtn');
const settingsBtn = document.getElementById('settingsBtn');

// Initialize Components
let quickJotComponent;
let entriesComponent;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the Quick Jot Down component
    quickJotComponent = new QuickJotComponent('quickJotContainer');
    quickJotComponent.init();
    
    // Initialize the entries component
    entriesComponent = new EntriesComponent('entriesContainer');
    entriesComponent.init();
    
    // Connect Quick Jot to Entries - when user submits, add to entries
    quickJotComponent.onSubmit((content) => {
        if (entriesComponent) {
            return entriesComponent.addEntry(content);
        }
        return false;
    });
});

// Notification button
notificationBtn.addEventListener('click', () => {
    alert('Notifications feature coming soon!');
});

// Refresh button
refreshBtn.addEventListener('click', () => {
    if (entriesComponent) {
        entriesComponent.render();
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
