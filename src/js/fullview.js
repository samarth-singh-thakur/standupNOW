// Current state
let currentEntryIndex = null;
let allEntries = [];
let filteredEntries = [];
let currentFilter = 'today';
let startDateValue = null;
let endDateValue = null;
// David Goggins Quote state (quotes loaded from quotes.js)
let currentQuoteIndex = -1;
let isQuoteVisible = false;

// Get random quote (different from current)
function getRandomQuote() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * davidGogginsQuotes.length);
  } while (newIndex === currentQuoteIndex && davidGogginsQuotes.length > 1);
  currentQuoteIndex = newIndex;
  return davidGogginsQuotes[currentQuoteIndex];
}

// Toggle quote display
function toggleGogginsQuote() {
  const quoteText = document.getElementById('gogginsQuoteText');
  const quoteToggle = document.getElementById('gogginsQuoteToggle');
  
  if (!isQuoteVisible) {
    // Show quote
    const quote = getRandomQuote();
    quoteText.textContent = `"${quote}"`;
    quoteText.style.display = 'block';
    quoteToggle.textContent = 'Click to show a David Goggins quote';
    isQuoteVisible = true;
  } else {
    // Show next quote
    const quote = getRandomQuote();
    quoteText.textContent = `"${quote}"`;
  }
}

// Reset quote state when page loads
function resetQuoteState() {
  isQuoteVisible = false;
  currentQuoteIndex = -1;
  const quoteText = document.getElementById('gogginsQuoteText');
  const quoteToggle = document.getElementById('gogginsQuoteToggle');
  if (quoteText) {
    quoteText.style.display = 'none';
    quoteText.textContent = '';
  }
  if (quoteToggle) {
    quoteToggle.textContent = 'Click to show a David Goggins quote';
  }
}


// Format date and time for display
function formatDateTime(isoString) {
  const date = new Date(isoString);
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}

// Format date for copy
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

// Load all entries
async function loadEntries() {
  const data = await chrome.storage.local.get("entries");
  allEntries = data.entries || [];
  applyFilter();
  renderEntriesList();
  updateEntriesCount();
  generateHeatMap();
}

// Apply current filter
function applyFilter() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  switch(currentFilter) {
    case 'today':
      filteredEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.time);
        return entryDate >= today;
      });
      break;
    case 'yesterday':
      filteredEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.time);
        return entryDate >= yesterday && entryDate < today;
      });
      break;
    case 'week':
      filteredEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.time);
        return entryDate >= weekAgo;
      });
      break;
    case 'custom':
      if (startDateValue && endDateValue) {
        const startDate = new Date(startDateValue);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endDateValue);
        endDate.setHours(23, 59, 59, 999);
        filteredEntries = allEntries.filter(entry => {
          const entryDate = new Date(entry.time);
          return entryDate >= startDate && entryDate <= endDate;
        });
      } else if (startDateValue) {
        const startDate = new Date(startDateValue);
        startDate.setHours(0, 0, 0, 0);
        filteredEntries = allEntries.filter(entry => {
          const entryDate = new Date(entry.time);
          return entryDate >= startDate;
        });
      } else if (endDateValue) {
        const endDate = new Date(endDateValue);
        endDate.setHours(23, 59, 59, 999);
        filteredEntries = allEntries.filter(entry => {
          const entryDate = new Date(entry.time);
          return entryDate <= endDate;
        });
      } else {
        filteredEntries = [...allEntries];
      }
      break;
    default:
      filteredEntries = [...allEntries];
  }
}

// Render entries list in sidebar
function renderEntriesList() {
  const listContainer = document.getElementById('entriesList');
  
  if (filteredEntries.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-sidebar">
        <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
        <div>No entries found</div>
      </div>
    `;
    return;
  }
  
  listContainer.innerHTML = filteredEntries.map((entry, index) => {
    const actualIndex = allEntries.findIndex(e => e.time === entry.time);
    const preview = entry.note.substring(0, 60) + (entry.note.length > 60 ? '...' : '');
    const isActive = actualIndex === currentEntryIndex ? 'active' : '';
    
    return `
      <div class="entry-item ${isActive}" data-index="${actualIndex}">
        <div class="entry-item-date">${formatDateTime(entry.time)}</div>
        <div class="entry-item-preview">${escapeHtml(preview)}</div>
      </div>
    `;
  }).join('');
  
  // Add click handlers
  document.querySelectorAll('.entry-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      loadEntry(index);
    });
  });
}

// Update entries count
function updateEntriesCount() {
  document.getElementById('entriesCount').textContent = 
    `${allEntries.length} ${allEntries.length === 1 ? 'entry' : 'entries'}`;
}

// Load specific entry into editor
function loadEntry(index) {
  currentEntryIndex = index;
  const entry = allEntries[index];
  
  const editorContainer = document.getElementById('editorContainer');
  editorContainer.innerHTML = `
    <div class="editor-meta">
      <div class="editor-date">${formatDateTime(entry.time)}</div>
      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <button class="view-mode-btn active" id="editModeBtn" style="flex: 1; padding: 6px 12px; background: #FFD700; color: #000; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">✏️ Edit</button>
        <button class="view-mode-btn" id="previewModeBtn" style="flex: 1; padding: 6px 12px; background: #2a2a2a; color: #999; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">👁️ Preview</button>
      </div>
    </div>
    <textarea class="editor-textarea" id="entryTextarea" placeholder="Write your thoughts...">${escapeHtml(entry.note)}</textarea>
    <div class="markdown-preview" id="markdownPreview" style="display: none; padding: 20px; background: #0f0f0f; border: 2px solid #2a2a2a; border-radius: 12px; min-height: 400px; color: #e0e0e0; line-height: 1.8; overflow-y: auto;"></div>
    <div class="action-buttons">
      <button class="btn btn-primary" id="updateBtn">💾 Update</button>
      <button class="btn btn-danger" id="deleteBtn">🗑️ Delete</button>
      <button class="btn btn-secondary" id="copyBtn">📋 Copy</button>
    </div>
  `;
  
  document.getElementById('mainTitle').textContent = 'Edit Check-in';
  
  // Add event listeners
  document.getElementById('updateBtn').onclick = updateEntry;
  document.getElementById('deleteBtn').onclick = showDeleteModal;
  document.getElementById('copyBtn').onclick = copyEntry;
  
  // View mode toggle
  const editModeBtn = document.getElementById('editModeBtn');
  const previewModeBtn = document.getElementById('previewModeBtn');
  const textarea = document.getElementById('entryTextarea');
  const preview = document.getElementById('markdownPreview');
  
  editModeBtn.onclick = () => {
    textarea.style.display = 'block';
    preview.style.display = 'none';
    editModeBtn.style.background = '#FFD700';
    editModeBtn.style.color = '#000';
    previewModeBtn.style.background = '#2a2a2a';
    previewModeBtn.style.color = '#999';
    editModeBtn.classList.add('active');
    previewModeBtn.classList.remove('active');
  };
  
  previewModeBtn.onclick = () => {
    textarea.style.display = 'none';
    preview.style.display = 'block';
    preview.innerHTML = renderMarkdown(textarea.value);
    previewModeBtn.style.background = '#FFD700';
    previewModeBtn.style.color = '#000';
    editModeBtn.style.background = '#2a2a2a';
    editModeBtn.style.color = '#999';
    previewModeBtn.classList.add('active');
    editModeBtn.classList.remove('active');
  };
  
  // Update sidebar active state
  renderEntriesList();
}

// Create new entry
function createNewEntry() {
  currentEntryIndex = null;
  
  const editorContainer = document.getElementById('editorContainer');
  editorContainer.innerHTML = `
    <div class="editor-meta">
      <div class="editor-date">${formatDateTime(new Date().toISOString())}</div>
      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <button class="view-mode-btn active" id="editModeBtn" style="flex: 1; padding: 6px 12px; background: #FFD700; color: #000; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">✏️ Edit</button>
        <button class="view-mode-btn" id="previewModeBtn" style="flex: 1; padding: 6px 12px; background: #2a2a2a; color: #999; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">👁️ Preview</button>
      </div>
    </div>
    <textarea class="editor-textarea" id="entryTextarea" placeholder="What did you accomplish? Write your thoughts here...

Markdown supported:
**bold** *italic* \`code\`
\`\`\`language
code block
\`\`\`
# Header
- List item
[link](url)" autofocus></textarea>
    <div class="markdown-preview" id="markdownPreview" style="display: none; padding: 20px; background: #0f0f0f; border: 2px solid #2a2a2a; border-radius: 12px; min-height: 400px; color: #e0e0e0; line-height: 1.8; overflow-y: auto;"></div>
    <div class="action-buttons">
      <button class="btn btn-primary" id="saveNewBtn">💾 Save Entry</button>
      <button class="btn btn-danger" id="clearDraftBtn">🗑️ Clear Draft</button>
    </div>
  `;
  
  document.getElementById('mainTitle').textContent = 'New Check-in';
  
  // Load draft if exists
  loadFullViewDraft();
  
  document.getElementById('entryTextarea').focus();
  
  // Add event listeners
  document.getElementById('saveNewBtn').onclick = saveNewEntry;
  document.getElementById('clearDraftBtn').onclick = clearFullViewDraft;
  
  // Add auto-save on input
  document.getElementById('entryTextarea').addEventListener('input', autoSaveFullViewDraft);
  
  // View mode toggle
  const editModeBtn = document.getElementById('editModeBtn');
  const previewModeBtn = document.getElementById('previewModeBtn');
  const textarea = document.getElementById('entryTextarea');
  const preview = document.getElementById('markdownPreview');
  
  editModeBtn.onclick = () => {
    textarea.style.display = 'block';
    preview.style.display = 'none';
    editModeBtn.style.background = '#FFD700';
    editModeBtn.style.color = '#000';
    previewModeBtn.style.background = '#2a2a2a';
    previewModeBtn.style.color = '#999';
    editModeBtn.classList.add('active');
    previewModeBtn.classList.remove('active');
  };
  
  previewModeBtn.onclick = () => {
    textarea.style.display = 'none';
    preview.style.display = 'block';
    preview.innerHTML = renderMarkdown(textarea.value);
    previewModeBtn.style.background = '#FFD700';
    previewModeBtn.style.color = '#000';
    editModeBtn.style.background = '#2a2a2a';
    editModeBtn.style.color = '#999';
    previewModeBtn.classList.add('active');
    editModeBtn.classList.remove('active');
  };
  
  // Update sidebar active state
  renderEntriesList();
}

// Save new entry
async function saveNewEntry() {
  const textarea = document.getElementById('entryTextarea');
  const note = textarea.value.trim();
  
  if (!note) {
    alert('Please enter some content before saving.');
    return;
  }
  
  const entry = { time: new Date().toISOString(), note };
  allEntries.unshift(entry);
  await chrome.storage.local.set({ entries: allEntries });
  
  // Clear draft after successful save
  await chrome.storage.local.remove('fullViewDraft');
  
  await loadEntries();
  loadEntry(0);
  showNotification('✓ Entry saved successfully!');
}

// Auto-save draft for full view
let fullViewDraftTimeout;
function autoSaveFullViewDraft() {
  clearTimeout(fullViewDraftTimeout);
  fullViewDraftTimeout = setTimeout(async () => {
    const textarea = document.getElementById('entryTextarea');
    if (textarea && currentEntryIndex === null) { // Only save draft for new entries
      const note = textarea.value.trim();
      if (note) {
        await chrome.storage.local.set({ fullViewDraft: note });
      } else {
        await chrome.storage.local.remove('fullViewDraft');
      }
    }
  }, 500); // Save after 500ms of no typing
}

// Load draft for full view
async function loadFullViewDraft() {
  const data = await chrome.storage.local.get('fullViewDraft');
  if (data.fullViewDraft) {
    const textarea = document.getElementById('entryTextarea');
    if (textarea) {
      textarea.value = data.fullViewDraft;
      showNotification('📝 Draft restored');
    }
  }
}

// Clear draft for full view
async function clearFullViewDraft() {
  await chrome.storage.local.remove('fullViewDraft');
  const textarea = document.getElementById('entryTextarea');
  if (textarea) {
    textarea.value = '';
  }
  showNotification('🗑️ Draft cleared');
}

// Update existing entry
async function updateEntry() {
  const textarea = document.getElementById('entryTextarea');
  const note = textarea.value.trim();
  
  if (!note) {
    alert('Please enter some content before updating.');
    return;
  }
  
  allEntries[currentEntryIndex].note = note;
  await chrome.storage.local.set({ entries: allEntries });
  
  await loadEntries();
  loadEntry(currentEntryIndex);
  showNotification('✓ Entry updated successfully!');
}

// Show delete confirmation modal
function showDeleteModal() {
  document.getElementById('deleteModal').classList.add('active');
}

// Hide delete modal
function hideDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
}

// Delete entry
async function deleteEntry() {
  allEntries.splice(currentEntryIndex, 1);
  await chrome.storage.local.set({ entries: allEntries });
  
  hideDeleteModal();
  await loadEntries();
  
  if (allEntries.length > 0) {
    loadEntry(0);
  } else {
    showPlaceholder();
  }
  
  showNotification('✓ Entry deleted successfully!');
}

// Copy entry
async function copyEntry() {
  const entry = allEntries[currentEntryIndex];
  const textToCopy = `${formatDateTimeForCopy(entry.time)}\n\n${entry.note}`;
  
  try {
    await navigator.clipboard.writeText(textToCopy);
    showNotification('✓ Entry copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Failed to copy entry');
  }
}

// Render markdown to HTML
function renderMarkdown(text) {
  let html = escapeHtml(text);
  
  // Code blocks with ``` (must be done before inline code)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
  });
  
  // Inline code with `
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Bold with **
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italic with *
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Bullet lists
  html = html.replace(/^\- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

// Show placeholder
function showPlaceholder() {
  const editorContainer = document.getElementById('editorContainer');
  editorContainer.innerHTML = `
    <div class="editor-placeholder">
      <div class="editor-placeholder-icon">✍️</div>
      <div class="editor-placeholder-text">Start a new check-in</div>
      <div class="editor-placeholder-subtext">Click "New Entry" or select an entry from the sidebar</div>
    </div>
  `;
  document.getElementById('mainTitle').textContent = 'New Check-in';
  currentEntryIndex = null;
}

// Search entries
function searchEntries(query) {
  if (!query.trim()) {
    filteredEntries = [...allEntries];
  } else {
    const lowerQuery = query.toLowerCase();
    filteredEntries = allEntries.filter(entry => 
      entry.note.toLowerCase().includes(lowerQuery) ||
      formatDateTime(entry.time).toLowerCase().includes(lowerQuery)
    );
  }
  renderEntriesList();
}

// Show notification
function showNotification(message) {
  // Create temporary notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #FFD700;
    color: #000;
    padding: 15px 25px;
    border-radius: 8px;
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Generate heat map calendar
function generateHeatMap() {
  const heatMapContainer = document.getElementById('heatMapCalendar');
  if (!heatMapContainer) return;
  
  // Calculate date range (last 12 weeks)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (12 * 7));
  
  // Count entries per day
  const entryCounts = {};
  allEntries.forEach(entry => {
    const date = new Date(entry.time);
    const dateKey = date.toISOString().split('T')[0];
    entryCounts[dateKey] = (entryCounts[dateKey] || 0) + 1;
  });
  
  // Find max count for color scaling
  const maxCount = Math.max(...Object.values(entryCounts), 1);
  
  // Generate calendar grid
  const weeks = [];
  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start from Sunday
  
  for (let week = 0; week < 12; week++) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const count = entryCounts[dateKey] || 0;
      const intensity = count === 0 ? 0 : Math.ceil((count / maxCount) * 4);
      
      days.push({
        date: new Date(currentDate),
        dateKey: dateKey,
        count: count,
        intensity: intensity
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(days);
  }
  
  // Render heat map
  const colors = ['#1a1a1a', '#3d5a00', '#6b9900', '#99d700', '#FFD700'];
  
  let html = '<div style="display: flex; gap: 3px;">';
  
  weeks.forEach(week => {
    html += '<div style="display: flex; flex-direction: column; gap: 3px;">';
    week.forEach(day => {
      const color = colors[day.intensity];
      const dateStr = day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const title = `${dateStr}: ${day.count} ${day.count === 1 ? 'entry' : 'entries'}`;
      
      html += `<div
        class="heat-map-cell"
        data-date="${day.dateKey}"
        data-count="${day.count}"
        style="
          width: 12px;
          height: 12px;
          background: ${color};
          border: 1px solid #2a2a2a;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.2s;
        "
        title="${title}"
      ></div>`;
    });
    html += '</div>';
  });
  
  html += '</div>';
  heatMapContainer.innerHTML = html;
  
  // Add click handlers to heat map cells
  document.querySelectorAll('.heat-map-cell').forEach(cell => {
    cell.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.5)';
      this.style.zIndex = '10';
      this.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.6)';
    });
    
    cell.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
      this.style.zIndex = '1';
      this.style.boxShadow = 'none';
    });
    
    cell.addEventListener('click', function() {
      const date = this.dataset.date;
      const count = parseInt(this.dataset.count);
      
      if (count > 0) {
        // Set filter to custom and select this date
        document.getElementById('filterSelect').value = 'custom';
        document.getElementById('startDate').value = date;
        document.getElementById('endDate').value = date;
        document.getElementById('dateRangeContainer').style.display = 'block';
        
        currentFilter = 'custom';
        startDateValue = date;
        endDateValue = date;
        applyFilter();
        renderEntriesList();
      }
    });
  });
}

// Update replay button text based on filter
function updateReplayButtonText() {
  const replayBtn = document.getElementById('replayDayBtn');
  
  switch(currentFilter) {
    case 'today':
      replayBtn.textContent = '⏯️ Replay Today';
      break;
    case 'yesterday':
      replayBtn.textContent = '⏯️ Replay Yesterday';
      break;
    case 'week':
      replayBtn.textContent = '⏯️ Replay This Week';
      break;
    case 'custom':
      if (startDateValue && endDateValue) {
        if (startDateValue === endDateValue) {
          const date = new Date(startDateValue);
          replayBtn.textContent = `⏯️ Replay ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        } else {
          replayBtn.textContent = '⏯️ Replay Date Range';
        }
      } else if (startDateValue) {
        const date = new Date(startDateValue);
        replayBtn.textContent = `⏯️ Replay from ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else if (endDateValue) {
        const date = new Date(endDateValue);
        replayBtn.textContent = `⏯️ Replay until ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else {
        replayBtn.textContent = '⏯️ Replay Day';
      }
      break;
    default:
      replayBtn.textContent = '⏯️ Replay All';
  }
}

// Filter change handler
document.getElementById('filterSelect').onchange = function() {
  currentFilter = this.value;
  const dateRangeContainer = document.getElementById('dateRangeContainer');
  
  if (currentFilter === 'custom') {
    dateRangeContainer.style.display = 'block';
    document.getElementById('startDate').focus();
  } else {
    dateRangeContainer.style.display = 'none';
    startDateValue = null;
    endDateValue = null;
    applyFilter();
    renderEntriesList();
  }
  updateReplayButtonText();
};

// Date range change handlers
document.getElementById('startDate').onchange = function() {
  startDateValue = this.value;
  applyFilter();
  renderEntriesList();
  updateReplayButtonText();
};

document.getElementById('endDate').onchange = function() {
  endDateValue = this.value;
  applyFilter();
  renderEntriesList();
  updateReplayButtonText();
};

// Replay Day button
document.getElementById('replayDayBtn').onclick = function() {
  showTimelineReplay();
};

// Close timeline
document.getElementById('closeTimeline').onclick = function() {
  document.getElementById('timelineOverlay').style.display = 'none';
};

// Show timeline replay
function showTimelineReplay() {
  const entriesToReplay = filteredEntries.length > 0 ? filteredEntries : allEntries.filter(entry => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const entryDate = new Date(entry.time);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === today.getTime();
  });
  
  if (entriesToReplay.length === 0) {
    alert('No entries to replay for the selected period.');
    return;
  }
  
  // Sort entries chronologically
  const sortedEntries = [...entriesToReplay].sort((a, b) =>
    new Date(a.time) - new Date(b.time)
  );
  
  // Determine the title based on current filter
  let replayTitle = '📅 Day Replay';
  if (currentFilter === 'today') {
    replayTitle = '📅 Today\'s Replay';
  } else if (currentFilter === 'yesterday') {
    replayTitle = '📅 Yesterday\'s Replay';
  } else if (currentFilter === 'week') {
    replayTitle = '📅 This Week\'s Replay';
  } else if (currentFilter === 'custom') {
    if (startDateValue && endDateValue) {
      if (startDateValue === endDateValue) {
        const date = new Date(startDateValue);
        replayTitle = `📅 ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} Replay`;
      } else {
        const start = new Date(startDateValue);
        const end = new Date(endDateValue);
        replayTitle = `📅 ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} Replay`;
      }
    } else if (startDateValue) {
      const date = new Date(startDateValue);
      replayTitle = `📅 From ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} Replay`;
    } else if (endDateValue) {
      const date = new Date(endDateValue);
      replayTitle = `📅 Until ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} Replay`;
    }
  } else {
    replayTitle = '📅 All Entries Replay';
  }
  
  // Show overlay with fade-in
  const overlay = document.getElementById('timelineOverlay');
  overlay.style.display = 'block';
  overlay.style.opacity = '0';
  setTimeout(() => overlay.style.opacity = '1', 10);
  
  // Update the title in the overlay header
  const titleElement = document.getElementById('timelineTitle');
  if (titleElement) {
    titleElement.textContent = replayTitle;
  }
  
  // Build timeline
  const timelineContent = document.getElementById('timelineContent');
  timelineContent.innerHTML = `
    <div style="position: relative; padding-left: 40px;">
      <div id="timelineLine" style="position: absolute; left: 20px; top: 0; width: 4px; background: linear-gradient(180deg, #FFD700, #FFA500); height: 0; transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);"></div>
      <div id="timelineItems"></div>
      <canvas id="particleCanvas" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;"></canvas>
    </div>
  `;
  
  const timelineItems = document.getElementById('timelineItems');
  const timelineLine = document.getElementById('timelineLine');
  
  // Setup particle canvas
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = [];
  
  // Create particle effect
  function createParticles(x, y) {
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        size: Math.random() * 4 + 2,
        color: `rgba(255, ${Math.floor(Math.random() * 50 + 205)}, 0, `
      });
    }
  }
  
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      p.vy += 0.1; // gravity
      
      if (p.life <= 0) {
        particles.splice(index, 1);
      } else {
        ctx.fillStyle = p.color + p.life + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    if (particles.length > 0) {
      requestAnimationFrame(animateParticles);
    }
  }
  
  // Add items with enhanced animation
  sortedEntries.forEach((entry, index) => {
    const item = document.createElement('div');
    item.style.cssText = `
      position: relative;
      margin-bottom: 30px;
      opacity: 0;
      transform: translateX(-50px) scale(0.8) rotateY(-15deg);
      transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 2;
    `;
    
    const time = new Date(entry.time);
    const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    item.innerHTML = `
      <div class="timeline-dot" style="position: absolute; left: -28px; width: 16px; height: 16px; background: #FFD700; border-radius: 50%; border: 4px solid #1a1a1a; box-shadow: 0 0 20px rgba(255, 215, 0, 0.8); animation: pulse 2s infinite;"></div>
      <div class="timeline-card markdown-preview" style="background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); border: 2px solid #FFD700; border-radius: 12px; padding: 20px; box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3); position: relative; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;">
        <div style="position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%); pointer-events: none;"></div>
        <div style="color: #FFD700; font-weight: 700; font-size: 18px; margin-bottom: 10px; position: relative; text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);">
          🕐 ${timeStr}
        </div>
        <div style="color: #e0e0e0; line-height: 1.6; position: relative;">
          ${renderMarkdown(entry.note)}
        </div>
      </div>
    `;
    
    timelineItems.appendChild(item);
    
    // Animate in sequence with particles
    setTimeout(() => {
      item.style.opacity = '1';
      item.style.transform = 'translateX(0) scale(1) rotateY(0)';
      
      // Create particle burst
      const rect = item.getBoundingClientRect();
      createParticles(rect.left + 20, rect.top + rect.height / 2);
      animateParticles();
      
      // Grow timeline line with glow effect
      const itemHeight = item.offsetHeight + 30;
      const currentHeight = parseInt(timelineLine.style.height) || 0;
      timelineLine.style.height = (currentHeight + itemHeight) + 'px';
      
      // Add hover effect to card
      const card = item.querySelector('.timeline-card');
      card.onmouseenter = () => {
        card.style.transform = 'translateY(-5px) scale(1.02)';
        card.style.boxShadow = '0 12px 48px rgba(255, 215, 0, 0.5)';
      };
      card.onmouseleave = () => {
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 8px 32px rgba(255, 215, 0, 0.3)';
      };
    }, index * 400 + 300);
  });
  
  // Add enhanced summary at the end
  setTimeout(() => {
    const summary = document.createElement('div');
    summary.style.cssText = `
      margin-top: 40px;
      padding: 30px;
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%);
      border: 3px solid #FFD700;
      border-radius: 16px;
      text-align: center;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);
      position: relative;
      overflow: hidden;
      z-index: 2;
    `;
    summary.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, transparent 30%, rgba(255, 215, 0, 0.1) 50%, transparent 70%); animation: shimmer 3s infinite;"></div>
      <div style="color: #FFD700; font-size: 32px; font-weight: 700; margin-bottom: 15px; text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); position: relative;">
        ✨ Day Complete! ✨
      </div>
      <div style="color: #e0e0e0; font-size: 18px; position: relative;">
        ${sortedEntries.length} check-ins recorded
      </div>
      <div style="margin-top: 15px; font-size: 40px; position: relative; animation: bounce 1s infinite;">
        🎉
      </div>
    `;
    timelineContent.appendChild(summary);
    
    setTimeout(() => {
      summary.style.opacity = '1';
      summary.style.transform = 'scale(1)';
      
      // Final particle burst
      const rect = summary.getBoundingClientRect();
      for (let i = 0; i < 50; i++) {
        createParticles(
          rect.left + rect.width / 2 + (Math.random() - 0.5) * 100,
          rect.top + rect.height / 2 + (Math.random() - 0.5) * 50
        );
      }
      animateParticles();
    }, 100);
  }, sortedEntries.length * 400 + 800);
}

// Event listeners
document.getElementById('saveBtn').onclick = saveNewEntry;
document.getElementById('newEntryBtn').onclick = createNewEntry;
document.getElementById('searchInput').oninput = (e) => searchEntries(e.target.value);
document.getElementById('cancelDeleteBtn').onclick = hideDeleteModal;
document.getElementById('confirmDeleteBtn').onclick = deleteEntry;

// Close modal on background click
document.getElementById('deleteModal').onclick = (e) => {
  if (e.target.id === 'deleteModal') {
    hideDeleteModal();
  }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    }
    50% {
      transform: scale(1.2);
      box-shadow: 0 0 30px rgba(255, 215, 0, 1);
    }
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);


// Settings modal handlers for full view
document.getElementById('settingsIconFullView').onclick = function() {
  const modal = document.getElementById('settingsModalFullView');
  modal.classList.add('active');
  loadSettingsIntoFullViewModal();
};

document.getElementById('closeSettingsFullView').onclick = function() {
  document.getElementById('settingsModalFullView').classList.remove('active');
};

// Close modal when clicking outside
document.getElementById('settingsModalFullView').onclick = function(e) {
  if (e.target.id === 'settingsModalFullView') {
    this.classList.remove('active');
  }
};

// Load settings into full view modal
async function loadSettingsIntoFullViewModal() {
  const data = await chrome.storage.local.get(['frequency', 'snoozeUntil']);
  
  // Set frequency
  const frequency = data.frequency || 60;
  const select = document.getElementById('frequencySelectFullView');
  const standardValues = ['15', '30', '45', '60', '90', '120'];
  
  if (standardValues.includes(frequency.toString())) {
    select.value = frequency.toString();
  } else {
    select.value = 'custom';
    document.getElementById('customFrequencyContainerFullView').style.display = 'block';
    document.getElementById('customFrequencyFullView').value = frequency;
  }
  
  // Set snooze status
  updateSnoozeDisplayFullView(data.snoozeUntil);
}

// Update snooze display in full view modal
function updateSnoozeDisplayFullView(snoozeUntil) {
  const toggle = document.getElementById('snoozeToggleFullView');
  const status = document.getElementById('snoozeStatusFullView');
  const timer = document.getElementById('snoozeTimerFullView');
  
  if (snoozeUntil && Date.now() < snoozeUntil) {
    toggle.style.background = '#ff9800';
    toggle.querySelector('div').style.transform = 'translateX(24px)';
    status.style.color = '#ff9800';
    status.textContent = 'Snooze Active';
    
    const remaining = snoozeUntil - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    timer.textContent = `${hours}h ${minutes}m remaining`;
  } else {
    toggle.style.background = '#ccc';
    toggle.querySelector('div').style.transform = 'translateX(0)';
    status.style.color = '#999';
    status.textContent = 'Snooze Off';
    timer.textContent = '';
  }
}

// Frequency change handler for full view modal
document.getElementById('frequencySelectFullView').onchange = function() {
  const value = this.value;
  
  if (value === 'custom') {
    document.getElementById('customFrequencyContainerFullView').style.display = 'block';
    document.getElementById('customFrequencyFullView').focus();
  } else {
    document.getElementById('customFrequencyContainerFullView').style.display = 'none';
    const minutes = parseInt(value);
    chrome.storage.local.set({ frequency: minutes });
    chrome.runtime.sendMessage({ action: "resetTimer" });
    showNotification(`✓ Frequency updated to ${minutes} minutes`);
  }
};

// Handle custom frequency in full view modal
document.getElementById('applyCustomFrequencyFullView').onclick = function() {
  const customValue = parseInt(document.getElementById('customFrequencyFullView').value);
  
  if (!customValue || customValue < 1 || customValue > 1440) {
    showNotification('⚠️ Please enter a value between 1 and 1440 minutes');
    return;
  }
  
  chrome.storage.local.set({ frequency: customValue });
  chrome.runtime.sendMessage({ action: "resetTimer" });
  showNotification(`✓ Custom frequency set to ${customValue} minutes`);
};

// Allow Enter key to apply custom frequency in full view modal
document.getElementById('customFrequencyFullView').onkeypress = function(e) {
  if (e.key === 'Enter') {
    document.getElementById('applyCustomFrequencyFullView').click();
  }
};

// Snooze toggle handler for full view modal
document.getElementById('snoozeToggleFullView').onclick = async function() {
  const data = await chrome.storage.local.get('snoozeUntil');
  
  if (data.snoozeUntil && Date.now() < data.snoozeUntil) {
    // Turn off snooze
    await chrome.storage.local.remove('snoozeUntil');
    showNotification('⏰ Snooze disabled');
  } else {
    // Turn on snooze for 3 hours
    const snoozeUntil = Date.now() + (3 * 60 * 60 * 1000);
    await chrome.storage.local.set({ snoozeUntil });
    showNotification('😴 Snoozed for 3 hours');
  }
  
  // Update display
  const updatedData = await chrome.storage.local.get('snoozeUntil');
  updateSnoozeDisplayFullView(updatedData.snoozeUntil);
};

// David Goggins Quote Toggle Handler
document.getElementById('gogginsQuoteToggle').onclick = function() {
  toggleGogginsQuote();
};

// Initialize
loadEntries();
updateReplayButtonText();
resetQuoteState();

// Made with Bob
