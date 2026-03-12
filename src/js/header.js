// Header Component JavaScript

class HeaderComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.notificationBtn = null;
        this.refreshBtn = null;
        this.settingsBtn = null;
        this.syncTimeText = null;
        this.onNotificationClick = null;
        this.onRefreshClick = null;
        this.onSettingsClick = null;
        this.syncTimeInterval = null;
    }

    // Initialize the component
    init() {
        this.loadTemplate();
        this.cacheElements();
        this.setupEventListeners();
        this.startSyncTimeUpdater();
    }

    // Load the HTML template
    loadTemplate() {
        const template = `
            <!-- Header Component -->
            <header class="header">
                <h1 class="app-title">StandupNOW</h1>
                <div class="header-icons">
                    <button class="icon-btn" id="notificationBtn" aria-label="Notifications">
                        <img src="src/assets/icons/bell.svg" alt="Notifications" class="icon">
                    </button>
                    <div class="sync-btn-wrapper">
                        <button class="icon-btn" id="refreshBtn" aria-label="Refresh">
                            <img src="src/assets/icons/sync-icon.svg" alt="Refresh" class="icon">
                        </button>
                        <span class="sync-time-text" id="syncTimeText">Never</span>
                    </div>
                    <button class="icon-btn" id="settingsBtn" aria-label="Settings">
                        <img src="src/assets/icons/settings.svg" alt="Settings" class="icon">
                    </button>
                </div>
            </header>
        `;
        this.container.innerHTML = template;
    }

    // Cache DOM elements
    cacheElements() {
        this.notificationBtn = document.getElementById('notificationBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.syncTimeText = document.getElementById('syncTimeText');
    }

    // Setup event listeners
    setupEventListeners() {
        if (this.notificationBtn) {
            this.notificationBtn.addEventListener('click', () => {
                if (this.onNotificationClick) {
                    this.onNotificationClick();
                }
            });
        }

        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                // Add rotation animation
                this.refreshBtn.style.transform = 'rotate(360deg)';
                this.refreshBtn.style.transition = 'transform 0.5s ease';
                setTimeout(() => {
                    this.refreshBtn.style.transform = 'rotate(0deg)';
                }, 500);

                if (this.onRefreshClick) {
                    this.onRefreshClick();
                }
            });
        }

        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => {
                if (this.onSettingsClick) {
                    this.onSettingsClick();
                }
            });
        }
    }

    // Start sync time updater
    startSyncTimeUpdater() {
        this.updateSyncTime();
        // Update every 30 seconds
        this.syncTimeInterval = setInterval(() => {
            this.updateSyncTime();
        }, 30000);
    }

    // Update sync time display
    async updateSyncTime() {
        if (!this.syncTimeText) return;

        try {
            const result = await new Promise((resolve) => {
                if (typeof chrome !== 'undefined' && chrome.storage) {
                    chrome.storage.local.get(['standupnow_sync_config'], (result) => {
                        resolve(result.standupnow_sync_config);
                    });
                } else {
                    resolve(null);
                }
            });

            if (result && result.lastSyncTime) {
                const lastSync = new Date(result.lastSyncTime);
                const now = new Date();
                const diffMs = now - lastSync;
                const diffMins = Math.floor(diffMs / 60000);

                if (diffMins < 1) {
                    this.syncTimeText.textContent = 'Just now';
                } else if (diffMins < 60) {
                    this.syncTimeText.textContent = `${diffMins}m ago`;
                } else if (diffMins < 1440) {
                    const hours = Math.floor(diffMins / 60);
                    this.syncTimeText.textContent = `${hours}h ago`;
                } else {
                    const days = Math.floor(diffMins / 1440);
                    this.syncTimeText.textContent = `${days}d ago`;
                }
            } else {
                this.syncTimeText.textContent = 'Never';
            }
        } catch (error) {
            console.error('Error updating sync time:', error);
            this.syncTimeText.textContent = 'Never';
        }
    }

    // Update sync time immediately (call after sync)
    refreshSyncTime() {
        this.updateSyncTime();
    }

    // Cleanup
    destroy() {
        if (this.syncTimeInterval) {
            clearInterval(this.syncTimeInterval);
        }
    }

    // Set callback handlers
    setNotificationHandler(callback) {
        this.onNotificationClick = callback;
    }

    setRefreshHandler(callback) {
        this.onRefreshClick = callback;
    }

    setSettingsHandler(callback) {
        this.onSettingsClick = callback;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderComponent;
}

// Made with Bob
