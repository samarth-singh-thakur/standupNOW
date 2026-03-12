// Quick Jot Down Component JavaScript

class QuickJotComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.input = null;
        this.saveBtn = null;
        this.draftKey = 'standupnow_draft';
        this.storageKey = 'standupnow_entries';
        this.onSubmitCallback = null;
    }

    // Initialize the component
    init() {
        this.loadTemplate();
        this.input = document.getElementById('quickJotInput');
        this.saveBtn = document.getElementById('saveBtn');
        this.setupEventListeners();
        this.loadDraft();
        this.updateSaveButtonVisibility();
        this.updatePlaceholder();
        this.input.focus();
    }

    // Load the HTML template
    loadTemplate() {
        const template = `
            <!-- Quick Jot Down Component -->
            <section class="quick-jot">
                <div class="quick-jot-header">
                    <label for="quickJotInput" class="section-label">Quick Jot Down</label>
                    <button id="saveBtn" class="icon-btn save-btn" style="display: none;" title="Save entry (Enter)">
                        <img src="src/assets/icons/save.svg" alt="Save" class="icon">
                    </button>
                </div>
                <textarea
                    id="quickJotInput"
                    class="jot-input"
                    placeholder="Type your standup notes here..."
                    rows="4"
                ></textarea>
            </section>
        `;
        this.container.innerHTML = template;
    }

    // Setup event listeners
    setupEventListeners() {
        if (!this.input) return;

        // Handle Enter key (Shift+Enter for new line, Enter to submit)
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.submit();
            }
        });

        // Auto-save draft and update save button visibility
        let draftTimeout;
        this.input.addEventListener('input', () => {
            this.updateSaveButtonVisibility();
            clearTimeout(draftTimeout);
            draftTimeout = setTimeout(() => {
                this.saveDraft();
            }, 500);
        });

        // Save button click handler
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => {
                this.submit();
            });
        }
    }

    // Set callback for when entry is submitted
    onSubmit(callback) {
        this.onSubmitCallback = callback;
    }

    // Submit the entry
    async submit() {
        const content = this.getValue();
        if (content.trim() && this.onSubmitCallback) {
            const success = await this.onSubmitCallback(content);
            if (success) {
                this.clear();
                this.clearDraft();
                // Update placeholder after new entry
                setTimeout(() => this.updatePlaceholder(), 100);
            }
        }
    }

    // Get current input value
    getValue() {
        return this.input ? this.input.value : '';
    }

    // Clear the input
    clear() {
        if (this.input) {
            this.input.value = '';
            this.updateSaveButtonVisibility();
        }
    }

    // Save draft to Chrome storage
    saveDraft() {
        const value = this.getValue();
        if (value.trim()) {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.set({ [this.draftKey]: value });
            } else {
                localStorage.setItem(this.draftKey, value);
            }
        } else {
            this.clearDraft();
        }
    }

    // Load draft from Chrome storage
    loadDraft() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get([this.draftKey], (result) => {
                const draft = result[this.draftKey];
                if (draft && this.input) {
                    this.input.value = draft;
                    this.updateSaveButtonVisibility();
                }
            });
        } else {
            const draft = localStorage.getItem(this.draftKey);
            if (draft && this.input) {
                this.input.value = draft;
                this.updateSaveButtonVisibility();
            }
        }
    }

    // Clear draft from Chrome storage
    clearDraft() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.remove([this.draftKey]);
        } else {
            localStorage.removeItem(this.draftKey);
        }
    }

    // Focus on input
    focus() {
        if (this.input) {
            this.input.focus();
        }
    }

    // Update save button visibility based on input content
    updateSaveButtonVisibility() {
        if (!this.saveBtn) return;
        
        const hasText = this.getValue().trim().length > 0;
        this.saveBtn.style.display = hasText ? 'flex' : 'none';
    }

    // Calculate time elapsed since last entry
    formatTimeSince(timestamp) {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            const remainingHours = hours % 24;
            if (remainingHours > 0) {
                return `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
            }
            return `${days} day${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            const remainingMinutes = minutes % 60;
            if (remainingMinutes > 0) {
                return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
            }
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `${minutes} min`;
        } else {
            return 'a few seconds';
        }
    }

    // Update placeholder text based on last entry
    async updatePlaceholder() {
        if (!this.input) return;

        // Load entries
        let entries = [];
        if (typeof chrome !== 'undefined' && chrome.storage) {
            const result = await new Promise(resolve => {
                chrome.storage.local.get([this.storageKey], (result) => {
                    resolve(result[this.storageKey] || []);
                });
            });
            entries = result;
        } else {
            const stored = localStorage.getItem(this.storageKey);
            entries = stored ? JSON.parse(stored) : [];
        }

        if (entries.length === 0) {
            this.input.placeholder = 'Type your standup notes here...';
            return;
        }

        // Filter out deleted entries and get the most recent entry
        const activeEntries = entries.filter(entry => !entry.deleted);
        const sortedEntries = activeEntries.sort((a, b) => new Date(b.time) - new Date(a.time));
        const lastEntry = sortedEntries[0];
        const timeSince = this.formatTimeSince(lastEntry.time);

        // Set empty placeholder to trigger :placeholder-shown
        this.input.placeholder = ' ';
        
        // Create or update custom placeholder element
        let customPlaceholder = this.container.querySelector('.custom-placeholder');
        if (!customPlaceholder) {
            customPlaceholder = document.createElement('div');
            customPlaceholder.className = 'custom-placeholder';
            this.input.parentElement.appendChild(customPlaceholder);
            
            // Hide custom placeholder when user types
            this.input.addEventListener('input', () => {
                if (this.input.value.trim()) {
                    customPlaceholder.style.display = 'none';
                } else {
                    customPlaceholder.style.display = 'block';
                }
            });
            
            // Hide on focus if there's content
            this.input.addEventListener('focus', () => {
                if (this.input.value.trim()) {
                    customPlaceholder.style.display = 'none';
                }
            });
            
            // Show on blur if empty
            this.input.addEventListener('blur', () => {
                if (!this.input.value.trim()) {
                    customPlaceholder.style.display = 'block';
                }
            });
        }
        
        // Set the styled placeholder content
        customPlaceholder.innerHTML = `<span class="time-part">${timeSince}</span> have passed - what's new?`;
        
        // Show placeholder if input is empty
        customPlaceholder.style.display = this.input.value.trim() ? 'none' : 'block';
        
        // Mark input for CSS targeting
        this.input.setAttribute('data-placeholder-time', 'true');
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickJotComponent;
}

// Made with Bob
