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
    return;
  }
  
  const alarms = await chrome.alarms.getAll();
  const alarm = alarms.find(a => a.name === "hourly-checkin");
  
  if (!alarm) {
    document.getElementById("countdown").textContent = "--:--:--";
    return;
  }
  
  const now = Date.now();
  const timeLeft = Math.max(0, alarm.scheduledTime - now);
  
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  document.getElementById("countdown").textContent = formatted;
}

// Update snooze display
async function updateSnoozeDisplay() {
  const data = await chrome.storage.local.get(['snoozeUntil']);
  const headerSnoozeIcon = document.getElementById('headerSnoozeIcon');
  const headerSnoozeBtn = document.getElementById('headerSnoozeBtn');
  
  if (data.snoozeUntil && Date.now() < data.snoozeUntil) {
    const timeLeft = data.snoozeUntil - Date.now();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (headerSnoozeIcon && headerSnoozeBtn) {
      headerSnoozeIcon.textContent = '🔕';
      headerSnoozeBtn.title = `Snoozed (${hours}h ${minutes}m left) - Click to disable`;
      headerSnoozeBtn.style.borderColor = '#ff9800';
      headerSnoozeBtn.style.color = '#ff9800';
    }
  } else {
    if (headerSnoozeIcon && headerSnoozeBtn) {
      headerSnoozeIcon.textContent = '🔔';
      headerSnoozeBtn.title = 'Snooze for 3 hours';
      headerSnoozeBtn.style.borderColor = 'rgba(255, 215, 0, 0.5)';
      headerSnoozeBtn.style.color = '#FFD700';
    }
  }
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
  
  // Filter out deleted entries (sync-compatible)
  entries = entries.filter(e => !e.deleted);
  
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
        <button class="copy-btn" data-index="${index}">📋</button>
      </div>
      <div class="entry-note">${escapeHtml(entry.note)}</div>
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
  
  // Filter entries based on current filter
  let filteredEntries = filterEntriesByDate(entries, currentFilter);
  
  if (filteredEntries.length === 0) {
    showStatus("No entries to copy", true);
    return;
  }
  
  // Format all entries
  const formattedEntries = filteredEntries.map(entry =>
    `${formatDateTimeForCopy(entry.time)}\n${entry.note}`
  ).join('\n\n---\n\n');
  
  const filterName = currentFilter === 'today' ? "Today's" : currentFilter === 'yesterday' ? "Yesterday's" : "All";
  const header = `📋 ${filterName} Check-ins (${filteredEntries.length} ${filteredEntries.length === 1 ? 'entry' : 'entries'})\n\n`;
  const textToCopy = header + formattedEntries;
  
  try {
    await navigator.clipboard.writeText(textToCopy);
    const btn = document.getElementById('copyTodayBtn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      updateCopyButtonText();
      btn.classList.remove('copied');
    }, 2000);
    showStatus(`✓ Copied ${filteredEntries.length} ${filteredEntries.length === 1 ? 'entry' : 'entries'}`);
  } catch (err) {
    console.error('Failed to copy:', err);
    showStatus("Failed to copy entries", true);
  }
}

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

// Get random quote
function getRandomQuote() {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}

// Update quote
function updateQuote() {
  const quoteElement = document.querySelector('.quote-text');
  if (quoteElement) {
    quoteElement.textContent = getRandomQuote();
  }
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

// Auto-save draft for popup
let popupDraftTimeout;
function autoSavePopupDraft() {
  clearTimeout(popupDraftTimeout);
  popupDraftTimeout = setTimeout(async () => {
    const note = noteTextarea.value.trim();
    if (note) {
      await chrome.storage.local.set({ popupDraft: note });
    } else {
      await chrome.storage.local.remove('popupDraft');
    }
  }, 500);
}

// Load draft for popup
async function loadPopupDraft() {
  const data = await chrome.storage.local.get('popupDraft');
  if (data.popupDraft) {
    noteTextarea.value = data.popupDraft;
    // Show save button and delete draft button if draft has content with animation
    if (data.popupDraft.trim().length > 0) {
      saveButton.style.display = 'inline-block';
      saveButton.classList.add('fade-in');
      setTimeout(() => saveButton.classList.remove('fade-in'), 300);
      
      deleteDraftButton.style.display = 'block';
      deleteDraftButton.classList.add('fade-in');
      setTimeout(() => deleteDraftButton.classList.remove('fade-in'), 300);
    }
  }
}

// Save check-in
async function saveCheckin() {
  const note = document.getElementById("note").value.trim();
  if (!note) {
    showStatus("Please enter a note!", true);
    return;
  }

  // Check if demo mode is active
  if (typeof DemoMode !== 'undefined') {
    const isDemoMode = await DemoMode.isDemoModeEnabled();
    if (isDemoMode) {
      showStatus("⚠️ Cannot save in demo mode! Disable demo mode first.", true);
      return;
    }
  }

  // Create sync-compatible entry
  const now = new Date().toISOString();
  const entry = {
    id: crypto.randomUUID(),
    time: now,
    note: note,
    createdAt: now,
    updatedAt: now,
    version: 1,
    deleted: false
  };

  const data = await chrome.storage.local.get("entries");
  const entries = data.entries || [];
  entries.unshift(entry);
  await chrome.storage.local.set({ entries });

  noteTextarea.value = "";
  
  // Clear draft after saving
  await chrome.storage.local.remove('popupDraft');
  
  // Hide buttons after clearing
  saveButton.style.display = 'none';
  deleteDraftButton.style.display = 'none';
  
  // Reset timer
  chrome.runtime.sendMessage({ action: "resetTimer" });
  
  showStatus("✓ Saved!");
  
  // Refresh entries display
  displayEntries();
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

// Delete draft function
async function deletePopupDraft() {
  await chrome.storage.local.remove('popupDraft');
  noteTextarea.value = "";
  saveButton.style.display = 'none';
  deleteDraftButton.style.display = 'none';
  showStatus("🗑️ Draft deleted");
}

// Toggle delete draft button visibility
function toggleDeleteDraftButton() {
  const note = noteTextarea.value.trim();
  if (note) {
    if (deleteDraftButton.style.display === 'none') {
      deleteDraftButton.style.display = 'block';
      deleteDraftButton.classList.add('fade-in');
      setTimeout(() => deleteDraftButton.classList.remove('fade-in'), 300);
    }
  } else {
    deleteDraftButton.style.display = 'none';
  }
}

// Event listeners
const saveButton = document.getElementById("save");
const noteTextarea = document.getElementById("note");
const deleteDraftButton = document.getElementById("deleteDraft");

saveButton.onclick = saveCheckin;
deleteDraftButton.onclick = deletePopupDraft;

// Hide buttons initially if textarea is empty
if (noteTextarea.value.trim().length === 0) {
  saveButton.style.display = 'none';
  deleteDraftButton.style.display = 'none';
}

// Toggle save button and delete draft button visibility, auto-save draft
noteTextarea.addEventListener('input', function() {
  autoSavePopupDraft();
  toggleDeleteDraftButton();
  
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

document.getElementById("copyTodayBtn").onclick = copyTodayEntries;
document.getElementById("openFullView").onclick = function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("src/html/fullview.html") });
};
document.getElementById("settingsIcon").onclick = function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("src/html/timer-end.html") });
};
document.getElementById("headerSnoozeBtn").onclick = toggleSnooze;

// Add keyboard shortcut: Ctrl+Enter or Cmd+Enter to save
noteTextarea.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    saveCheckin();
  }
});

// Check and display demo mode banner
async function updateDemoModeBanner() {
  const banner = document.getElementById('demoModeBanner');
  if (banner && typeof DemoMode !== 'undefined') {
    const isEnabled = await DemoMode.isDemoModeEnabled();
    banner.style.display = isEnabled ? 'block' : 'none';
  }
}

// Initialize Sync Manager and UI
window.syncManager.init();
const syncUI = new SyncUI('syncButtonContainer');
syncUI.render();

// Listen for sync complete to refresh entries
window.addEventListener('syncComplete', () => {
  displayEntries();
});

// Initialize
loadPopupDraft(); // Load any saved draft
displayEntries();
updateCountdown();
updateSnoozeDisplay();
updateCurrentTime();
updateCopyButtonText();
updateQuote();
updateDemoModeBanner();

// Update every second
setInterval(() => {
  updateCountdown();
  updateSnoozeDisplay();
  updateCurrentTime();
}, 1000);

// Update quote every 30 seconds
setInterval(updateQuote, 30000);

// Made with Bob
