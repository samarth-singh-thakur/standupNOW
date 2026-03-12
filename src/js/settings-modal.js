// Settings Modal Component
class SettingsModalComponent {
    constructor() {
        this.overlay = null;
        this.closeBtn = null;
        this.cancelBtn = null;
        this.saveBtn = null;
        this.clearAllBtn = null;
        this.customTimerToggle = null;
        this.customTimerInputs = null;
        this.timerPreview = null;
        this.presetButtons = [];
        this.timerDays = null;
        this.timerHours = null;
        this.timerMinutes = null;
        this.currentTimerMinutes = 60; // Default 1 hour
        this.isCustom = false;
        this.storageKey = 'standupnow_timer_config';
        this.entriesKey = 'standupnow_entries';
    }

    // Initialize the component
    async init() {
        await this.loadTemplate();
        this.setupElements();
        await this.loadSettings();
        this.setupEventListeners();
    }

    // Load the HTML template
    async loadTemplate() {
        try {
            const response = await fetch('src/components/settings-modal.html');
            const html = await response.text();
            
            // Create a container for the modal if it doesn't exist
            let container = document.getElementById('settingsModalContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'settingsModalContainer';
                document.body.appendChild(container);
            }
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading settings modal template:', error);
        }
    }

    // Setup DOM elements
    setupElements() {
        this.overlay = document.getElementById('settingsModalOverlay');
        this.closeBtn = document.getElementById('settingsModalClose');
        this.cancelBtn = document.getElementById('settingsCancelBtn');
        this.saveBtn = document.getElementById('settingsSaveBtn');
        this.clearAllBtn = document.getElementById('clearAllEntriesBtn');
        this.customTimerToggle = document.getElementById('customTimerToggle');
        this.customTimerInputs = document.getElementById('customTimerInputs');
        this.timerPreview = document.getElementById('timerPreview');
        this.presetButtons = document.querySelectorAll('.preset-btn');
        this.timerDays = document.getElementById('timerDays');
        this.timerHours = document.getElementById('timerHours');
        this.timerMinutes = document.getElementById('timerMinutes');
    }

    // Load settings from storage
    async loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.storageKey], (result) => {
                const config = result[this.storageKey] || { timerMinutes: 60, isCustom: false };
                this.currentTimerMinutes = config.timerMinutes;
                this.isCustom = config.isCustom;
                
                // Update UI
                this.updatePresetButtons();
                this.updateCustomInputs();
                this.updateTimerPreview();
                
                resolve();
            });
        });
    }

    // Save settings to storage
    async saveSettings() {
        const config = {
            timerMinutes: this.currentTimerMinutes,
            isCustom: this.isCustom
        };
        
        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.storageKey]: config }, () => {
                resolve();
            });
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Close modal
        this.closeBtn?.addEventListener('click', () => this.hide());
        this.cancelBtn?.addEventListener('click', () => this.hide());
        
        // Click outside to close
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // Preset buttons
        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const minutes = parseInt(btn.dataset.minutes);
                this.setTimerMinutes(minutes, false);
            });
        });

        // Custom timer toggle
        this.customTimerToggle?.addEventListener('change', (e) => {
            this.isCustom = e.target.checked;
            this.customTimerInputs.style.display = this.isCustom ? 'flex' : 'none';
            
            if (this.isCustom) {
                this.updatePresetButtons(true); // Deactivate all presets
                this.calculateCustomTimer();
            } else {
                // Default to 1 hour if unchecking custom
                this.setTimerMinutes(60, false);
            }
        });

        // Custom timer inputs
        [this.timerDays, this.timerHours, this.timerMinutes].forEach(input => {
            input?.addEventListener('input', () => {
                this.calculateCustomTimer();
            });
        });

        // Save button
        this.saveBtn?.addEventListener('click', async () => {
            await this.saveSettings();
            
            // Notify background to update timer
            chrome.runtime.sendMessage({
                type: 'UPDATE_TIMER_INTERVAL',
                timerMinutes: this.currentTimerMinutes
            }).catch(error => {
                console.log('Timer interval update message sent:', error);
            });
            
            this.showSaveSuccess();
            setTimeout(() => this.hide(), 1500);
        });

        // Clear all entries
        this.clearAllBtn?.addEventListener('click', () => {
            this.confirmClearAll();
        });
    }

    // Set timer minutes
    setTimerMinutes(minutes, isCustom = false) {
        this.currentTimerMinutes = minutes;
        this.isCustom = isCustom;
        this.customTimerToggle.checked = isCustom;
        this.customTimerInputs.style.display = isCustom ? 'flex' : 'none';
        this.updatePresetButtons();
        this.updateCustomInputs();
        this.updateTimerPreview();
    }

    // Update preset button states
    updatePresetButtons(deactivateAll = false) {
        this.presetButtons.forEach(btn => {
            const minutes = parseInt(btn.dataset.minutes);
            if (deactivateAll) {
                btn.classList.remove('active');
            } else {
                btn.classList.toggle('active', minutes === this.currentTimerMinutes && !this.isCustom);
            }
        });
    }

    // Update custom inputs based on current timer
    updateCustomInputs() {
        if (this.isCustom) {
            const days = Math.floor(this.currentTimerMinutes / 1440);
            const hours = Math.floor((this.currentTimerMinutes % 1440) / 60);
            const minutes = this.currentTimerMinutes % 60;
            
            this.timerDays.value = days;
            this.timerHours.value = hours;
            this.timerMinutes.value = minutes;
        }
    }

    // Calculate custom timer from inputs
    calculateCustomTimer() {
        const days = parseInt(this.timerDays.value) || 0;
        const hours = parseInt(this.timerHours.value) || 0;
        const minutes = parseInt(this.timerMinutes.value) || 0;
        
        // Calculate total minutes
        const totalMinutes = (days * 1440) + (hours * 60) + minutes;
        
        // Ensure at least 1 minute
        this.currentTimerMinutes = Math.max(1, totalMinutes);
        
        // Update preview
        this.updateTimerPreview();
    }

    // Update timer preview text
    updateTimerPreview() {
        const formatted = this.formatTimerDuration(this.currentTimerMinutes);
        this.timerPreview.innerHTML = `Current interval: <strong>${formatted}</strong>`;
    }

    // Format timer duration for display
    formatTimerDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (minutes < 1440) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            if (mins === 0) {
                return `${hours} hour${hours !== 1 ? 's' : ''}`;
            }
            return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min`;
        } else {
            const days = Math.floor(minutes / 1440);
            const hours = Math.floor((minutes % 1440) / 60);
            const mins = minutes % 60;
            
            let result = `${days} day${days !== 1 ? 's' : ''}`;
            if (hours > 0) result += ` ${hours} hour${hours !== 1 ? 's' : ''}`;
            if (mins > 0) result += ` ${mins} min`;
            return result;
        }
    }

    // Show save success feedback
    showSaveSuccess() {
        const originalText = this.saveBtn.innerHTML;
        this.saveBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="9" r="8" fill="currentColor"/>
                <path d="M5 9L8 12L13 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Saved!
        `;
        this.saveBtn.disabled = true;
        
        setTimeout(() => {
            this.saveBtn.innerHTML = originalText;
            this.saveBtn.disabled = false;
        }, 1500);
    }

    // Confirm clear all entries
    confirmClearAll() {
        const confirmed = confirm(
            'Are you sure you want to clear all entries?\n\n' +
            'This action cannot be undone and will delete all your standup notes.'
        );
        
        if (confirmed) {
            this.clearAllEntries();
        }
    }

    // Clear all entries
    clearAllEntries() {
        chrome.storage.local.remove([this.entriesKey], () => {
            alert('All entries have been cleared.');
            
            // Dispatch event to refresh entries list
            window.dispatchEvent(new CustomEvent('entriesCleared'));
            
            // Reset timer
            chrome.runtime.sendMessage({
                type: 'RESET_TIMER',
                entryTime: new Date().toISOString()
            }).catch(error => {
                console.log('Timer reset message sent:', error);
            });
        });
    }

    // Show modal
    show() {
        if (this.overlay) {
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    // Hide modal
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsModalComponent;
}

// Made with Bob