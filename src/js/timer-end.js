// Timer End Page JavaScript
// Handles the timer-end response UI

const ENTRIES_KEY = 'standupnow_entries';
const TIMER_STATE_KEY = 'standupnow_timer_state';

// DOM Elements
let quickEntryText;
let submitBtn;
let snoozeBtn;
let dismissBtn;
let lastEntryTime;
let timeElapsed;
let recentEntriesList;
let successMessage;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM elements
    quickEntryText = document.getElementById('quickEntryText');
    submitBtn = document.getElementById('submitBtn');
    snoozeBtn = document.getElementById('snoozeBtn');
    dismissBtn = document.getElementById('dismissBtn');
    lastEntryTime = document.getElementById('lastEntryTime');
    timeElapsed = document.getElementById('timeElapsed');
    recentEntriesList = document.getElementById('recentEntriesList');
    successMessage = document.getElementById('successMessage');

    // Load timer state and entries
    await loadTimerInfo();
    await loadRecentEntries();

    // Set up event listeners
    submitBtn.addEventListener('click', handleSubmit);
    snoozeBtn.addEventListener('click', handleSnooze);
    dismissBtn.addEventListener('click', handleDismiss);

    // Focus on textarea
    quickEntryText.focus();

    // Handle Enter key with Ctrl/Cmd
    quickEntryText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSubmit();
        }
    });
});

// Load timer information
async function loadTimerInfo() {
    try {
        const timerState = await getTimerState();
        const entries = await getEntries();

        if (timerState.lastEntryTime) {
            const lastTime = new Date(timerState.lastEntryTime);
            lastEntryTime.textContent = formatDateTime(lastTime);

            // Calculate elapsed time
            const now = new Date();
            const elapsed = now - lastTime;
            timeElapsed.textContent = formatElapsedTime(elapsed);
        } else if (entries.length > 0) {
            const lastTime = new Date(entries[0].time);
            lastEntryTime.textContent = formatDateTime(lastTime);

            const now = new Date();
            const elapsed = now - lastTime;
            timeElapsed.textContent = formatElapsedTime(elapsed);
        } else {
            lastEntryTime.textContent = 'No entries yet';
            timeElapsed.textContent = 'N/A';
        }
    } catch (error) {
        console.error('Error loading timer info:', error);
        lastEntryTime.textContent = 'Error loading';
        timeElapsed.textContent = 'Error';
    }
}

// Load recent entries
async function loadRecentEntries() {
    try {
        const entries = await getEntries();
        
        if (entries.length === 0) {
            recentEntriesList.innerHTML = '<p class="no-entries-text">No recent entries</p>';
            return;
        }

        // Show last 3 entries
        const recentEntries = entries.slice(0, 3);
        
        recentEntriesList.innerHTML = recentEntries.map(entry => {
            const entryTime = new Date(entry.time);
            const timeAgo = getTimeAgo(entryTime);
            
            return `
                <div class="recent-entry-item">
                    <div class="entry-time">${timeAgo}</div>
                    <div class="entry-content">${escapeHtml(entry.content)}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading recent entries:', error);
        recentEntriesList.innerHTML = '<p class="error-text">Error loading entries</p>';
    }
}

// Handle submit
async function handleSubmit() {
    const content = quickEntryText.value.trim();
    
    if (!content) {
        alert('Please enter your standup update');
        quickEntryText.focus();
        return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Add entry
        const entry = {
            id: generateId(),
            content: content,
            time: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deleted: false
        };

        const entries = await getEntries();
        entries.unshift(entry); // Add to beginning
        await saveEntries(entries);

        // Reset timer
        await chrome.runtime.sendMessage({
            type: 'RESET_TIMER',
            entryTime: entry.time
        });

        // Show success message
        showSuccess();

        // Clear textarea
        quickEntryText.value = '';

        // Reload recent entries
        await loadRecentEntries();
        await loadTimerInfo();

        // Close tab after 2 seconds
        setTimeout(() => {
            window.close();
        }, 2000);

    } catch (error) {
        console.error('Error submitting entry:', error);
        alert('Error submitting entry. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 5L7.5 14L3.5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Submit & Reset Timer
        `;
    }
}

// Handle snooze (15 minutes)
async function handleSnooze() {
    snoozeBtn.disabled = true;
    snoozeBtn.textContent = 'Snoozing...';

    try {
        // Calculate snooze time (15 minutes from now)
        const snoozeTime = new Date();
        snoozeTime.setMinutes(snoozeTime.getMinutes() - 45); // 45 minutes ago = 15 minutes until next alarm
        
        await chrome.runtime.sendMessage({
            type: 'RESET_TIMER',
            entryTime: snoozeTime.toISOString()
        });

        // Show message and close
        alert('Timer snoozed for 15 minutes');
        window.close();
    } catch (error) {
        console.error('Error snoozing timer:', error);
        alert('Error snoozing timer. Please try again.');
        snoozeBtn.disabled = false;
        snoozeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6V10L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            Snooze (15 min)
        `;
    }
}

// Handle dismiss
function handleDismiss() {
    window.close();
}

// Show success message
function showSuccess() {
    successMessage.style.display = 'flex';
    setTimeout(() => {
        successMessage.style.opacity = '1';
    }, 10);
}

// Get timer state
async function getTimerState() {
    return new Promise((resolve) => {
        chrome.storage.local.get([TIMER_STATE_KEY], (result) => {
            resolve(result[TIMER_STATE_KEY] || {});
        });
    });
}

// Get entries from storage
async function getEntries() {
    return new Promise((resolve) => {
        chrome.storage.local.get([ENTRIES_KEY], (result) => {
            resolve(result[ENTRIES_KEY] || []);
        });
    });
}

// Save entries to storage
async function saveEntries(entries) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [ENTRIES_KEY]: entries }, () => {
            resolve();
        });
    });
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date and time
function formatDateTime(date) {
    const options = {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleString('en-US', options);
}

// Format elapsed time
function formatElapsedTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ${minutes % 60} min${minutes % 60 !== 1 ? 's' : ''}`;
    } else {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
}

// Get time ago string
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ago`;
    } else if (hours > 0) {
        return `${hours}h ago`;
    } else if (minutes > 0) {
        return `${minutes}m ago`;
    } else {
        return 'Just now';
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Made with Bob