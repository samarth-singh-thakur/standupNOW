// Quick Jot Down Component JavaScript

class QuickJotComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.input = null;
        this.saveBtn = null;
        this.draftKey = 'standupnow_draft';
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
    submit() {
        const content = this.getValue();
        if (content.trim() && this.onSubmitCallback) {
            const success = this.onSubmitCallback(content);
            if (success) {
                this.clear();
                this.clearDraft();
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
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickJotComponent;
}

// Made with Bob
