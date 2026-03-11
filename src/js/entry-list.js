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

        // Create EntryItem components and render them
        const entriesHTML = sortedEntries
            .map(entryData => {
                const entryItem = new EntryItemComponent(entryData);
                return entryItem.render();
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
