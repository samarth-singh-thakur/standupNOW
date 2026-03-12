// Entry Item Component JavaScript

class EntryItemComponent {
    constructor(data) {
        this.id = data.id;
        this.note = data.note;
        this.time = data.time;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.version = data.version;
        this.deleted = data.deleted;
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

    // Render the component and return HTML string
    render() {
        const formattedTime = this.formatTimestamp(this.time);
        const escapedContent = this.escapeHtml(this.note);
        
        return `
            <div class="entry-card" data-id="${this.id}">
                <div class="entry-time">${formattedTime}</div>
                <div class="entry-content">${escapedContent}</div>
            </div>
        `;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EntryItemComponent;
}

// Made with Bob
