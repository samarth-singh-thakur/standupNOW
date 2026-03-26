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
            connectionHint: document.getElementById('connectionHint'),
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            statusDetails: document.getElementById('statusDetails'),
            lastSyncTime: document.getElementById('lastSyncTime'),
            autoSyncStatus: document.getElementById('autoSyncStatus'),
            serverUrl: document.getElementById('serverUrl'),
            manualSyncBtn: document.getElementById('manualSyncBtn'),
            disableSyncBtn: document.getElementById('disableSyncBtn')
        };
        
        // Debounce timer for auto-test
        this.autoTestTimer = null;
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

        // Auto-test on input change (debounced)
        this.elements.phoneIP?.addEventListener('input', () => this.handleInputChange());
        this.elements.phonePort?.addEventListener('input', () => this.handleInputChange());

        // Manual sync
        this.elements.manualSyncBtn?.addEventListener('click', () => this.manualSync());

        // Disable sync
        this.elements.disableSyncBtn?.addEventListener('click', () => this.disableSync());
    }

    // Handle input change with debouncing
    handleInputChange() {
        // Clear existing timer
        if (this.autoTestTimer) {
            clearTimeout(this.autoTestTimer);
        }

        // Reset input styling to neutral
        this.setInputState('testing');

        // Set new timer for auto-test (1 second after user stops typing)
        this.autoTestTimer = setTimeout(() => {
            this.autoTestAndSave();
        }, 1000);
    }

    // Set visual state for input fields
    setInputState(state) {
        const inputs = document.querySelectorAll('.connection-input');
        inputs.forEach(input => {
            input.classList.remove('input-success', 'input-error', 'input-testing');
            if (state === 'success') {
                input.classList.add('input-success');
            } else if (state === 'error') {
                input.classList.add('input-error');
            } else if (state === 'testing') {
                input.classList.add('input-testing');
            }
        });
    }

    // Auto-test connection and save if successful (non-blocking)
    autoTestAndSave() {
        const ip = this.elements.phoneIP?.value.trim();
        const port = this.elements.phonePort?.value.trim();

        if (!ip || !port) {
            this.setInputState('error');
            this.updateConnectionHint('Please enter IP address and port', 'error');
            return;
        }

        // Validate IP format
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!ipPattern.test(ip)) {
            this.setInputState('error');
            this.updateConnectionHint('Invalid IP address format', 'error');
            return;
        }

        // Show testing state
        this.updateStatus('syncing', 'Testing connection...');
        this.updateConnectionHint('Testing connection...', 'info');

        // Run test in background without blocking UI
        this.syncManager.testConnection(ip, port)
            .then(result => {
                if (result.success) {
                    // Connection successful - save and enable sync
                    this.setInputState('success');
                    this.updateConnectionHint('✓ Connected and syncing', 'success');
                    this.updateStatus('connected', 'Connected', `Server version: ${result.data?.version || 'unknown'}`);
                    
                    // Auto-save configuration (fire and forget)
                    this.syncManager.configure(ip, port, true)
                        .then(() => {
                            this.updateUI();
                            console.log('✅ Auto-saved connection:', ip, port);
                        })
                        .catch(error => {
                            console.error('Error saving config:', error);
                        });
                } else {
                    // Connection failed
                    this.setInputState('error');
                    this.updateConnectionHint(`✗ ${result.error}`, 'error');
                    this.updateStatus('error', 'Connection failed', result.error);
                }
            })
            .catch(error => {
                this.setInputState('error');
                this.updateConnectionHint(`✗ ${error.message}`, 'error');
                this.updateStatus('error', 'Connection error', error.message);
            });
    }

    // Update connection hint message
    updateConnectionHint(message, type) {
        if (!this.elements.connectionHint) return;
        
        this.elements.connectionHint.textContent = message;
        this.elements.connectionHint.className = 'form-hint';
        
        if (type === 'success') {
            this.elements.connectionHint.style.color = '#10b981';
        } else if (type === 'error') {
            this.elements.connectionHint.style.color = '#ef4444';
        } else if (type === 'info') {
            this.elements.connectionHint.style.color = '#3b82f6';
        } else {
            this.elements.connectionHint.style.color = '';
        }
    }

    // Show modal
    show() {
        if (this.overlay) {
            this.overlay.classList.add('active');
            this.loadSavedConfig();
            this.updateUI();
        }
    }

    // Load saved configuration into input fields
    async loadSavedConfig() {
        const status = this.syncManager.getStatus();
        
        if (status.serverUrl) {
            // Parse the server URL to extract IP and port
            try {
                const url = new URL(status.serverUrl);
                const ip = url.hostname;
                const port = url.port || '8080';
                
                if (this.elements.phoneIP) {
                    this.elements.phoneIP.value = ip;
                }
                if (this.elements.phonePort) {
                    this.elements.phonePort.value = port;
                }
                
                console.log('📱 Loaded saved config - IP:', ip, 'Port:', port);
            } catch (error) {
                console.error('Error parsing server URL:', error);
            }
        }
    }

    // Hide modal
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
    }


    // Manual sync (non-blocking UI)
    manualSync() {
        this.elements.manualSyncBtn.disabled = true;
        this.updateStatus('syncing', 'Syncing...');

        // Run sync in background without blocking UI
        this.syncManager.syncWithPhone()
            .then(result => {
                this.elements.manualSyncBtn.disabled = false;

                if (result.success) {
                    this.updateUI();
                    this.showToast(`Sync complete! Sent: ${result.entriesSent}, Received: ${result.entriesReceived}`, 'success');
                    
                    // Wait a bit to ensure storage write completes, then notify other components to refresh
                    setTimeout(() => {
                        console.log('🔄 Dispatching syncComplete event');
                        window.dispatchEvent(new CustomEvent('syncComplete', {
                            detail: {
                                entriesReceived: result.entriesReceived,
                                entriesSent: result.entriesSent
                            }
                        }));
                    }, 100);
                } else if (!result.skipped) {
                    // Only show error if not skipped
                    this.updateStatus('error', 'Sync failed', result.error);
                    this.showToast(`Sync failed: ${result.error}`, 'error');
                } else {
                    // Sync was skipped because one is already in progress
                    this.updateStatus('syncing', 'Sync in progress', 'Please wait...');
                    this.elements.manualSyncBtn.disabled = false;
                }
            })
            .catch(error => {
                this.elements.manualSyncBtn.disabled = false;
                this.updateStatus('error', 'Sync error', error.message);
                this.showToast(`Sync error: ${error.message}`, 'error');
            });
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