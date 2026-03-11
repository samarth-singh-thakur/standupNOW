// Header Component JavaScript

class HeaderComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.notificationBtn = null;
        this.refreshBtn = null;
        this.settingsBtn = null;
        this.onNotificationClick = null;
        this.onRefreshClick = null;
        this.onSettingsClick = null;
    }

    // Initialize the component
    init() {
        this.loadTemplate();
        this.cacheElements();
        this.setupEventListeners();
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
                    <button class="icon-btn" id="refreshBtn" aria-label="Refresh">
                        <img src="src/assets/icons/refresh-cw.svg" alt="Refresh" class="icon">
                    </button>
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
