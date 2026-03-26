// Background Service Worker for StandupNOW
// Manages timer and opens extension tab when timer ends

const TIMER_ALARM_NAME = 'standupnow_timer';
const DEFAULT_TIMER_INTERVAL_MINUTES = 60; // 1 hour default
const TIMER_STATE_KEY = 'standupnow_timer_state';
const TIMER_CONFIG_KEY = 'standupnow_timer_config';
const ENTRIES_KEY = 'standupnow_entries';

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
    console.log('StandupNOW extension installed');
    await initializeTimer();
});

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
    console.log('StandupNOW extension started');
    await initializeTimer();
});

// Initialize timer
async function initializeTimer() {
    const state = await getTimerState();
    
    // If no timer state exists, create one
    if (!state.lastEntryTime) {
        const entries = await getEntries();
        if (entries.length > 0) {
            // Use the most recent entry time
            const latestEntry = entries[0]; // Already sorted by time (newest first)
            await updateTimerState(latestEntry.time);
        } else {
            // No entries yet, start timer from now
            await updateTimerState(new Date().toISOString());
        }
    } else {
        // Check if timer should have already fired
        await checkAndScheduleTimer();
    }
}

// Get timer state from storage
async function getTimerState() {
    return new Promise((resolve) => {
        chrome.storage.local.get([TIMER_STATE_KEY], (result) => {
            resolve(result[TIMER_STATE_KEY] || {});
        });
    });
}

// Get timer interval from config
async function getTimerInterval() {
    return new Promise((resolve) => {
        chrome.storage.local.get([TIMER_CONFIG_KEY], (result) => {
            const config = result[TIMER_CONFIG_KEY] || { timerMinutes: DEFAULT_TIMER_INTERVAL_MINUTES };
            resolve(config.timerMinutes || DEFAULT_TIMER_INTERVAL_MINUTES);
        });
    });
}

// Update timer state
async function updateTimerState(lastEntryTime) {
    const timerMinutes = await getTimerInterval();
    const state = {
        lastEntryTime: lastEntryTime,
        nextAlarmTime: calculateNextAlarmTime(lastEntryTime, timerMinutes)
    };
    
    await chrome.storage.local.set({ [TIMER_STATE_KEY]: state });
    await scheduleAlarm(state.nextAlarmTime);
    
    console.log('Timer state updated:', state, `(${timerMinutes} minutes)`);
    return state;
}

// Calculate next alarm time based on timer interval
function calculateNextAlarmTime(lastEntryTime, timerMinutes) {
    const lastTime = new Date(lastEntryTime);
    const nextTime = new Date(lastTime.getTime() + timerMinutes * 60 * 1000);
    return nextTime.toISOString();
}

// Schedule alarm
async function scheduleAlarm(nextAlarmTime) {
    // Clear existing alarm
    await chrome.alarms.clear(TIMER_ALARM_NAME);
    
    // Calculate when to fire (in minutes from now)
    const now = new Date();
    const alarmTime = new Date(nextAlarmTime);
    const delayMinutes = Math.max(0.1, (alarmTime - now) / (60 * 1000)); // Minimum 0.1 minutes (6 seconds)
    
    console.log(`Scheduling alarm in ${delayMinutes.toFixed(2)} minutes (at ${alarmTime.toLocaleString()})`);
    
    // Schedule new alarm
    await chrome.alarms.create(TIMER_ALARM_NAME, {
        delayInMinutes: delayMinutes
    });
    
    // Verify alarm was created
    const alarm = await chrome.alarms.get(TIMER_ALARM_NAME);
    if (alarm) {
        console.log('Alarm verified:', new Date(alarm.scheduledTime).toLocaleString());
    } else {
        console.error('Failed to create alarm!');
    }
}

// Check and schedule timer (called on startup or when entries change)
async function checkAndScheduleTimer() {
    const state = await getTimerState();
    
    if (!state.lastEntryTime) {
        await initializeTimer();
        return;
    }
    
    const now = new Date();
    const nextAlarmTime = new Date(state.nextAlarmTime);
    
    // If alarm time has passed, fire immediately ONLY on startup/initialization
    // NOT when a new entry is added (that should reset the timer to future)
    if (nextAlarmTime <= now) {
        console.log('Timer already expired, opening tab now');
        await openTimerEndTab();
    } else {
        // Schedule alarm for future time
        await scheduleAlarm(state.nextAlarmTime);
    }
}

// Handle alarm
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === TIMER_ALARM_NAME) {
        console.log('Timer alarm fired!');
        await openTimerEndTab();
    }
});

// Open timer-end tab (or focus if already open)
async function openTimerEndTab() {
    const timerEndUrl = chrome.runtime.getURL('timer-end.html');
    
    // Check if tab already exists
    const tabs = await chrome.tabs.query({});
    const existingTab = tabs.find(tab => tab.url === timerEndUrl);
    
    if (existingTab) {
        // Tab exists, focus it
        console.log('Timer-end tab already exists, focusing it');
        await chrome.tabs.update(existingTab.id, { active: true });
        await chrome.windows.update(existingTab.windowId, { focused: true });
    } else {
        // Create new tab
        console.log('Creating new timer-end tab');
        await chrome.tabs.create({ url: timerEndUrl, active: true });
    }
}

// Close any open timer-end tabs
async function closeTimerEndTabs() {
    const timerEndUrl = chrome.runtime.getURL('timer-end.html');
    const tabs = await chrome.tabs.query({});
    const timerEndTabs = tabs.filter(tab => tab.url === timerEndUrl);
    
    for (const tab of timerEndTabs) {
        console.log('Closing timer-end tab:', tab.id);
        await chrome.tabs.remove(tab.id);
    }
}

// Get entries from storage
async function getEntries() {
    return new Promise((resolve) => {
        chrome.storage.local.get([ENTRIES_KEY], (result) => {
            resolve(result[ENTRIES_KEY] || []);
        });
    });
}

// Listen for storage changes to detect new entries
chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === 'local' && changes[ENTRIES_KEY]) {
        const newEntries = changes[ENTRIES_KEY].newValue || [];
        const oldEntries = changes[ENTRIES_KEY].oldValue || [];
        
        // Check if new entries were added
        if (newEntries.length > oldEntries.length) {
            console.log('New entry detected, resetting timer');
            
            // Get the latest entry
            const latestEntry = newEntries[0]; // Already sorted by time (newest first)
            
            // Reset timer with the new entry time
            // This will schedule the alarm for the future (entry time + interval)
            await updateTimerState(latestEntry.time);
            
            // Close any open timer-end tabs since user just made an entry
            await closeTimerEndTabs();
        }
    }
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'RESET_TIMER') {
        console.log('Manual timer reset requested');
        const entryTime = message.entryTime || new Date().toISOString();
        updateTimerState(entryTime).then(() => {
            sendResponse({ success: true });
        });
        return true; // Keep channel open for async response
    }
    
    if (message.type === 'GET_TIMER_STATE') {
        getTimerState().then((state) => {
            sendResponse(state);
        });
        return true;
    }
    
    if (message.type === 'UPDATE_TIMER_INTERVAL') {
        console.log('Timer interval update requested:', message.timerMinutes, 'minutes');
        // Save the new interval
        chrome.storage.local.set({
            [TIMER_CONFIG_KEY]: {
                timerMinutes: message.timerMinutes,
                isCustom: message.isCustom || false
            }
        }, async () => {
            // Recalculate and reschedule timer with new interval
            const state = await getTimerState();
            if (state.lastEntryTime) {
                await updateTimerState(state.lastEntryTime);
            }
            sendResponse({ success: true });
        });
        return true;
    }
});

console.log('StandupNOW background service worker loaded');

// Made with Bob