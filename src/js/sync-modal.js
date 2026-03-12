// Sync Modal UI Component
class SyncModalComponent {
    constructor(syncManager) {
        this.syncManager = syncManager;
        this.modal = null;
        this.overlay = null;
        this.elements = {};
    }

    // Initialize the modal
    init() {
        this.loadTemplate();
        this.cacheElements();
        this.setupEventListeners();
        this.updateUI();
        
        // Listen to sync events
        this.syncManager.addEventListener((event, data) => {
            this.handleSyncEvent(event, data);
        });
    }

    // Load the HTML template
    loadTemplate() {
        // Load the sync modal HTML into the body
        fetch('src/components/sync-modal.html')
            .then(response => response.text())
            .then(html => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                document.body.appendChild(tempDiv.firstElementChild);
                this.cacheElements();
                this.setupEventListeners();
                this.updateUI();
            })
            .catch(error => {
                console.error('Error loading sync modal:', error);
            });
    }

    // Cache DOM elements
    cacheElements() {
        this.overlay = document.getElementById('syncModalOverlay');
        this.modal = this.overlay?.querySelector('.modal-content');
        
        this.elements = {
            closeBtn: document.getElementById('closeSyncModal'),
            phoneIP: document.getElementById('phoneIP'),
            phonePort: document.getElementById('phonePort'),
            testConnectionBtn: document.getElementById('testConnectionBtn'),
            saveConnectionBtn: document.getElementById('saveConnectionBtn'),
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            statusDetails: document.getElementById('statusDetails'),
            lastSyncTime: document.getElementById('lastSyncTime'),
            autoSyncStatus: document.getElementById('autoSyncStatus'),
            serverUrl: document.getElementById('serverUrl'),
            manualSyncBtn: document.getElementById('manualSyncBtn'),
            disableSyncBtn: document.getElementById('disableSyncBtn')
        };
    }

    // Setup event listeners
    setupEventListeners() {
        if (!this.overlay) return;

        // Close modal
        this.elements.closeBtn?.addEventListener('click', () => this.hide());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // Test connection
        this.elements.testConnectionBtn?.addEventListener('click', () => this.testConnection());

        // Save connection
        this.elements.saveConnectionBtn?.addEventListener('click', () => this.saveConnection());

        // Manual sync
        this.elements.manualSyncBtn?.addEventListener('click', () => this.manualSync());

        // Disable sync
        this.elements.disableSyncBtn?.addEventListener('click', () => this.disableSync());
    }

    // Show modal
    show() {
        if (this.overlay) {
            this.overlay.classList.add('active');
            this.updateUI();
        }
    }

    // Hide modal
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    }

    // Test connection
    async testConnection() {
        const ip = this.elements.phoneIP?.value.trim();
        const port = this.elements.phonePort?.value.trim();

        if (!ip || !port) {
            this.showToast('Please enter IP address and port', 'error');
            return;
        }

        // Validate IP format
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipPattern.test(ip)) {
            this.showToast('Invalid IP address format', 'error');
            return;
        }

        this.updateStatus('syncing', 'Testing connection...');
        this.elements.testConnectionBtn.disabled = true;

        const result = await this.syncManager.testConnection(ip, port);

        this.elements.testConnectionBtn.disabled = false;

        if (result.success) {
            this.updateStatus('connected', 'Connection successful!', `Server version: ${result.data?.version || 'unknown'}`);
            this.showToast('Connection test successful!', 'success');
        } else {
            this.updateStatus('error', 'Connection failed', result.error);
            this.showToast(`Connection failed: ${result.error}`, 'error');
        }
    }

    // Save connection and enable sync
    async saveConnection() {
        const ip = this.elements.phoneIP?.value.trim();
        const port = this.elements.phonePort?.value.trim();

        if (!ip || !port) {
            this.showToast('Please enter IP address and port', 'error');
            return;
        }

        // Validate IP format
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipPattern.test(ip)) {
            this.showToast('Invalid IP address format', 'error');
            return;
        }

        this.elements.saveConnectionBtn.disabled = true;

        // Test connection first
        const testResult = await this.syncManager.testConnection(ip, port);
        
        if (!testResult.success) {
            this.showToast(`Cannot save: ${testResult.error}`, 'error');
            this.elements.saveConnectionBtn.disabled = false;
            return;
        }

        // Configure sync
        await this.syncManager.configure(ip, port, true);
        
        this.updateUI();
        this.showToast('Sync enabled successfully!', 'success');
        this.elements.saveConnectionBtn.disabled = false;
    }

    // Manual sync
    async manualSync() {
        this.elements.manualSyncBtn.disabled = true;
        this.updateStatus('syncing', 'Syncing...');

        const result = await this.syncManager.syncWithPhone();

        this.elements.manualSyncBtn.disabled = false;

        if (result.success) {
            this.updateUI();
            this.showToast(`Sync complete! Sent: ${result.entriesSent}, Received: ${result.entriesReceived}`, 'success');
            
            // Notify other components to refresh
            window.dispatchEvent(new CustomEvent('syncComplete'));
        } else {
            this.updateStatus('error', 'Sync failed', result.error);
            this.showToast(`Sync failed: ${result.error}`, 'error');
        }
    }

    // Disable sync
    async disableSync() {
        if (confirm('Are you sure you want to disable sync?')) {
            await this.syncManager.disable();
            this.updateUI();
            this.showToast('Sync disabled', 'success');
        }
    }

    // Update UI based on sync status
    updateUI() {
        const status = this.syncManager.getStatus();

        // Update connection info
        if (this.elements.serverUrl) {
            this.elements.serverUrl.textContent = status.serverUrl || 'Not configured';
        }

        if (this.elements.autoSyncStatus) {
            this.elements.autoSyncStatus.textContent = status.enabled && status.autoSyncEnabled ? 'Enabled' : 'Disabled';
        }

        if (this.elements.lastSyncTime) {
            if (status.lastSyncTime) {
                const date = new Date(status.lastSyncTime);
                this.elements.lastSyncTime.textContent = this.formatDateTime(date);
            } else {
                this.elements.lastSyncTime.textContent = 'Never';
            }
        }

        // Update status indicator
        if (status.enabled) {
            if (status.isSyncing) {
                this.updateStatus('syncing', 'Syncing...', 'Auto-sync is active');
            } else {
                this.updateStatus('connected', 'Connected', 'Auto-sync is active');
            }
        } else {
            this.updateStatus('disabled', 'Not connected', 'Sync is disabled');
        }

        // Enable/disable buttons
        if (this.elements.manualSyncBtn) {
            this.elements.manualSyncBtn.disabled = !status.enabled;
        }
        if (this.elements.disableSyncBtn) {
            this.elements.disableSyncBtn.disabled = !status.enabled;
        }
    }

    // Update status display
    updateStatus(type, text, details = '') {
        if (this.elements.statusDot) {
            this.elements.statusDot.className = `status-dot ${type}`;
        }
        if (this.elements.statusText) {
            this.elements.statusText.textContent = text;
        }
        if (this.elements.statusDetails) {
            this.elements.statusDetails.textContent = details;
        }
    }

    // Handle sync events
    handleSyncEvent(event, data) {
        switch (event) {
            case 'syncStarted':
                this.updateStatus('syncing', 'Syncing...', 'Please wait...');
                break;
            case 'syncComplete':
                this.updateUI();
                break;
            case 'syncError':
                this.updateStatus('error', 'Sync error', data.error);
                break;
            case 'syncDisabled':
                this.updateUI();
                break;
        }
    }

    // Show toast notification
    showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Format date time
    formatDateTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (days < 7) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleString();
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyncModalComponent;
}

// Made with Bob