// Motivational quotes
const motivationalQuotes = [
  '"Small wins are the building blocks of larger success." — Karl Weick',
  '"What gets measured gets improved." — Peter Drucker',
  '"You do not rise to the level of your goals. You fall to the level of your systems." — James Clear',
  '"Self-observation is the first step toward self-control." — Behavioral principle',
  '"Awareness precedes change." — Daniel Siegel',
  '"We are what we repeatedly do." — Aristotle',
  '"Motivation is what gets you started. Habit is what keeps you going." — Jim Rohn',
  '"The chains of habit are too weak to be felt until they are too strong to be broken." — Samuel Johnson'
];

// Get a random quote
function getRandomQuote() {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

// Format date and time for display
function formatDateTime(isoString) {
  const date = new Date(isoString);
  const options = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}

// Format date and time for copy (more detailed)
function formatDateTimeForCopy(isoString) {
  const date = new Date(isoString);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}

// Track if we've shown the toast for current timer
let toastShownForCurrentTimer = false;

// Show toast notification
function showToast(message, icon = '⏰') {
  // Remove any existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  
  // Remove toast after animation completes
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Update countdown timer
async function updateCountdown() {
  const data = await chrome.storage.local.get(['snoozeUntil']);
  
  // Check if snoozed
  if (data.snoozeUntil && Date.now() < data.snoozeUntil) {
    document.getElementById("countdown").textContent = "SNOOZED";
    toastShownForCurrentTimer = false; // Reset when snoozed
    return;
  }
  
  const alarms = await chrome.alarms.getAll();
  const alarm = alarms.find(a => a.name === "hourly-checkin");
  
  if (!alarm) {
    document.getElementById("countdown").textContent = "--:--:--";
    toastShownForCurrentTimer = false; // Reset when no alarm
    return;
  }
  
  const now = Date.now();
  const timeLeft = Math.max(0, alarm.scheduledTime - now);
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  document.getElementById("countdown").textContent = formatted;
  
  // Show toast when timer reaches zero (only once per timer cycle)
  if (timeLeft === 0 && !toastShownForCurrentTimer) {
    showToast('Time to ship something! 🚀', '⏰');
    toastShownForCurrentTimer = true;
  }
  
  // Reset toast flag when timer is reset (timeLeft > 0 after being 0)
  if (timeLeft > 60000) { // More than 1 minute means timer was reset
    toastShownForCurrentTimer = false;
  }
}

// Update snooze display
async function updateSnoozeDisplay() {
  const data = await chrome.storage.local.get(['snoozeUntil']);
  const snoozeStatus = document.getElementById('snoozeStatus');
  const snoozeTimer = document.getElementById('snoozeTimer');
  const snoozeToggle = document.getElementById('snoozeToggle');
  
  if (data.snoozeUntil && Date.now() < data.snoozeUntil) {
    const timeLeft = data.snoozeUntil - Date.now();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    snoozeStatus.textContent = '🔕 Snoozed';
    snoozeStatus.className = 'snooze-status active';
    snoozeTimer.textContent = `Resumes in ${hours}h ${minutes}m`;
    snoozeToggle.classList.add('active');
  } else {
    snoozeStatus.textContent = 'Snooze Off';
    snoozeStatus.className = 'snooze-status inactive';
    snoozeTimer.textContent = '';
    snoozeToggle.classList.remove('active');
  }
}

// Load settings
async function loadSettings() {
  const data = await chrome.storage.local.get(['frequency']);
  const frequency = data.frequency || 60;
  const select = document.getElementById('frequencySelect');
  
  // Check if it's a custom frequency
  const standardValues = ['15', '30', '45', '60', '90', '120'];
  if (standardValues.includes(String(frequency))) {
    select.value = frequency;
  } else {
    // It's a custom value
    select.value = 'custom';
    document.getElementById('customFrequencyContainer').style.display = 'block';
    document.getElementById('customFrequency').value = frequency;
  }
}

// Save frequency setting
async function saveFrequency(minutes) {
  await chrome.storage.local.set({ frequency: minutes });
  chrome.runtime.sendMessage({ action: "updateFrequency", frequency: minutes }, () => {
    // Force countdown update after frequency change
    setTimeout(updateCountdown, 100);
  });
}

// Handle custom frequency
function applyCustomFrequency() {
  const customValue = parseInt(document.getElementById('customFrequency').value);
  
  if (!customValue || customValue < 1 || customValue > 1440) {
    showStatus("Please enter a value between 1 and 1440 minutes", true);
    return;
  }
  
  saveFrequency(customValue);
  showStatus(`✓ Custom frequency set to ${customValue} minutes`);
}

// Toggle snooze
async function toggleSnooze() {
  const data = await chrome.storage.local.get(['snoozeUntil']);
  
  if (data.snoozeUntil && Date.now() < data.snoozeUntil) {
    // Turn off snooze
    await chrome.storage.local.remove('snoozeUntil');
    chrome.runtime.sendMessage({ action: "disableSnooze" });
    showStatus("✓ Snooze disabled");
  } else {
    // Turn on snooze for 3 hours
    const snoozeUntil = Date.now() + (3 * 60 * 60 * 1000);
    await chrome.storage.local.set({ snoozeUntil });
    chrome.runtime.sendMessage({ action: "enableSnooze", snoozeUntil });
    showStatus("🔕 Snoozed for 3 hours");
  }
  
  updateSnoozeDisplay();
  updateCountdown();
}

// Display all entries
async function displayEntries() {
  const data = await chrome.storage.local.get("entries");
  const entries = data.entries || [];
  const entriesDiv = document.getElementById("entries");
  const entryCount = document.getElementById("entryCount");
  
  entryCount.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;
  
  if (entries.length === 0) {
    entriesDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">No check-ins yet.<br>Start tracking your productivity!</div>
      </div>
    `;
    return;
  }
  
  entriesDiv.innerHTML = entries.map((entry, index) => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-time">${formatDateTime(entry.time)}</span>
      </div>
      <div class="entry-note">${escapeHtml(entry.note)}</div>
      <button class="copy-btn" data-index="${index}">📋</button>
    </div>
  `).join('');
  
  // Add click handlers to copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt(e.target.dataset.index);
      const entry = entries[index];
      const textToCopy = `${formatDateTimeForCopy(entry.time)}\n\n${entry.note}`;
      
      try {
        await navigator.clipboard.writeText(textToCopy);
        e.target.textContent = '✓';
        e.target.classList.add('copied');
        setTimeout(() => {
          e.target.textContent = '📋';
          e.target.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
  });
}

// Copy all today's entries
async function copyTodayEntries() {
  const data = await chrome.storage.local.get("entries");
  const entries = data.entries || [];
  
  // Filter entries from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntries = entries.filter(entry => {
    const entryDate = new Date(entry.time);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });
  
  if (todayEntries.length === 0) {
    showStatus("No entries from today to copy", true);
    return;
  }
  
  // Format all entries
  const formattedEntries = todayEntries.map(entry =>
    `${formatDateTimeForCopy(entry.time)}\n${entry.note}`
  ).join('\n\n---\n\n');
  
  const header = `📋 Today's Check-ins (${todayEntries.length} ${todayEntries.length === 1 ? 'entry' : 'entries'})\n\n`;
  const textToCopy = header + formattedEntries;
  
  try {
    await navigator.clipboard.writeText(textToCopy);
    const btn = document.getElementById('copyTodayBtn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 Copy Today\'s Entries';
      btn.classList.remove('copied');
    }, 2000);
    showStatus(`✓ Copied ${todayEntries.length} ${todayEntries.length === 1 ? 'entry' : 'entries'} from today`);
  } catch (err) {
    console.error('Failed to copy:', err);
    showStatus("Failed to copy entries", true);
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show status message
function showStatus(message, isError = false) {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = message;
  statusDiv.className = isError ? 'error' : 'success';

  setTimeout(() => {
    statusDiv.textContent = "";
    statusDiv.className = "";
  }, 3000);
}

// Update quote periodically
function updateQuote() {
  const quoteElement = document.querySelector('.quote-text');
  if (quoteElement) {
    quoteElement.textContent = getRandomQuote();
  }
}

// Return to last active tab
async function returnToLastTab() {
  chrome.runtime.sendMessage({ action: "returnToLastTab" }, (response) => {
    if (!response || !response.success) {
      console.error("Failed to return to last tab");
      // If returning fails, just close the current tab
      window.close();
    }
  });
}

// Save check-in
async function saveCheckin() {
  const note = document.getElementById("note").value.trim();
  if (!note) {
    showStatus("Please enter a note!", true);
    return;
  }

  const entry = { time: new Date().toISOString(), note };
  const data = await chrome.storage.local.get("entries");
  const entries = data.entries || [];
  entries.unshift(entry);
  await chrome.storage.local.set({ entries });

  document.getElementById("note").value = "";
  
  // Clear draft after successful save
  await chrome.storage.local.remove('draft');
  
  // Reset timer
  toastShownForCurrentTimer = false;
  chrome.runtime.sendMessage({ action: "resetTimer" });
  
  // Return to last tab after a brief delay to show success
  showStatus("✓ Saved! Returning to your tab...");
  setTimeout(() => {
    returnToLastTab();
  }, 500);
}

// Skip check-in and return to last tab
async function skipCheckin() {
  // Clear draft
  await chrome.storage.local.remove('draft');
  
  // Reset timer
  toastShownForCurrentTimer = false;
  chrome.runtime.sendMessage({ action: "resetTimer" });
  
  // Return to last tab
  showStatus("⏭️ Skipped. Returning to your tab...");
  setTimeout(() => {
    returnToLastTab();
  }, 300);
}

// Auto-save draft
let draftTimeout;
function autoSaveDraft() {
  clearTimeout(draftTimeout);
  draftTimeout = setTimeout(async () => {
    const note = document.getElementById("note").value.trim();
    if (note) {
      await chrome.storage.local.set({ draft: note });
    } else {
      await chrome.storage.local.remove('draft');
    }
  }, 500); // Save after 500ms of no typing
}

// Load draft
async function loadDraft() {
  const data = await chrome.storage.local.get('draft');
  if (data.draft) {
    document.getElementById("note").value = data.draft;
    showStatus("📝 Draft restored", false);
  }
}

// Delete draft
async function deleteDraft() {
  await chrome.storage.local.remove('draft');
  document.getElementById("note").value = "";
  showStatus("🗑️ Draft deleted");
}

// Toggle settings visibility
document.getElementById('toggleSettings').onclick = function() {
  const content = document.getElementById('settingsContent');
  const button = document.getElementById('toggleSettings');
  
  if (content.classList.contains('active')) {
    content.classList.remove('active');
    button.textContent = 'Show';
  } else {
    content.classList.add('active');
    button.textContent = 'Hide';
  }
};

// Frequency change handler
document.getElementById('frequencySelect').onchange = function() {
  const value = this.value;
  
  if (value === 'custom') {
    // Show custom input
    document.getElementById('customFrequencyContainer').style.display = 'block';
    document.getElementById('customFrequency').focus();
  } else {
    // Hide custom input and apply preset
    document.getElementById('customFrequencyContainer').style.display = 'none';
    const minutes = parseInt(value);
    saveFrequency(minutes);
    showStatus(`✓ Frequency updated to ${minutes} minutes`);
  }
};

// Handle custom frequency
function applyCustomFrequency() {
  const customValue = parseInt(document.getElementById('customFrequency').value);
  const btn = document.getElementById('applyCustomFrequency');
  
  if (!customValue || customValue < 1 || customValue > 1440) {
    showStatus("Please enter a value between 1 and 1440 minutes", true);
    return;
  }
  
  // Add click animation
  btn.classList.add('btn-click-animation');
  setTimeout(() => btn.classList.remove('btn-click-animation'), 300);
  
  saveFrequency(customValue);
  showStatus(`✓ Custom frequency set to ${customValue} minutes`);
  
  // Keep the custom input visible with the applied value
  // This makes it clear what's currently set and allows easy modification
}

// Custom frequency apply button
document.getElementById('applyCustomFrequency').onclick = applyCustomFrequency;

// Copy today's entries button
document.getElementById('copyTodayBtn').onclick = copyTodayEntries;

// Allow Enter key to apply custom frequency
document.getElementById('customFrequency').onkeypress = function(e) {
  if (e.key === 'Enter') {
    applyCustomFrequency();
  }
};

// Snooze toggle handler
document.getElementById('snoozeToggle').onclick = toggleSnooze;

// Open full view in new tab
document.getElementById('openFullView').onclick = function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("fullview.html") });
};

// Event listeners
document.getElementById("save").onclick = saveCheckin;
document.getElementById("skip").onclick = skipCheckin;
document.getElementById("deleteDraft").onclick = deleteDraft;

// Add auto-save on input
document.getElementById("note").addEventListener('input', autoSaveDraft);

// Initialize
loadSettings();
displayEntries();
updateCountdown();
updateSnoozeDisplay();
loadDraft(); // Load any saved draft

// Update countdown and snooze display every second
setInterval(() => {
  updateCountdown();
  updateSnoozeDisplay();
}, 1000);
