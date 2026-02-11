# StandupNow - Three View Structure

## Overview
The extension now has 3 distinct views, each serving a specific purpose:

## 1. Popup View (`src/html/popup.html`)
**Triggered by:** Clicking the extension icon in the browser toolbar

**Purpose:** Quick overview and access point

**Features:**
- Countdown timer to next check-in
- Current time display
- Today's statistics (check-ins count, streak)
- Last 3 entries from today
- Quick action buttons:
  - Quick Check-in (opens timer-end view)
  - Full App (opens fullview)
  - Settings
  - Snooze
- Motivational quote

**JavaScript:** `src/js/popup.js`

**Size:** Compact popup (400px width)

---

## 2. Timer-End View (`src/html/timer-end.html`)
**Triggered by:** 
- When the hourly timer ends (automatic)
- Clicking "Quick Check-in" from popup
- Clicking notification

**Purpose:** Full check-in experience with focus on logging progress

**Features:**
- Large text area for detailed notes
- Auto-save draft functionality
- Save & Return / Skip & Return buttons
- Timer countdown display
- Recent entries with filtering (Today/Yesterday/All)
- Search functionality
- Copy today's entries
- Copy to bob (AI analysis)
- Settings modal
- Snooze functionality
- David Goggins quotes
- Opens in new tab and returns to previous tab after save/skip

**JavaScript:** `src/js/timer-end.js`

**Size:** Full page (585px width, 864px min-height)

---

## 3. Full App View (`src/html/fullview.html`)
**Triggered by:** 
- Clicking "Full App" from popup
- Clicking "Open" button in timer-end view

**Purpose:** Complete application with advanced features

**Features:**
- Sidebar with all entries
- Search and filter capabilities
- Date range filtering
- Activity heat map calendar
- Entry editor with markdown preview
- Create/Edit/Delete entries
- Timeline replay feature
- Settings modal
- Full-screen experience

**JavaScript:** `src/js/fullview.js`

**Size:** Full viewport (100vh)

---

## File Structure

```
src/
├── html/
│   ├── popup.html          # Popup view (extension icon click)
│   ├── timer-end.html      # Timer-end view (hourly check-in)
│   └── fullview.html       # Full app view (complete experience)
├── js/
│   ├── popup.js            # Popup logic
│   ├── timer-end.js        # Timer-end logic
│   ├── fullview.js         # Full app logic
│   ├── background.js       # Service worker
│   └── quotes.js           # Shared quotes
└── css/
    └── (inline styles in each HTML file)
```

---

## User Flow

1. **Extension Icon Click** → Popup View
   - Quick overview of progress
   - Access to all features

2. **Timer Ends** → Timer-End View
   - Focused check-in experience
   - Save progress and return to work

3. **Need Full Features** → Full App View
   - Review all entries
   - Advanced filtering and analysis
   - Timeline replay

---

## Key Changes from Previous Structure

- **Before:** 2 views (checkin.html served as both popup and timer-end)
- **After:** 3 distinct views with clear purposes
- **Benefit:** Better UX - lightweight popup for quick access, focused timer-end for check-ins, full app for deep work

---

## Configuration

**manifest.json:**
```json
"action": {
  "default_popup": "src/html/popup.html"
}
```

**background.js:**
- Opens `timer-end.html` when timer ends
- Opens `timer-end.html` on notification click