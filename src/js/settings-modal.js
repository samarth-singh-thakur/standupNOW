// Settings Modal Component
class SettingsModalComponent {
    constructor() {
        this.overlay = null;
        this.closeBtn = null;
        this.clearAllBtn = null;
        this.exportBtn = null;
        this.importBtn = null;
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
        this.saveTimeout = null; // For debouncing auto-save
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
        this.clearAllBtn = document.getElementById('clearAllEntriesBtn');
        this.exportBtn = document.getElementById('exportEntriesBtn');
        this.importBtn = document.getElementById('importEntriesBtn');
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
        
        // Click outside to close
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });

        // Preset buttons - auto-save on click
        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                const minutes = parseInt(btn.dataset.minutes);
                this.setTimerMinutes(minutes, false);
                await this.autoSaveSettings();
            });
        });

        // Custom timer toggle - auto-save on change
        this.customTimerToggle?.addEventListener('change', async (e) => {
            this.isCustom = e.target.checked;
            this.customTimerInputs.style.display = this.isCustom ? 'flex' : 'none';
            
            if (this.isCustom) {
                this.updatePresetButtons(true); // Deactivate all presets
                this.calculateCustomTimer();
            } else {
                // Default to 1 hour if unchecking custom
                this.setTimerMinutes(60, false);
            }
            await this.autoSaveSettings();
        });

        // Custom timer inputs - auto-save on input with debounce
        [this.timerDays, this.timerHours, this.timerMinutes].forEach(input => {
            input?.addEventListener('input', () => {
                this.calculateCustomTimer();
                this.debouncedAutoSave();
            });
        });

        // Export entries
        this.exportBtn?.addEventListener('click', () => {
            this.exportEntries();
        });

        // Import entries
        this.importBtn?.addEventListener('click', () => {
            this.importEntries();
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

    // Auto-save settings (immediate)
    async autoSaveSettings() {
        await this.saveSettings();
        
        // Notify background to update timer
        chrome.runtime.sendMessage({
            type: 'UPDATE_TIMER_INTERVAL',
            timerMinutes: this.currentTimerMinutes
        }).catch(error => {
            console.log('Timer interval update message sent:', error);
        });
    }

    // Debounced auto-save for input fields
    debouncedAutoSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.saveTimeout = setTimeout(async () => {
            await this.autoSaveSettings();
        }, 500); // 500ms debounce
    }

    // Export entries to JSON file
    exportEntries() {
        chrome.storage.local.get([this.entriesKey], (result) => {
            const entries = result[this.entriesKey] || [];
            
            if (entries.length === 0) {
                alert('No entries to export.');
                return;
            }
            
            // Create JSON blob
            const dataStr = JSON.stringify(entries, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Create download link
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            
            // Generate filename with current date
            const date = new Date().toISOString().split('T')[0];
            link.download = `standupnow-entries-${date}.json`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(url);
        });
    }

    // Import entries from JSON file
    importEntries() {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedEntries = JSON.parse(event.target.result);
                    
                    // Validate entries format
                    if (!Array.isArray(importedEntries)) {
                        alert('Invalid file format. Expected an array of entries.');
                        return;
                    }
                    
                    // Get existing entries
                    chrome.storage.local.get([this.entriesKey], (result) => {
                        const existingEntries = result[this.entriesKey] || [];
                        
                        // Merge entries (avoid duplicates by ID)
                        const existingIds = new Set(existingEntries.map(e => e.id));
                        const newEntries = importedEntries.filter(e => !existingIds.has(e.id));
                        
                        const mergedEntries = [...existingEntries, ...newEntries];
                        
                        // Sort by timestamp (newest first)
                        mergedEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                        
                        // Save merged entries
                        chrome.storage.local.set({ [this.entriesKey]: mergedEntries }, () => {
                            alert(`Successfully imported ${newEntries.length} new entries.`);
                            
                            // Dispatch event to refresh entries list
                            window.dispatchEvent(new CustomEvent('entriesUpdated'));
                        });
                    });
                } catch (error) {
                    console.error('Error parsing import file:', error);
                    alert('Error reading file. Please ensure it is a valid JSON file.');
                }
            };
            
            reader.readAsText(file);
        };
        
        // Trigger file selection
        input.click();
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