// Entry List Component JavaScript

class EntryListComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.listElement = null;
        this.entries = [];
    }

    // Initialize the component
    init() {
        this.loadTemplate();
        this.listElement = document.getElementById('entriesList');
    }

    // Load the HTML template
    loadTemplate() {
        const template = `
            <!-- Entry List Component Container -->
            <div class="entries-list" id="entriesList">
                <!-- Entry items will be dynamically inserted here -->
            </div>
        `;
        this.container.innerHTML = template;
    }

    // Set entries data
    setEntries(entries) {
        this.entries = entries;
        this.render();
    }

    // Calculate time elapsed between two timestamps
    calculateTimeElapsed(newerTimestamp, olderTimestamp) {
        const diff = new Date(newerTimestamp) - new Date(olderTimestamp);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        // Only show if within 0min to 1d2h range (max 26 hours)
        if (minutes < 0 || hours > 26) {
            return null;
        }

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
            return '0m';
        }
    }

    // Render the list
    render() {
        if (!this.listElement) return;

        if (this.entries.length === 0) {
            this.listElement.innerHTML = `
                <div class="entry-card">
                    <div class="entry-content" style="color: #666;">
                        No entries yet. Start by jotting down your standup notes above!
                    </div>
                </div>
            `;
            return;
        }

        // Sort entries by timestamp (newest first)
        const sortedEntries = [...this.entries].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        // Create EntryItem components and render them with timeline
        const entriesHTML = sortedEntries
            .map((entryData, index) => {
                const entryItem = new EntryItemComponent(entryData);
                let html = entryItem.render();
                
                // Add timeline connector between entries (except after last entry)
                if (index < sortedEntries.length - 1) {
                    const nextEntry = sortedEntries[index + 1];
                    const timeElapsed = this.calculateTimeElapsed(entryData.timestamp, nextEntry.timestamp);
                    
                    if (timeElapsed) {
                        html += `
                            <div class="timeline-connector">
                                <div class="timeline-line"></div>
                                <div class="timeline-time">+${timeElapsed}</div>
                            </div>
                        `;
                    }
                }
                
                return html;
            })
            .join('');

        this.listElement.innerHTML = entriesHTML;

        // Add animation to newest entry
        setTimeout(() => {
            const firstCard = this.listElement.querySelector('.entry-card');
            if (firstCard && sortedEntries.length > 0) {
                firstCard.classList.add('new');
            }
        }, 10);
    }

    // Clear all entries
    clear() {
        this.entries = [];
        this.render();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EntryListComponent;
}

// Made with Bob
