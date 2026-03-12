// Entries Component JavaScript

class EntriesComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.entriesList = null;
        this.entryBadge = null;
        this.storageKey = 'standupnow_entries';
        this.currentFilter = 'today'; // Default filter
    }

    // Initialize the component
    init() {
        this.loadTemplate();
        this.entriesList = document.getElementById('entriesList');
        this.entryBadge = document.getElementById('entryBadge');
        this.setupFilterButtons();
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

                <!-- Filter Buttons -->
                <div class="filter-controls">
                    <div class="filter-buttons">
                        <button class="filter-btn" data-filter="all">All</button>
                        <button class="filter-btn active" data-filter="today">Today</button>
                        <button class="filter-btn" data-filter="yesterday">Yesterday</button>
                    </div>
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

    // Generate UUID v4
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
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

    // Setup filter button event listeners
    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                // Update filter and re-render
                this.currentFilter = btn.dataset.filter;
                this.render();
            });
        });
    }

    // Filter entries by date
    filterEntriesByDate(entries, filter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Filter out deleted entries
        const activeEntries = entries.filter(entry => !entry.deleted);
        
        switch (filter) {
            case 'today':
                return activeEntries.filter(entry => {
                    const entryDate = new Date(entry.time);
                    return entryDate >= today;
                });
            case 'yesterday':
                return activeEntries.filter(entry => {
                    const entryDate = new Date(entry.time);
                    return entryDate >= yesterday && entryDate < today;
                });
            case 'all':
            default:
                return activeEntries;
        }
    }

    // Update entry badge count
    updateBadge(count) {
        if (this.entryBadge) {
            this.entryBadge.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
        }
    }

    // Calculate time elapsed between two timestamps
    calculateTimeElapsed(newerTimestamp, olderTimestamp) {
        const diff = new Date(newerTimestamp) - new Date(olderTimestamp);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);

        // Don't show if negative time
        if (minutes < 0) {
            return null;
        }

        // For very long periods (> 60 days), show months
        if (months > 2) {
            return `${months}mo`;
        }
        
        // For periods > 14 days, show weeks
        if (weeks > 2) {
            const remainingDays = days % 7;
            if (remainingDays > 0) {
                return `${weeks}w${remainingDays}d`;
            }
            return `${weeks}w`;
        }
        
        // For periods with days
        if (days > 0) {
            const remainingHours = hours % 24;
            if (remainingHours > 0) {
                return `${days}d${remainingHours}h`;
            }
            return `${days}d`;
        } else if (hours > 0) {
            const remainingMinutes = minutes % 60;
            if (remainingMinutes > 0) {
                return `${hours}h${remainingMinutes}m`;
            }
            return `${hours}h`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return null;
        }
    }

    // Render entries
    async render() {
        let entries = await this.loadEntries();
        
        if (!this.entriesList) return;

        // Apply filter
        const filteredEntries = this.filterEntriesByDate(entries, this.currentFilter);

        if (filteredEntries.length === 0) {
            const emptyMessage = this.currentFilter === 'today'
                ? 'No entries today yet. Start by jotting down your standup notes above!'
                : this.currentFilter === 'yesterday'
                ? 'No entries from yesterday.'
                : 'No entries yet. Start by jotting down your standup notes above!';
            
            this.entriesList.innerHTML = `<div class="entry-card"><div class="entry-content" style="color: #666;">${emptyMessage}</div></div>`;
            this.updateBadge(0);
            return;
        }
        
        // Sort filtered entries
        const sortedEntries = filteredEntries.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        // Render entries with timeline connectors
        const entriesHTML = sortedEntries
            .map((entry, index) => {
                let html = `
                    <div class="entry-card entry-fade-in" data-id="${entry.id}">
                        <div class="entry-time">${this.formatTimestamp(entry.time)}</div>
                        <div class="entry-content">${this.escapeHtml(entry.note)}</div>
                    </div>
                `;
                
                // Add timeline connector between entries (except after last entry)
                if (index < sortedEntries.length - 1) {
                    const nextEntry = sortedEntries[index + 1];
                    const timeElapsed = this.calculateTimeElapsed(entry.time, nextEntry.time);
                    
                    if (timeElapsed) {
                        html += `
                            <div class="timeline-connector">
                            
                                <div class="timeline-time">+${timeElapsed}</div>
                            </div>
                        `;
                    }
                }
                
                return html;
            })
            .join('');
        
        this.entriesList.innerHTML = entriesHTML;
        this.updateBadge(filteredEntries.length);
    }

    // Add new entry
    async addEntry(content) {
        if (!content.trim()) return false;
        
        const entries = await this.loadEntries();
        const now = new Date().toISOString();
        const newEntry = {
            id: this.generateUUID(),
            time: now,
            note: content.trim(),
            createdAt: now,
            updatedAt: now,
            version: 1,
            deleted: false
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
