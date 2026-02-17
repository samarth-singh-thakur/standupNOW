# StandupNow Sync Implementation Guide

Bidirectional sync between Chrome Extension and Android phone over local network.

## API Endpoints Required

Your Android server must implement these 2 endpoints:

### 1. Health Check (Optional)
```
GET /api/ping
Response: {"status": "ok"}
```

### 2. Bidirectional Sync (Required)
```
POST /api/sync

Request Body:
{
  "lastSync": "2026-02-17T11:00:00.000Z",
  "entries": [
    {
      "id": "uuid",
      "time": "2026-02-17T11:12:53.652Z",
      "note": "Entry content",
      "createdAt": "2026-02-17T11:12:53.652Z",
      "updatedAt": "2026-02-17T11:12:53.652Z",
      "version": 1,
      "deleted": false
    }
  ]
}

Response Body:
{
  "entries": [...phone entries updated since lastSync...],
  "serverTime": "2026-02-17T11:15:00.000Z"
}
```

**Test your endpoints:**
```bash
# Test ping
curl http://192.168.1.5:8080/api/ping

# Test sync
curl -X POST http://192.168.1.5:8080/api/sync \
  -H "Content-Type: application/json" \
  -d '{"lastSync":"1970-01-01T00:00:00.000Z","entries":[]}'
```

## Architecture

```
┌─────────────────┐         ┌──────────────────┐
│ Chrome Extension│◄───────►│  Android Phone   │
│    (Client)     │  Sync   │ (Local Server)   │
└─────────────────┘         └──────────────────┘
     Local Network (192.168.x.x:PORT)
```

**Phone = Source of Truth** (wins conflicts)

## Setup Flow

### 1. Android Server Setup

```kotlin
// Start local server
class SyncServer {
    private val port = 8080 // User configurable
    
    fun start() {
        val server = embeddedServer(Netty, port = port) {
            routing {
                get("/api/sync") { handleSync() }
            }
        }
        server.start()
        
        // Display connection info
        val localIP = getLocalIPAddress()
        showConnectionInfo(localIP, port)
    }
    
    private fun getLocalIPAddress(): String {
        val wifiManager = context.getSystemService(Context.WIFI_SERVICE) as WifiManager
        val ipInt = wifiManager.connectionInfo.ipAddress
        return String.format(
            "%d.%d.%d.%d",
            ipInt and 0xff,
            ipInt shr 8 and 0xff,
            ipInt shr 16 and 0xff,
            ipInt shr 24 and 0xff
        )
    }
}
```

### 2. Extension Connection Setup

```javascript
// User enters IP and port
async function connectToPhone() {
  const ip = document.getElementById('phoneIP').value;
  const port = document.getElementById('phonePort').value;
  
  const serverUrl = `http://${ip}:${port}`;
  
  // Test connection
  try {
    const response = await fetch(`${serverUrl}/api/ping`);
    if (response.ok) {
      await chrome.storage.local.set({ 
        serverUrl,
        connected: true 
      });
      showStatus("✓ Connected to phone");
      return true;
    }
  } catch (error) {
    showStatus("✗ Connection failed", true);
    return false;
  }
}
```

## Sync Protocol

### Bidirectional Sync Endpoint

```
GET /api/sync?lastSync=<timestamp>
```

**Request:**
```javascript
{
  "lastSync": "2026-02-17T11:00:00.000Z",  // Extension's last sync time
  "entries": [
    // Extension's new/updated entries since lastSync
    {
      "id": "uuid",
      "time": "2026-02-17T11:12:53.652Z",
      "note": "Entry from extension",
      "createdAt": "2026-02-17T11:12:53.652Z",
      "updatedAt": "2026-02-17T11:12:53.652Z",
      "version": 1,
      "deleted": false
    }
  ]
}
```

**Response:**
```javascript
{
  "entries": [
    // Phone's new/updated entries since lastSync
    {
      "id": "uuid",
      "time": "2026-02-17T10:30:00.000Z",
      "note": "Entry from phone",
      "createdAt": "2026-02-17T10:30:00.000Z",
      "updatedAt": "2026-02-17T10:30:00.000Z",
      "version": 1,
      "deleted": false
    }
  ],
  "serverTime": "2026-02-17T11:15:00.000Z"
}
```

## Android Server Implementation

```kotlin
@Serializable
data class SyncRequest(
    val lastSync: String,
    val entries: List<Entry>
)

@Serializable
data class SyncResponse(
    val entries: List<Entry>,
    val serverTime: String
)

@Serializable
data class Entry(
    val id: String,
    val time: String,
    val note: String,
    val createdAt: String,
    val updatedAt: String,
    val version: Int,
    val deleted: Boolean
)

// Sync endpoint
get("/api/sync") {
    val lastSync = call.request.queryParameters["lastSync"] ?: "1970-01-01T00:00:00.000Z"
    val request = call.receive<SyncRequest>()
    
    // Process incoming entries from extension
    request.entries.forEach { entry ->
        val existing = db.getEntry(entry.id)
        
        if (existing == null) {
            // New entry from extension
            db.insert(entry)
        } else {
            // Conflict resolution: phone wins
            if (entry.version > existing.version) {
                // Extension has newer version, but check timestamp
                if (parseTime(entry.updatedAt) > parseTime(existing.updatedAt)) {
                    db.update(entry)
                }
                // Otherwise keep phone version (phone wins)
            }
        }
    }
    
    // Get phone's entries updated since lastSync
    val phoneEntries = db.getEntriesUpdatedSince(lastSync)
    
    call.respond(SyncResponse(
        entries = phoneEntries,
        serverTime = Instant.now().toString()
    ))
}
```

## Extension Sync Implementation

```javascript
// Sync service
class SyncService {
  async sync() {
    const { serverUrl, lastSyncTime } = await chrome.storage.local.get([
      'serverUrl',
      'lastSyncTime'
    ]);
    
    if (!serverUrl) {
      return { success: false, error: "Not connected" };
    }
    
    try {
      // Get local entries updated since last sync
      const localEntries = await this.getLocalUpdates(lastSyncTime);
      
      // Send to phone and get phone's updates
      const response = await fetch(`${serverUrl}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastSync: lastSyncTime || new Date(0).toISOString(),
          entries: localEntries
        })
      });
      
      if (!response.ok) throw new Error(`Sync failed: ${response.status}`);
      
      const { entries: phoneEntries, serverTime } = await response.json();
      
      // Merge phone entries (phone wins conflicts)
      await this.mergeEntries(phoneEntries);
      
      // Update last sync time
      await chrome.storage.local.set({ lastSyncTime: serverTime });
      
      return { 
        success: true, 
        pushed: localEntries.length,
        pulled: phoneEntries.length 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async getLocalUpdates(since) {
    const data = await chrome.storage.local.get("entries");
    const entries = data.entries || [];
    
    if (!since) return entries;
    
    const sinceTime = new Date(since).getTime();
    return entries.filter(e => 
      new Date(e.updatedAt).getTime() > sinceTime
    );
  }
  
  async mergeEntries(phoneEntries) {
    const data = await chrome.storage.local.get("entries");
    const localEntries = data.entries || [];
    
    const map = new Map();
    
    // Add local entries
    localEntries.forEach(e => map.set(e.id, e));
    
    // Phone entries override (phone wins)
    phoneEntries.forEach(e => {
      const local = map.get(e.id);
      
      if (!local) {
        // New from phone
        map.set(e.id, e);
      } else {
        // Conflict: phone wins
        if (e.version >= local.version) {
          map.set(e.id, e);
        }
      }
    });
    
    // Sort and filter
    const merged = Array.from(map.values())
      .filter(e => !e.deleted)
      .sort((a, b) => new Date(b.time) - new Date(a.time));
    
    await chrome.storage.local.set({ entries: merged });
  }
}

// Initialize
const syncService = new SyncService();
```

## Connection UI

### Extension Settings Page

```html
<div class="sync-settings">
  <h3>Phone Connection</h3>
  
  <div class="connection-status">
    <span id="connectionStatus">Not Connected</span>
  </div>
  
  <div class="connection-form">
    <label>Phone IP Address:</label>
    <input type="text" id="phoneIP" placeholder="192.168.1.100">
    
    <label>Port:</label>
    <input type="number" id="phonePort" placeholder="8080" value="8080">
    
    <button id="connectBtn">Connect</button>
  </div>
  
  <div class="sync-controls">
    <button id="syncNowBtn">Sync Now</button>
    <button id="disconnectBtn">Disconnect</button>
  </div>
  
  <div class="sync-info">
    <p>Last sync: <span id="lastSyncTime">Never</span></p>
    <p>Auto-sync: <span id="autoSyncStatus">Enabled</span></p>
  </div>
</div>
```

```javascript
// Connection handlers
document.getElementById('connectBtn').onclick = async () => {
  const connected = await connectToPhone();
  if (connected) {
    updateConnectionUI(true);
    syncService.sync();
  }
};

document.getElementById('syncNowBtn').onclick = async () => {
  const result = await syncService.sync();
  if (result.success) {
    showStatus(`✓ Synced: ${result.pushed} sent, ${result.pulled} received`);
  } else {
    showStatus(`✗ Sync failed: ${result.error}`, true);
  }
};

document.getElementById('disconnectBtn').onclick = async () => {
  await chrome.storage.local.remove(['serverUrl', 'connected']);
  updateConnectionUI(false);
};

function updateConnectionUI(connected) {
  const status = document.getElementById('connectionStatus');
  status.textContent = connected ? '✓ Connected' : 'Not Connected';
  status.className = connected ? 'connected' : 'disconnected';
}
```

### Android Connection Display

```kotlin
// Show connection info in app
@Composable
fun ConnectionInfo(ip: String, port: Int) {
    Column {
        Text("Server Running", style = MaterialTheme.typography.h6)
        Text("IP: $ip", style = MaterialTheme.typography.body1)
        Text("Port: $port", style = MaterialTheme.typography.body1)
        
        // QR Code for easy setup
        QRCode(data = """{"ip":"$ip","port":$port}""")
        
        Text("Scan with extension or enter manually")
    }
}
```

## Auto-Sync

```javascript
// Background sync every 5 minutes
chrome.alarms.create("auto-sync", { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "auto-sync") {
    const { connected } = await chrome.storage.local.get('connected');
    if (connected) {
      await syncService.sync();
    }
  }
});

// Sync on extension startup
chrome.runtime.onStartup.addListener(async () => {
  const { connected } = await chrome.storage.local.get('connected');
  if (connected) {
    await syncService.sync();
  }
});
```

## Conflict Resolution

**Rule: Phone Always Wins**

```javascript
function resolveConflict(phoneEntry, localEntry) {
  // Phone version is higher or equal
  if (phoneEntry.version >= localEntry.version) {
    return phoneEntry;
  }
  
  // Same version, compare timestamps
  const phoneTime = new Date(phoneEntry.updatedAt).getTime();
  const localTime = new Date(localEntry.updatedAt).getTime();
  
  if (phoneTime >= localTime) {
    return phoneEntry;
  }
  
  // Default: phone wins
  return phoneEntry;
}
```

## Error Handling

```javascript
async function syncWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await syncService.sync();
    
    if (result.success) {
      return result;
    }
    
    // Wait before retry (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
  }
  
  return { success: false, error: "Max retries exceeded" };
}
```

## Security

### 1. Local Network Only

```javascript
// Validate IP is local network
function isLocalIP(ip) {
  return ip.startsWith('192.168.') || 
         ip.startsWith('10.') || 
         ip.startsWith('172.');
}
```

### 2. Optional Authentication

```kotlin
// Simple token-based auth
@Serializable
data class AuthRequest(val token: String)

fun validateToken(token: String): Boolean {
    val storedToken = preferences.getString("sync_token", "")
    return token == storedToken
}

// Middleware
intercept(ApplicationCallPipeline.Call) {
    val token = call.request.headers["X-Sync-Token"]
    if (token == null || !validateToken(token)) {
        call.respond(HttpStatusCode.Unauthorized)
        finish()
    }
}
```

```javascript
// Extension stores token
async function setAuthToken(token) {
  await chrome.storage.local.set({ syncToken: token });
}

// Include in requests
const { syncToken } = await chrome.storage.local.get('syncToken');
fetch(url, {
  headers: { 'X-Sync-Token': syncToken }
});
```

## Testing

```javascript
// Test connection
async function testConnection() {
  const { serverUrl } = await chrome.storage.local.get('serverUrl');
  
  try {
    const response = await fetch(`${serverUrl}/api/ping`);
    console.log('Connection:', response.ok ? 'OK' : 'Failed');
  } catch (error) {
    console.error('Connection error:', error);
  }
}

// Test sync
async function testSync() {
  const result = await syncService.sync();
  console.log('Sync result:', result);
}
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check phone and computer on same WiFi
   - Verify IP address is correct
   - Check firewall settings
   - Ensure server is running on phone

2. **Sync Not Working**
   - Check last sync time
   - Verify entries have proper format
   - Check for network errors in console

3. **Data Not Appearing**
   - Verify conflict resolution
   - Check deleted flag
   - Ensure proper sorting

---

**Version:** 2.0 (2026-02-17)