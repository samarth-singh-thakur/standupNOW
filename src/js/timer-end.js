// David Goggins Quote state (quotes loaded from quotes.js)
// Motivational quotes also loaded from quotes.js
let currentGogginsQuoteIndex = -1;
let isGogginsQuoteVisible = false;

// Get random Goggins quote (different from current)
function getRandomGogginsQuote() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * davidGogginsQuotes.length);
  } while (newIndex === currentGogginsQuoteIndex && davidGogginsQuotes.length > 1);
  currentGogginsQuoteIndex = newIndex;
  return davidGogginsQuotes[currentGogginsQuoteIndex];
}

// Toggle Goggins quote display
function toggleGogginsQuote() {
  const quoteText = document.getElementById('gogginsQuoteText');
  const quoteToggle = document.getElementById('gogginsQuoteToggle');
  
  if (!isGogginsQuoteVisible) {
    // Show quote
    const quote = getRandomGogginsQuote();
    quoteText.textContent = `"${quote}"`;
    quoteText.style.display = 'block';
    isGogginsQuoteVisible = true;
  } else {
    // Show next quote
    const quote = getRandomGogginsQuote();
    quoteText.textContent = `"${quote}"`;
  }
}

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

// Update current time and date
function updateCurrentTime() {
  const now = new Date();
  
  // Format time as HH:MM AM/PM
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  const timeString = now.toLocaleString('en-US', timeOptions);
  
  // Format date as "Mon DD, YYYY"
  const dateOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  const dateString = now.toLocaleString('en-US', dateOptions);
  
  const timeElement = document.getElementById("currentTime");
  const dateElement = document.getElementById("currentDate");
  
  if (timeElement) timeElement.textContent = timeString;
  if (dateElement) dateElement.textContent = dateString;
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
  const headerSnoozeIcon = document.getElementById('headerSnoozeIcon');
  const headerSnoozeBtn = document.getElementById('headerSnoozeBtn');
  
  if (data.snoozeUntil && Date.now() < data.snoozeUntil) {
    const timeLeft = data.snoozeUntil - Date.now();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (snoozeStatus) {
      snoozeStatus.textContent = '🔕 Snoozed';
      snoozeStatus.className = 'snooze-status active';
    }
    if (snoozeTimer) {
      snoozeTimer.textContent = `Resumes in ${hours}h ${minutes}m`;
    }
    if (snoozeToggle) {
      snoozeToggle.classList.add('active');
    }
    
    // Update header snooze button
    if (headerSnoozeIcon && headerSnoozeBtn) {
      headerSnoozeIcon.textContent = '🔕';
      headerSnoozeBtn.title = `Snoozed (${hours}h ${minutes}m left) - Click to disable`;
      headerSnoozeBtn.style.borderColor = '#ff9800';
      headerSnoozeBtn.style.color = '#ff9800';
    }
  } else {
    if (snoozeStatus) {
      snoozeStatus.textContent = 'Snooze Off';
      snoozeStatus.className = 'snooze-status inactive';
    }
    if (snoozeTimer) {
      snoozeTimer.textContent = '';
    }
    if (snoozeToggle) {
      snoozeToggle.classList.remove('active');
    }
    
    // Update header snooze button
    if (headerSnoozeIcon && headerSnoozeBtn) {
      headerSnoozeIcon.textContent = '🔔';
      headerSnoozeBtn.title = 'Snooze for 3 hours';
      headerSnoozeBtn.style.borderColor = 'rgba(255, 215, 0, 0.5)';
      headerSnoozeBtn.style.color = '#FFD700';
    }
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

// Current filter and search state
let currentFilter = 'today';
let currentSearchTerm = '';

// Filter entries by date
function filterEntriesByDate(entries, filter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  switch (filter) {
    case 'today':
      return entries.filter(entry => {
        const entryDate = new Date(entry.time);
        return entryDate >= today;
      });
    case 'yesterday':
      return entries.filter(entry => {
        const entryDate = new Date(entry.time);
        return entryDate >= yesterday && entryDate < today;
      });
    case 'all':
    default:
      return entries;
  }
}

// Filter entries by search term
function filterEntriesBySearch(entries, searchTerm) {
  if (!searchTerm) return entries;
  
  const term = searchTerm.toLowerCase();
  return entries.filter(entry =>
    entry.note.toLowerCase().includes(term) ||
    formatDateTime(entry.time).toLowerCase().includes(term)
  );
}

// Display all entries with filters
async function displayEntries() {
  const data = await chrome.storage.local.get("entries");
  let entries = data.entries || [];
  const entriesDiv = document.getElementById("entries");
  const entryCount = document.getElementById("entryCount");
  
  // Apply filters
  entries = filterEntriesByDate(entries, currentFilter);
  entries = filterEntriesBySearch(entries, currentSearchTerm);
  
  entryCount.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;
  
  if (entries.length === 0) {
    const emptyMessage = currentSearchTerm
      ? `No entries found for "${currentSearchTerm}"`
      : currentFilter === 'today'
      ? 'No check-ins today yet.'
      : currentFilter === 'yesterday'
      ? 'No check-ins yesterday.'
      : 'No check-ins yet.<br>Start tracking your productivity!';
    
    entriesDiv.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">${emptyMessage}</div>
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

// Copy today's entries formatted for bob
async function copyBobEntries() {
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
  
  // Format entries for bob
  const formattedEntries = todayEntries.map(entry =>
    `${formatDateTimeForCopy(entry.time)}\n${entry.note}`
  ).join('\n\n');
  
  const bobCommand = `bob -p "Based on the following hourly work log:

${formattedEntries}

Analyze:
- What moved the needle?
- Where did I lose focus?
- What patterns do you see?
- What should I prioritize"`;
  
  try {
    await navigator.clipboard.writeText(bobCommand);
    const btn = document.getElementById('copyBobBtn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '🤖 Copy to bob';
      btn.classList.remove('copied');
    }, 2000);
    showStatus(`✓ Copied bob command with ${todayEntries.length} ${todayEntries.length === 1 ? 'entry' : 'entries'}`);
  } catch (err) {
    console.error('Failed to copy:', err);
    showStatus("Failed to copy bob command", true);
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

// Change quote every hour
setInterval(updateQuote, 60 * 60 * 1000); // 60 minutes * 60 seconds * 1000 milliseconds

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

// Toggle clear button visibility
function toggleClearButton() {
  const note = document.getElementById("note").value.trim();
  const clearBtn = document.getElementById("deleteDraft");
  clearBtn.style.display = note ? 'block' : 'none';
}

// Load draft
async function loadDraft() {
  const data = await chrome.storage.local.get('draft');
  if (data.draft) {
    noteTextarea.value = data.draft;
    toggleClearButton(); // Show clear button if draft exists
    // Show save button if draft has content with animation
    if (data.draft.trim().length > 0) {
      saveButton.style.display = 'inline-block';
      saveButton.classList.add('fade-in');
      setTimeout(() => saveButton.classList.remove('fade-in'), 300);
    }
    showStatus("📝 Draft restored", false);
  }
}

// Delete draft
async function deleteDraft() {
  await chrome.storage.local.remove('draft');
  noteTextarea.value = "";
  toggleClearButton(); // Hide clear button after clearing
  saveButton.style.display = 'none'; // Hide save button after clearing
  showStatus("🗑️ Draft deleted");
}

// Settings modal handlers
document.getElementById('settingsIcon').onclick = function() {
  const modal = document.getElementById('settingsModal');
  modal.style.display = 'flex';
  // Sync settings from storage
  loadSettingsIntoModal();
};

document.getElementById('closeSettings').onclick = function() {
  document.getElementById('settingsModal').style.display = 'none';
};

// Close modal when clicking outside
document.getElementById('settingsModal').onclick = function(e) {
  if (e.target.id === 'settingsModal') {
    this.style.display = 'none';
  }
};

// Load settings into modal
async function loadSettingsIntoModal() {
  const data = await chrome.storage.local.get(['frequency', 'snoozeUntil']);
  
  // Set frequency
  const frequency = data.frequency || 60;
  const select = document.getElementById('frequencySelectModal');
  const standardValues = ['15', '30', '45', '60', '90', '120'];
  
  if (standardValues.includes(frequency.toString())) {
    select.value = frequency.toString();
  } else {
    select.value = 'custom';
    document.getElementById('customFrequencyContainerModal').style.display = 'block';
    document.getElementById('customFrequencyModal').value = frequency;
  }
  
  // Set snooze status
  updateSnoozeDisplayModal(data.snoozeUntil);
  
  // Set demo mode status
  await updateDemoModeDisplay();
}

// Update snooze display in modal
function updateSnoozeDisplayModal(snoozeUntil) {
  const toggle = document.getElementById('snoozeToggleModal');
  const status = document.getElementById('snoozeStatusModal');
  const timer = document.getElementById('snoozeTimerModal');
  
  if (snoozeUntil && Date.now() < snoozeUntil) {
    toggle.classList.add('active');
    status.classList.remove('inactive');
    status.classList.add('active');
    status.textContent = 'Snooze Active';
    
    const remaining = snoozeUntil - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    timer.textContent = `${hours}h ${minutes}m remaining`;
  } else {
    toggle.classList.remove('active');
    status.classList.add('inactive');
    status.classList.remove('active');
    status.textContent = 'Snooze Off';
    timer.textContent = '';
  }
}
// Frequency change handler for modal
document.getElementById('frequencySelectModal').onchange = function() {
  const value = this.value;
  
  if (value === 'custom') {
    // Show custom input
    document.getElementById('customFrequencyContainerModal').style.display = 'block';
    document.getElementById('customFrequencyModal').focus();
  } else {
    // Hide custom input and apply preset
    document.getElementById('customFrequencyContainerModal').style.display = 'none';
    const minutes = parseInt(value);
    saveFrequency(minutes);
    showToast(`✓ Frequency updated to ${minutes} minutes`, '⚙️');
  }
};

// Handle custom frequency in modal
function applyCustomFrequencyModal() {
  const customValue = parseInt(document.getElementById('customFrequencyModal').value);
  const btn = document.getElementById('applyCustomFrequencyModal');
  
  if (!customValue || customValue < 1 || customValue > 1440) {
    showToast("Please enter a value between 1 and 1440 minutes", '⚠️');
    return;
  }
  
  // Add click animation
  btn.classList.add('btn-click-animation');
  setTimeout(() => btn.classList.remove('btn-click-animation'), 300);
  
  saveFrequency(customValue);
  showToast(`✓ Custom frequency set to ${customValue} minutes`, '⚙️');
}

// Custom frequency apply button in modal
document.getElementById('applyCustomFrequencyModal').onclick = applyCustomFrequencyModal;

// Allow Enter key to apply custom frequency in modal
document.getElementById('customFrequencyModal').onkeypress = function(e) {
  if (e.key === 'Enter') {
    applyCustomFrequencyModal();
  }
};

// Snooze toggle handler for modal
document.getElementById('snoozeToggleModal').onclick = async function() {
  await toggleSnooze();
  // Update modal display
  const data = await chrome.storage.local.get('snoozeUntil');
  updateSnoozeDisplayModal(data.snoozeUntil);
};

// Demo mode toggle handler for modal
document.getElementById('demoModeToggle').onclick = async function() {
  const toggle = this;
  const status = document.getElementById('demoModeStatus');
  const info = document.getElementById('demoModeInfo');
  
  // Disable toggle during operation
  toggle.style.pointerEvents = 'none';
  
  try {
    const isEnabled = await DemoMode.isDemoModeEnabled();
    
    if (isEnabled) {
      // Disable demo mode
      await DemoMode.disableDemoMode();
      toggle.classList.remove('active');
      status.classList.add('inactive');
      status.classList.remove('active');
      status.textContent = 'Demo Mode Off';
      info.textContent = 'Your data is safe and backed up';
      info.style.color = '#888';
      showToast('✓ Demo mode disabled - Real data restored', '🎭');
    } else {
      // Enable demo mode
      await DemoMode.enableDemoMode();
      toggle.classList.add('active');
      status.classList.remove('inactive');
      status.classList.add('active');
      status.textContent = 'Demo Mode Active';
      info.textContent = 'Showing demo data - Your real data is backed up';
      info.style.color = '#ff9800';
      showToast('✓ Demo mode enabled - Showing demo data', '🎭');
    }
    
    // Refresh the entries display
    displayEntries();
  } catch (error) {
    console.error('Error toggling demo mode:', error);
    showToast('⚠️ Failed to toggle demo mode', '❌');
  } finally {
    // Re-enable toggle
    toggle.style.pointerEvents = 'auto';
  }
};

// Update demo mode display in modal
async function updateDemoModeDisplay() {
  const toggle = document.getElementById('demoModeToggle');
  const status = document.getElementById('demoModeStatus');
  const info = document.getElementById('demoModeInfo');
  
  const isEnabled = await DemoMode.isDemoModeEnabled();
  
  if (isEnabled) {
    toggle.classList.add('active');
    status.classList.remove('inactive');
    status.classList.add('active');
    status.textContent = 'Demo Mode Active';
    info.textContent = 'Showing demo data - Your real data is backed up';
    info.style.color = '#ff9800';
  } else {
    toggle.classList.remove('active');
    status.classList.add('inactive');
    status.classList.remove('active');
    status.textContent = 'Demo Mode Off';
    info.textContent = 'Your data is safe and backed up';
    info.style.color = '#888';
  }
}

// Copy today's entries button
document.getElementById('copyTodayBtn').onclick = copyTodayEntries;

// Copy to bob button
document.getElementById('copyBobBtn').onclick = copyBobEntries;

// Open full view in new tab
document.getElementById('openFullView').onclick = function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("src/html/fullview.html") });
};

// Header snooze button handler
document.getElementById('headerSnoozeBtn').onclick = async function() {
  await toggleSnooze();
  await updateSnoozeDisplay();
};

// Update copy button text based on filter
function updateCopyButtonText() {
  const copyBtn = document.getElementById('copyTodayBtn');
  if (!copyBtn) return;
  
  switch (currentFilter) {
    case 'today':
      copyBtn.textContent = '📋 Copy Today\'s Entries';
      break;
    case 'yesterday':
      copyBtn.textContent = '📋 Copy Yesterday\'s Entries';
      break;
    case 'all':
      copyBtn.textContent = '📋 Copy All Entries';
      break;
  }
}

// Filter button handlers
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    // Remove active class from all buttons
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    // Add active class to clicked button
    this.classList.add('active');
    // Update filter and refresh display
    currentFilter = this.dataset.filter;
    updateCopyButtonText();
    displayEntries();
  });
});

// Search box handler
document.getElementById('searchBox').addEventListener('input', function(e) {
  currentSearchTerm = e.target.value.trim();
  displayEntries();
});

// Event listeners
const saveButton = document.getElementById("save");
const noteTextarea = document.getElementById("note");

saveButton.onclick = saveCheckin;
document.getElementById("skip").onclick = skipCheckin;
document.getElementById("deleteDraft").onclick = deleteDraft;

// Hide save button initially if textarea is empty
if (noteTextarea.value.trim().length === 0) {
  saveButton.style.display = 'none';
}

// David Goggins Quote Toggle Handler
document.getElementById('gogginsQuoteToggle').onclick = function() {
  toggleGogginsQuote();
};

// Add auto-save on input and toggle clear button and save button
noteTextarea.addEventListener('input', function() {
  autoSaveDraft();
  toggleClearButton();
  
  // Toggle save button visibility with animation
  if (noteTextarea.value.trim().length > 0) {
    if (saveButton.style.display === 'none') {
      saveButton.style.display = 'inline-block';
      saveButton.classList.add('fade-in');
      // Remove animation class after it completes
      setTimeout(() => saveButton.classList.remove('fade-in'), 300);
    }
  } else {
    saveButton.style.display = 'none';
  }
});

// Add keyboard shortcut: Ctrl+Enter or Cmd+Enter to save
noteTextarea.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    saveCheckin();
  }
});

// Enhanced focus management
function focusTextarea() {
  const textarea = document.getElementById("note");
  textarea.focus();
  // Move cursor to end of text if there's a draft
  const length = textarea.value.length;
  textarea.setSelectionRange(length, length);
  
  // Stop the pulsing animation after user starts typing
  const inputSection = document.querySelector('.input-section');
  textarea.addEventListener('input', function stopPulse() {
    inputSection.style.animation = 'none';
    textarea.removeEventListener('input', stopPulse);
  }, { once: true });
}

// Check and display demo mode banner
async function updateDemoModeBanner() {
  const banner = document.getElementById('demoModeBanner');
  if (banner && typeof DemoMode !== 'undefined') {
    const isEnabled = await DemoMode.isDemoModeEnabled();
    banner.style.display = isEnabled ? 'block' : 'none';
  }
}

// Initialize
loadSettings();
displayEntries();
updateCountdown();
updateSnoozeDisplay();
updateCurrentTime(); // Initialize current time
updateCopyButtonText(); // Set initial button text
loadDraft(); // Load any saved draft
updateDemoModeBanner(); // Check demo mode status

// Focus textarea after a short delay to ensure page is fully loaded
setTimeout(focusTextarea, 100);

// Re-focus textarea when clicking anywhere in the input section
document.querySelector('.input-section').addEventListener('click', function(e) {
  if (e.target.tagName !== 'BUTTON') {
    focusTextarea();
  }
});

// Update countdown, snooze display, and current time every second
setInterval(() => {
  updateCountdown();
  updateSnoozeDisplay();
  updateCurrentTime();
}, 1000);
