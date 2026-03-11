# StandupNOW - Chrome Extension

A quick and efficient Chrome extension for jotting down your daily standup notes. Keep track of your updates with a sleek, minimalist interface.

## Features

- 📝 Quick note-taking interface
- 💾 Automatic draft saving
- 📅 Timestamped entries
- 🎨 Clean, dark-themed UI
- ⚡ Fast and lightweight
- 🔒 Data stored locally in Chrome storage

## Installation

### Install from Source

1. **Download or Clone the Repository**
   ```bash
   git clone <repository-url>
   cd standupNOW
   ```

2. **Open Chrome Extensions Page**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Or click the three-dot menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `standupNOW` folder (the root directory containing `manifest.json`)

5. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "StandupNOW" and click the pin icon

## Usage

1. **Open the Extension**
   - Click the StandupNOW icon in your Chrome toolbar

2. **Add a Note**
   - Type your standup notes in the text area
   - Press `Enter` to save (or `Shift+Enter` for new line)
   - Click the save icon to submit

3. **View Entries**
   - All entries are displayed below with timestamps
   - Entries are sorted by most recent first

4. **Manage Entries**
   - Click the refresh icon to reload entries
   - Click the settings icon to clear all entries
   - Notifications feature coming soon!

## Keyboard Shortcuts

- `Enter` - Save entry
- `Shift+Enter` - New line in text area

## Data Storage

All data is stored locally using Chrome's storage API. Your notes are:
- Stored securely in your browser
- Never sent to external servers
- Synced across your Chrome profile (if sync is enabled)

## Development

### Project Structure

```
standupNOW/
├── manifest.json           # Extension configuration
├── index.html             # Main popup HTML
├── src/
│   ├── assets/
│   │   └── icons/         # Extension and UI icons
│   ├── components/        # HTML component templates
│   ├── css/
│   │   └── styles.css     # All styles
│   └── js/
│       ├── extension.js   # Main app logic
│       ├── entries.js     # Entries component
│       └── quick-jot.js   # Quick jot component
└── README.md
```

### Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Chrome Extension Manifest V3
- Chrome Storage API

## Browser Compatibility

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue in the repository.

---

Made with ❤️ for productive standups