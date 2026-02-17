// Shared sync manager for all pages
// Handles sync operations, auto-sync intervals, and connection management

class SyncManager {
  constructor() {
    this.syncInterval = null;
    this.AUTO_SYNC_INTERVAL = 60000; // 1 minute in milliseconds
  }

  // Initialize sync manager
  async init() {
    await this.startAutoSync();
    await this.updateSyncStatus();
  }

  // Start auto-sync interval
  async startAutoSync() {
    // Clear any existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Check if sync is enabled
    const data = await chrome.storage.local.get(['syncEnabled', 'serverUrl']);
    if (data.syncEnabled && data.serverUrl) {
      // Sync immediately
      await this.syncWithPhone();
      
      // Set up interval for auto-sync every 1 minute
      this.syncInterval = setInterval(async () => {
        await this.syncWithPhone();
      }, this.AUTO_SYNC_INTERVAL);
      
      console.log('Auto-sync started (1 minute interval)');
    }
  }

  // Stop auto-sync interval
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  // Sync with phone
  async syncWithPhone() {
    const data = await chrome.storage.local.get(['serverUrl', 'lastSyncTime', 'entries']);
    
    if (!data.serverUrl) {
      console.log('Sync skipped: No server URL');
      return { success: false, error: 'Not connected' };
    }
    
    try {
      const entries = data.entries || [];
      const lastSync = data.lastSyncTime || new Date(0).toISOString();
      
      // Get entries updated since last sync
      const sinceTime = new Date(lastSync).getTime();
      const localUpdates = entries.filter(e => {
        const entryTime = new Date(e.updatedAt || e.time).getTime();
        return entryTime > sinceTime;
      });
      
      console.log('Syncing with phone:', {
        serverUrl: data.serverUrl,
        lastSync,
        localUpdates: localUpdates.length,
        totalEntries: entries.length
      });
      
      // Send to phone
      const requestBody = {
        lastSync,
        entries: localUpdates
      };
      
      const response = await fetch(`${data.serverUrl}/api/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sync failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Sync response:', result);
      
      // Merge phone entries
      const phoneEntries = result.entries || [];
      const map = new Map();
      
      // Add local entries
      entries.forEach(e => {
        if (e.id) map.set(e.id, e);
      });
      
      // Phone entries override (phone wins)
      phoneEntries.forEach(e => {
        if (e.id) map.set(e.id, e);
      });
      
      const merged = Array.from(map.values())
        .filter(e => !e.deleted)
        .sort((a, b) => new Date(b.time) - new Date(a.time));
      
      console.log('Merged entries:', merged.length);
      
      await chrome.storage.local.set({
        entries: merged,
        lastSyncTime: result.serverTime || new Date().toISOString()
      });
      
      // Notify listeners of sync completion
      this.notifySyncComplete();
      
      return {
        success: true,
        pushed: localUpdates.length,
        pulled: phoneEntries.length
      };
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, error: error.message };
    }
  }

  // Test connection to phone
  async testConnection(ip, port) {
    const serverUrl = `http://${ip}:${port}`;
    
    try {
      const response = await fetch(`${serverUrl}/api/ping`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Connect to phone
  async connect(ip, port) {
    const serverUrl = `http://${ip}:${port}`;
    
    const isConnected = await this.testConnection(ip, port);
    if (!isConnected) {
      return { success: false, error: 'Cannot reach phone' };
    }
    
    await chrome.storage.local.set({
      serverUrl,
      syncEnabled: true,
      lastSyncTime: null // Reset to force full sync
    });
    
    // Start auto-sync
    await this.startAutoSync();
    
    return { success: true };
  }

  // Disconnect from phone
  async disconnect() {
    await chrome.storage.local.set({ syncEnabled: false });
    await chrome.storage.local.remove('serverUrl');
    this.stopAutoSync();
  }

  // Get sync status
  async getSyncStatus() {
    const data = await chrome.storage.local.get(['syncEnabled', 'serverUrl', 'lastSyncTime']);
    
    return {
      connected: !!(data.syncEnabled && data.serverUrl),
      serverUrl: data.serverUrl,
      lastSyncTime: data.lastSyncTime
    };
  }

  // Update sync status display (to be implemented by each page)
  async updateSyncStatus() {
    // Override this in each page
  }

  // Notify sync complete (to be implemented by each page)
  notifySyncComplete() {
    // Override this in each page
    // Dispatch custom event for pages to listen to
    window.dispatchEvent(new CustomEvent('syncComplete'));
  }
}

// Create singleton instance and make it globally accessible
window.syncManager = new SyncManager();

// Made with Bob
