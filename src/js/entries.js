// Entries Component JavaScript

class EntriesComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.entriesList = null;
        this.entryBadge = null;
        this.storageKey = 'standupnow_entries';
    }

    // Initialize the component
    init() {
        this.loadTemplate();
        this.entriesList = document.getElementById('entriesList');
        this.entryBadge = document.getElementById('entryBadge');
        this.render();
    }

    // Load the HTML template
    loadTemplate() {
        const template = `
            <!-- Recent Entries Component -->
            <section class="recent-entries">
                <div class="section-header">
                    <h2 class="section-title">Recent Entries</h2>
                    <span class="entry-badge" id="entryBadge">0 entries</span>
                </div>

                <!-- Entries List -->
                <div class="entries-list" id="entriesList">
                    <div class="entry-card">
                        <div class="entry-content" style="color: #666;">No entries yet. Start by jotting down your standup notes above!</div>
                    </div>
                </div>
            </section>
        `;
        this.container.innerHTML = template;
    }

    // Load entries from Chrome storage
    loadEntries() {
        // For Chrome extension, we'll use synchronous approach with a callback
        // This is a wrapper to maintain compatibility
        return new Promise((resolve) => {
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get([this.storageKey], (result) => {
                    resolve(result[this.storageKey] || []);
                });
            } else {
                // Fallback to localStorage for testing
                const stored = localStorage.getItem(this.storageKey);
                resolve(stored ? JSON.parse(stored) : []);
            }
        });
    }

    // Save entries to Chrome storage
    saveEntries(entries) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ [this.storageKey]: entries });
        } else {
            // Fallback to localStorage for testing
            localStorage.setItem(this.storageKey, JSON.stringify(entries));
        }
    }

    // Format timestamp
    formatTimestamp(date) {
        const now = new Date();
        const entryDate = new Date(date);
        const isToday = now.toDateString() === entryDate.toDateString();
        
        const timeString = entryDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        if (isToday) {
            return `Today, ${timeString}`;
        } else {
            const dateString = entryDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            return `${dateString}, ${timeString}`;
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Update entry badge count
    updateBadge(count) {
        if (this.entryBadge) {
            this.entryBadge.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
        }
    }

    // Render entries
    async render() {
        const entries = await this.loadEntries();
        
        if (!this.entriesList) return;

        if (entries.length === 0) {
            this.entriesList.innerHTML = '<div class="entry-card"><div class="entry-content" style="color: #666;">No entries yet. Start by jotting down your standup notes above!</div></div>';
            this.updateBadge(0);
            return;
        }
        
        this.entriesList.innerHTML = entries
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(entry => `
                <div class="entry-card" data-id="${entry.id}">
                    <div class="entry-time">${this.formatTimestamp(entry.timestamp)}</div>
                    <div class="entry-content">${this.escapeHtml(entry.content)}</div>
                </div>
            `)
            .join('');
        
        this.updateBadge(entries.length);
    }

    // Add new entry
    async addEntry(content) {
        if (!content.trim()) return false;
        
        const entries = await this.loadEntries();
        const newEntry = {
            id: Date.now().toString(),
            content: content.trim(),
            timestamp: new Date().toISOString()
        };
        
        entries.push(newEntry);
        this.saveEntries(entries);
        await this.render();
        
        // Add animation class to new entry
        setTimeout(() => {
            const newCard = document.querySelector(`[data-id="${newEntry.id}"]`);
            if (newCard) {
                newCard.classList.add('new');
            }
        }, 10);

        return true;
    }

    // Clear all entries
    clearAll() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.remove([this.storageKey]);
        } else {
            localStorage.removeItem(this.storageKey);
        }
        this.render();
    }

    // Get entries count
    async getCount() {
        const entries = await this.loadEntries();
        return entries.length;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EntriesComponent;
}

// Made with Bob
