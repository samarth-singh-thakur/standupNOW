# StandupNOW - Sync Module Implementation Plan

## 📋 Executive Summary

This document outlines the plan to implement bidirectional sync functionality between the Chrome Extension (v2.0) and Android phone over local network. The sync module was previously implemented in the `main` branch but removed during the v2.0 refactor.

## 🎯 Current State Analysis

### v2.0 Branch (Current)
- **Architecture**: Clean component-based structure
- **Storage**: Chrome Storage API (`chrome.storage.local`)
- **Components**:
  - `QuickJotComponent` - Note input interface
  - `EntriesComponent` - Entry list with filtering (Today/Yesterday/All)
  - `HeaderComponent` - Navigation and actions
- **Entry Structure**:
  ```javascript
  {
    id: "uuid",
    time: "ISO timestamp",
    note: "content",
    createdAt: "ISO timestamp",
    updatedAt: "ISO timestamp",
    version: 1,
    deleted: false
  }
  ```
- **Features**:
  - Draft auto-save
  - Timeline view with time elapsed indicators
  - Filter by date (Today/Yesterday/All)
  - Local-only storage

### Main Branch (Previous Implementation)
- **Sync Features**:
  - Bidirectional sync with Android phone
  - Auto-sync every 60 seconds
  - Manual sync trigger
  - Connection status indicators
  - Phone as source of truth (conflict resolution)
- **Components Removed**:
  - `sync-manager.js` - Core sync logic
  - `sync-ui.js` - UI components for sync
  - Background service worker for auto-sync
- **API Endpoints**:
  - `GET /api/ping` - Health check
  - `POST /api/sync` - Bidirectional sync

## 🏗️ Architecture Design

### Sync Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension (v2.0)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Quick Jot   │  │   Entries    │  │    Header    │      │
│  │  Component   │  │  Component   │  │  Component   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Sync Manager  │◄──── Auto-sync Timer  │
│                    │   (New Module) │                        │
│                    └───────┬────────┘                        │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │ Chrome Storage │                        │
│                    │     Local      │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼────────────────────────────────┘
                             │
                    HTTP POST /api/sync
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      Android Phone                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Local HTTP Server (Ktor/Netty)          │   │
│  │                    Port: 8080 (configurable)         │   │
│  └──────────────────────────┬───────────────────────────┘   │
│                             │                                │
│                    ┌────────▼────────┐                       │
│                    │  SQLite/Room DB │                       │
│                    │  (Source of Truth)                      │
│                    └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **User creates entry** → Saved to Chrome Storage → Marked for sync
2. **Auto-sync timer** (60s) → Triggers sync
3. **Sync Manager** → Collects local changes since last sync
4. **HTTP POST** → Sends to phone `/api/sync`
5. **Phone processes** → Merges with local DB → Returns phone changes
6. **Extension merges** → Phone entries override local (phone wins)
7. **UI updates** → All components refresh

## 📦 Implementation Plan

### Phase 1: Core Sync Module (Week 1)

#### 1.1 Create `src/js/sync-manager.js`
```javascript
class SyncManager {
  constructor() {
    this.syncInterval = null;
    this.AUTO_SYNC_INTERVAL = 60000; // 1 minute
    this.storageKey = 'standupnow_entries';
    this.syncKey = 'standupnow_sync_config';
  }

  async init() {
    await this.loadConfig();
    if (this.config.enabled) {
      await this.startAutoSync();
    }
  }

  async syncWithPhone() {
    // Bidirectional sync logic
    // 1. Get local changes since lastSync
    // 2. POST to phone /api/sync
    // 3. Merge phone entries (phone wins)
    // 4. Update lastSyncTime
    // 5. Notify listeners
  }

  async testConnection(ip, port) {
    // Test /api/ping endpoint
  }

  startAutoSync() {
    // Set interval for auto-sync
  }

  stopAutoSync() {
    // Clear interval
  }
}
```

**Key Features**:
- Auto-sync every 30 seconds when enabled
- Manual sync trigger
- Connection testing
- Error handling and retry logic
- Event notifications for UI updates

#### 1.2 Update `manifest.json`
```json
{
  "permissions": [
    "storage"
    // No additional permissions needed for sync
  ]
}
```

**Note**: We don't need `alarms` permission or a background service worker. The sync will run using `setInterval` when the popup is open, and we'll sync immediately when the popup opens. This is simpler and sufficient for a standup notes app where users typically open it multiple times per day.

### Phase 2: UI Components (Week 2)

#### 2.1 Create Sync Settings UI
Add to header or create new settings modal:
```html
<!-- Sync Settings Modal -->
<div class="sync-settings-modal">
  <h3>Sync with Phone</h3>
  
  <div class="connection-setup">
    <label>Phone IP Address</label>
    <input type="text" id="phoneIP" placeholder="192.168.1.5">
    
    <label>Port</label>
    <input type="number" id="phonePort" value="8080">
    
    <button id="testConnection">Test Connection</button>
    <button id="saveConnection">Save & Enable Sync</button>
  </div>
  
  <div class="sync-status">
    <span class="status-indicator"></span>
    <span class="status-text">Not connected</span>
  </div>
  
  <div class="sync-info">
    <p>Last sync: <span id="lastSyncTime">Never</span></p>
    <button id="manualSync">Sync Now</button>
  </div>
</div>
```

#### 2.2 Add Sync Indicator to Header
```javascript
// In header.html
<div class="sync-indicator" id="syncIndicator">
  <span class="sync-dot"></span>
  <span class="sync-text">Synced</span>
</div>
```

**States**:
- 🟢 Green: Synced successfully
- 🟡 Yellow: Syncing in progress
- 🔴 Red: Sync error
- ⚪ Gray: Sync disabled

#### 2.3 Update `EntriesComponent`
Add sync event listener to refresh on sync completion:
```javascript
// In entries.js
window.addEventListener('syncComplete', () => {
  this.render();
});
```

### Phase 3: Android Server Requirements (Week 3)

#### 3.1 API Endpoints

**Endpoint 1: Health Check**
```
GET /api/ping
Response: 200 OK
{
  "status": "ok",
  "version": "1.0.0"
}
```

**Endpoint 2: Bidirectional Sync**
```
POST /api/sync
Content-Type: application/json

Request:
{
  "lastSync": "2026-03-12T13:00:00.000Z",
  "entries": [
    {
      "id": "uuid-1",
      "time": "2026-03-12T13:30:00.000Z",
      "note": "Extension entry",
      "createdAt": "2026-03-12T13:30:00.000Z",
      "updatedAt": "2026-03-12T13:30:00.000Z",
      "version": 1,
      "deleted": false
    }
  ]
}

Response: 200 OK
{
  "entries": [
    {
      "id": "uuid-2",
      "time": "2026-03-12T13:15:00.000Z",
      "note": "Phone entry",
      "createdAt": "2026-03-12T13:15:00.000Z",
      "updatedAt": "2026-03-12T13:15:00.000Z",
      "version": 1,
      "deleted": false
    }
  ],
  "serverTime": "2026-03-12T13:45:00.000Z"
}
```

#### 3.2 Conflict Resolution
**Rule**: Phone always wins
- If same `id` exists on both sides, use phone version
- Extension entries are merged into phone DB
- Phone returns all entries updated since `lastSync`

#### 3.3 CORS Configuration
```kotlin
// In Android server
install(CORS) {
    anyHost()
    allowHeader(HttpHeaders.ContentType)
    allowMethod(HttpMethod.POST)
    allowMethod(HttpMethod.GET)
}
```

### Phase 4: Testing & Polish (Week 4)

#### 4.1 Test Scenarios
- [ ] Initial connection setup
- [ ] First sync (empty → populated)
- [ ] Bidirectional sync (both have entries)
- [ ] Conflict resolution (same ID)
- [ ] Deleted entries sync
- [ ] Network failure handling
- [ ] Auto-sync reliability
- [ ] Manual sync trigger
- [ ] Connection loss recovery

#### 4.2 Error Handling
- Network timeout (10s)
- Connection refused
- Invalid response format
- Server errors (5xx)
- Rate limiting

#### 4.3 Performance
- Sync only changed entries (delta sync)
- Batch operations
- Debounce rapid changes
- Background sync doesn't block UI

## 🔧 Technical Specifications

### Storage Schema

#### Chrome Storage
```javascript
{
  // Existing
  "standupnow_entries": [...entries...],
  "standupnow_draft": "draft text",
  
  // New for sync
  "standupnow_sync_config": {
    "enabled": true,
    "serverUrl": "http://192.168.1.5:8080",
    "lastSyncTime": "2026-03-12T13:45:00.000Z",
    "autoSyncEnabled": true
  }
}
```

### Entry Schema (Unchanged)
```javascript
{
  id: String,           // UUID v4
  time: String,         // ISO 8601 timestamp
  note: String,         // Entry content
  createdAt: String,    // ISO 8601 timestamp
  updatedAt: String,    // ISO 8601 timestamp
  version: Number,      // Version number for conflict resolution
  deleted: Boolean      // Soft delete flag
}
```

### Sync Protocol

#### Request Flow
1. Extension collects entries where `updatedAt > lastSyncTime`
2. POST to `/api/sync` with `lastSync` and `entries[]`
3. Phone merges extension entries into DB
4. Phone returns entries where `updatedAt > lastSync`
5. Extension merges phone entries (phone wins conflicts)
6. Extension updates `lastSyncTime` to `serverTime`

#### Merge Algorithm
```javascript
function mergeEntries(localEntries, phoneEntries) {
  const map = new Map();
  
  // Add local entries
  localEntries.forEach(e => map.set(e.id, e));
  
  // Phone entries override (phone wins)
  phoneEntries.forEach(e => map.set(e.id, e));
  
  // Filter deleted and sort
  return Array.from(map.values())
    .filter(e => !e.deleted)
    .sort((a, b) => new Date(b.time) - new Date(a.time));
}
```

## 📱 User Experience

### Setup Flow
1. User clicks "Settings" in header
2. Opens sync settings modal
3. Enters phone IP and port (shown on phone app)
4. Clicks "Test Connection"
5. If successful, clicks "Save & Enable Sync"
6. Sync indicator appears in header
7. Auto-sync starts immediately

### Sync Indicators
- **Header badge**: Shows sync status
- **Toast notifications**: "Synced successfully" / "Sync failed"
- **Last sync time**: Displayed in settings
- **Manual sync button**: For immediate sync

### Error Messages
- "Cannot connect to phone. Check IP and port."
- "Sync failed. Retrying in 60 seconds..."
- "Phone not reachable. Sync paused."

## 🚀 Migration Strategy

### For Existing Users (main branch → v2.0 + sync)
1. Existing entries in Chrome Storage remain intact
2. First sync will push all local entries to phone
3. Phone merges and returns its entries
4. Extension merges (phone wins)
5. User sees combined entries

### Backward Compatibility
- Sync is optional (disabled by default)
- Extension works fully offline
- No breaking changes to entry structure

## 📊 Success Metrics

### Technical
- Sync latency < 2 seconds
- Success rate > 95%
- Auto-sync reliability > 99%
- Zero data loss

### User Experience
- Setup time < 2 minutes
- Sync status always visible
- Clear error messages
- Seamless background sync

## 🔐 Security Considerations

### Network Security
- Local network only (192.168.x.x)
- No external servers
- No authentication (trusted local network)
- HTTPS optional (local cert complexity)

### Data Privacy
- All data stays on local network
- No cloud storage
- No third-party services
- User controls sync enable/disable

## 📝 Documentation Updates

### README.md Updates
```markdown
## Sync with Phone

StandupNOW can sync your entries with your Android phone over your local network.

### Setup
1. Install StandupNOW Android app
2. Start sync server on phone (shows IP and port)
3. In extension, click Settings → Sync
4. Enter phone IP and port
5. Click "Test Connection" then "Save & Enable Sync"

### Features
- Auto-sync every 60 seconds
- Manual sync on demand
- Bidirectional sync (phone and extension)
- Phone is source of truth for conflicts
```

## 🎯 Implementation Checklist

### Phase 1: Core Sync Module
- [ ] Create `src/js/sync-manager.js`
- [ ] Implement `syncWithPhone()` method
- [ ] Implement `testConnection()` method
- [ ] Implement auto-sync timer (setInterval in popup)
- [ ] Add error handling and retry logic
- [ ] Integrate with extension.js initialization

### Phase 2: UI Components
- [ ] Create sync settings modal HTML
- [ ] Create sync settings modal CSS
- [ ] Add sync indicator to header
- [ ] Implement connection setup flow
- [ ] Add manual sync button
- [ ] Add sync status display
- [ ] Add toast notifications
- [ ] Update `EntriesComponent` for sync events

### Phase 3: Integration
- [ ] Connect sync manager to components
- [ ] Test bidirectional sync
- [ ] Test conflict resolution
- [ ] Test auto-sync reliability
- [ ] Test error scenarios
- [ ] Test network failure recovery

### Phase 4: Documentation
- [ ] Update README.md
- [ ] Create user guide
- [ ] Document API endpoints
- [ ] Create troubleshooting guide

## 🔄 Next Steps

1. **Review this plan** with team/stakeholders
2. **Set up Android server** (separate project)
3. **Implement Phase 1** (Core Sync Module)
4. **Test with mock server** before Android integration
5. **Implement Phase 2** (UI Components)
6. **Integration testing** with real Android app
7. **User testing** and feedback
8. **Production release**

## 📞 Support & Troubleshooting

### Common Issues

**"Cannot connect to phone"**
- Check phone and computer on same WiFi
- Verify IP address is correct
- Check port number matches phone app
- Disable firewall temporarily

**"Sync keeps failing"**
- Check phone app is running
- Verify server is started on phone
- Check network stability
- Try manual sync

**"Entries not syncing"**
- Check last sync time
- Verify auto-sync is enabled
- Check sync status indicator
- Try disabling and re-enabling sync

---

**Document Version**: 1.0  
**Last Updated**: 2026-03-12  
**Author**: Bob (AI Assistant)  
**Status**: Ready for Implementation