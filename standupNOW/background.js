const ALARM_NAME = "hourly-checkin";
const NOTIF_ID = "hourly-checkin-notification";
const SNOOZE_CHECK_ALARM = "snooze-check";

// Store the last active tab ID before opening checkin
let lastActiveTabId = null;

// Update badge with countdown timer
async function updateBadge() {
  const data = await chrome.storage.local.get(['snoozeUntil']);
  
  // Check if snoozed
  if (data.snoozeUntil && Date.now() < data.snoozeUntil) {
    chrome.action.setBadgeText({ text: "ZZZ" });
    chrome.action.setBadgeBackgroundColor({ color: "#ff9800" });
    return;
  }
  
  const alarms = await chrome.alarms.getAll();
  const alarm = alarms.find(a => a.name === ALARM_NAME);
  
  if (!alarm) {
    chrome.action.setBadgeText({ text: "" });
    return;
  }
  
  const now = Date.now();
  const timeLeft = Math.max(0, alarm.scheduledTime - now);
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  let badgeText;
  if (hours > 0) {
    badgeText = `${hours}:${String(minutes).padStart(2, '0')}`;
  } else if (minutes > 0) {
    badgeText = `${minutes}:${String(seconds).padStart(2, '0')}`;
  } else if (seconds > 0) {
    badgeText = `0:${String(seconds).padStart(2, '0')}`;
  } else {
    badgeText = "NOW";
  }
  
  // Set color based on time remaining
  if (timeLeft === 0) {
    chrome.action.setBadgeBackgroundColor({ color: "#ff4444" });
  } else if (timeLeft <= 5 * 60 * 1000) { // 5 minutes or less
    chrome.action.setBadgeBackgroundColor({ color: "#ff9800" });
  } else {
    chrome.action.setBadgeBackgroundColor({ color: "#FFD700" });
  }
  
  chrome.action.setBadgeText({ text: badgeText });
}

// Get current frequency setting
async function getFrequency() {
  const data = await chrome.storage.local.get(['frequency']);
  return data.frequency || 60;
}

// Check if currently snoozed
async function isSnoozed() {
  const data = await chrome.storage.local.get(['snoozeUntil']);
  return data.snoozeUntil && Date.now() < data.snoozeUntil;
}

// Create alarm with current frequency
async function createAlarm() {
  const frequency = await getFrequency();
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: frequency,
    periodInMinutes: frequency
  });
  console.log(`Alarm created with ${frequency} minute interval`);
}

// Create alarm on install
chrome.runtime.onInstalled.addListener(async () => {
  await createAlarm();
  // Create snooze check alarm (checks every minute)
  chrome.alarms.create(SNOOZE_CHECK_ALARM, { periodInMinutes: 1 });
  // Initial badge update
  updateBadge();
  // Start badge update interval (every second)
  startBadgeUpdateInterval();
});

// Update badge every second
function startBadgeUpdateInterval() {
  // Update immediately
  updateBadge();
  // Then update every second
  setInterval(() => {
    updateBadge();
  }, 1000);
}

// Start badge updates when service worker starts
startBadgeUpdateInterval();

// Handle all alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    // Check if snoozed before showing notification
    if (await isSnoozed()) {
      console.log("Notification suppressed - currently snoozed");
      return;
    }

    console.log("Alarm triggered - opening checkin tab");
    
    // Get the current active tab before opening checkin
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab && activeTab.id) {
        lastActiveTabId = activeTab.id;
        await chrome.storage.local.set({ lastActiveTabId: activeTab.id });
        console.log("Stored last active tab:", activeTab.id);
      }
    } catch (err) {
      console.error("Error getting active tab:", err);
    }
    
    // Open checkin page in a new tab
    chrome.tabs.create({ url: chrome.runtime.getURL("checkin.html") });
    
    // Update badge immediately
    updateBadge();
  } else if (alarm.name === SNOOZE_CHECK_ALARM) {
    // Check if snooze period has ended
    const data = await chrome.storage.local.get(['snoozeUntil']);
    if (data.snoozeUntil && Date.now() >= data.snoozeUntil) {
      // Snooze period ended, remove it
      await chrome.storage.local.remove('snoozeUntil');
      console.log("Snooze period ended");
    }
    // Update badge every minute
    updateBadge();
  }
});

// Handle notification click
chrome.notifications.onClicked.addListener((id) => {
  if (id !== NOTIF_ID) return;
  chrome.tabs.create({ url: chrome.runtime.getURL("checkin.html") });
});

// Handle messages from checkin page
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "resetTimer") {
    // Clear existing alarm and create a new one with current frequency
    chrome.alarms.clear(ALARM_NAME, async () => {
      await createAlarm();
      console.log("Timer reset");
      updateBadge(); // Update badge after reset
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  } else if (message.action === "updateFrequency") {
    // Update alarm with new frequency - clear and recreate immediately
    chrome.alarms.clear(ALARM_NAME, () => {
      chrome.alarms.create(ALARM_NAME, {
        periodInMinutes: message.frequency,
        delayInMinutes: message.frequency // Start the first alarm after the new frequency
      });
      console.log(`Frequency updated to ${message.frequency} minutes`);
      updateBadge(); // Update badge after frequency change
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  } else if (message.action === "enableSnooze") {
    console.log(`Snooze enabled until ${new Date(message.snoozeUntil).toLocaleString()}`);
    updateBadge(); // Update badge to show snooze
    sendResponse({ success: true });
  } else if (message.action === "disableSnooze") {
    console.log("Snooze disabled");
    updateBadge(); // Update badge after snooze disabled
    sendResponse({ success: true });
  } else if (message.action === "returnToLastTab") {
    // Return to the last active tab and close current tab
    try {
      const data = await chrome.storage.local.get(['lastActiveTabId']);
      const tabId = data.lastActiveTabId;
      
      if (tabId) {
        // Check if the tab still exists
        try {
          await chrome.tabs.get(tabId);
          // Tab exists, switch to it
          await chrome.tabs.update(tabId, { active: true });
          console.log("Switched to last active tab:", tabId);
        } catch (err) {
          console.log("Last active tab no longer exists");
        }
      }
      
      // Close the current checkin tab
      if (sender.tab && sender.tab.id) {
        chrome.tabs.remove(sender.tab.id);
      }
      
      sendResponse({ success: true });
    } catch (err) {
      console.error("Error returning to last tab:", err);
      sendResponse({ success: false, error: err.message });
    }
    return true; // Keep message channel open for async response
  }
});
