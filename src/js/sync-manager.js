// Sync Manager - Handles bidirectional sync with Android phone
class SyncManager {
    constructor() {
        this.syncInterval = null;
        this.AUTO_SYNC_INTERVAL = 30000; 
        this.storageKey = 'standupnow_entries';
        this.syncKey = 'standupnow_sync_config';
        this.config = {
            enabled: false,
            serverUrl: '',
            lastSyncTime: null,
            autoSyncEnabled: true
        };
        this.isSyncing = false;
        this.listeners = [];
    }

    // Initialize sync manager
    async init() {
        await this.loadConfig();
        if (this.config.enabled && this.config.autoSyncEnabled) {
            await this.startAutoSync();
        }
    }

    // Load sync configuration from storage
    async loadConfig() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.syncKey], (result) => {
                if (result[this.syncKey]) {
                    this.config = { ...this.config, ...result[this.syncKey] };
                }
                resolve();
            });
        });
    }

    // Save sync configuration to storage
    async saveConfig() {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.syncKey]: this.config }, () => {
                resolve();
            });
        });
    }

    // Test connection to phone
    async testConnection(ip, port) {
        const url = `http://${ip}:${port}/api/ping`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                return { success: false, error: `Server returned ${response.status}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Configure sync settings
    async configure(ip, port, enabled = true) {
        this.config.serverUrl = `http://${ip}:${port}`;
        this.config.enabled = enabled;
        await this.saveConfig();

        if (enabled && this.config.autoSyncEnabled) {
            await this.startAutoSync();
        } else {
            this.stopAutoSync();
        }
    }

    // Start auto-sync timer
    async startAutoSync() {
        // Clear existing interval
        this.stopAutoSync();

        // Sync immediately
        await this.syncWithPhone();

        // Set up recurring sync
        this.syncInterval = setInterval(async () => {
            await this.syncWithPhone();
        }, this.AUTO_SYNC_INTERVAL);

        this.notifyListeners('autoSyncStarted');
    }

    // Stop auto-sync timer
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        this.notifyListeners('autoSyncStopped');
    }

    // Perform bidirectional sync with phone
    async syncWithPhone() {
        if (this.isSyncing) {
            console.log('Sync already in progress, skipping...');
            return { success: false, error: 'Sync in progress' };
        }

        if (!this.config.enabled || !this.config.serverUrl) {
            return { success: false, error: 'Sync not configured' };
        }

        this.isSyncing = true;
        this.notifyListeners('syncStarted');

        try {
            // Get local entries
            const localEntries = await this.getLocalEntries();
            console.log('Local entries before sync:', localEntries.length);

            // Filter entries changed since last sync
            const entriesToSync = this.config.lastSyncTime
                ? localEntries.filter(e => new Date(e.updatedAt) > new Date(this.config.lastSyncTime))
                : localEntries;

            console.log('Entries to send:', entriesToSync.length);

            // Prepare sync request
            const syncRequest = {
                lastSync: this.config.lastSyncTime,
                entries: entriesToSync
            };

            console.log('Sending sync request to:', `${this.config.serverUrl}/api/sync`);

            // Send sync request to phone
            const response = await fetch(`${this.config.serverUrl}/api/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(syncRequest),
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Sync failed:', response.status, errorText);
                throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
            }

            const syncResponse = await response.json();

            // Log the response for debugging
            console.log('Sync response received:', syncResponse);
            console.log('Phone entries count:', syncResponse.entries?.length || 0);

            // Ensure entries array exists
            const phoneEntries = syncResponse.entries || [];

            if (phoneEntries.length > 0) {
                console.log('Sample phone entry:', phoneEntries[0]);
            }

            // Merge phone entries (phone wins conflicts)
            await this.mergeEntries(localEntries, phoneEntries);
            
            console.log('Merge complete');

            // Update last sync time
            this.config.lastSyncTime = syncResponse.serverTime || new Date().toISOString();
            await this.saveConfig();

            this.isSyncing = false;
            this.notifyListeners('syncComplete', {
                success: true,
                entriesReceived: phoneEntries.length,
                entriesSent: entriesToSync.length
            });

            return {
                success: true,
                entriesReceived: phoneEntries.length,
                entriesSent: entriesToSync.length
            };

        } catch (error) {
            this.isSyncing = false;
            this.notifyListeners('syncError', { error: error.message });
            return { success: false, error: error.message };
        }
    }

    // Get local entries from storage
    async getLocalEntries() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.storageKey], (result) => {
                resolve(result[this.storageKey] || []);
            });
        });
    }

    // Merge phone entries with local entries (phone wins)
    async mergeEntries(localEntries, phoneEntries) {
        console.log('Merging entries - Local:', localEntries.length, 'Phone:', phoneEntries.length);
        
        const map = new Map();

        // Add local entries
        localEntries.forEach(e => map.set(e.id, e));
        console.log('Added local entries to map:', map.size);

        // Phone entries override (phone wins conflicts)
        phoneEntries.forEach(e => map.set(e.id, e));
        console.log('After adding phone entries, map size:', map.size);

        // Filter deleted and sort by time (newest first)
        const mergedEntries = Array.from(map.values())
            .filter(e => !e.deleted)
            .sort((a, b) => new Date(b.time) - new Date(a.time));

        console.log('Final merged entries count:', mergedEntries.length);

        // Save merged entries
        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.storageKey]: mergedEntries }, () => {
                console.log('Merged entries saved to storage');
                resolve();
            });
        });
    }

    // Add event listener
    addEventListener(callback) {
        this.listeners.push(callback);
    }

    // Remove event listener
    removeEventListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    // Notify all listeners
    notifyListeners(event, data = {}) {
        this.listeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (error) {
                console.error('Error in sync listener:', error);
            }
        });
    }

    // Get sync status
    getStatus() {
        return {
            enabled: this.config.enabled,
            serverUrl: this.config.serverUrl,
            lastSyncTime: this.config.lastSyncTime,
            autoSyncEnabled: this.config.autoSyncEnabled,
            isSyncing: this.isSyncing
        };
    }

    // Disable sync
    async disable() {
        this.config.enabled = false;
        this.stopAutoSync();
        await this.saveConfig();
        this.notifyListeners('syncDisabled');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyncManager;
}

// Made with Bob