# StandupNow

A Chrome extension that prompts you every hour to log what you did in the last hour, helping you track your daily progress and maintain productivity.

## Features

- ⏰ Hourly reminders to log your activities
- 📝 Simple and intuitive logging interface
- 📊 Full-view dashboard to review your daily entries
- 🔔 Browser notifications for check-in reminders
- 💤 Snooze functionality for flexible scheduling
- 📋 Copy entries to clipboard for easy sharing
- 🎨 Clean, modern dark-themed UI

## Installation

### From Source

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `standupNOW` directory
5. The extension icon should appear in your browser toolbar

## Usage

1. **Automatic Reminders**: The extension will notify you every hour to log your activities
2. **Quick Check-in**: Click the extension icon to open the check-in popup
3. **Log Your Work**: Enter what you accomplished in the last hour
4. **Review History**: Click "View Full History" to see all your entries
5. **Snooze**: Use the snooze button if you need to postpone a check-in

## Project Structure

```
standupNOW/
├── src/
│   ├── js/              # JavaScript files
│   │   ├── background.js    # Service worker for alarms and notifications
│   │   ├── checkin.js       # Check-in popup logic
│   │   └── fullview.js      # Full history view logic
│   ├── html/            # HTML pages
│   │   ├── checkin.html     # Check-in popup interface
│   │   └── fullview.html    # Full history view
│   ├── css/             # CSS stylesheets (if separated)
│   └── assets/          # Additional assets
├── images/              # Extension icons and images
│   └── icon.png
├── manifest.json        # Extension manifest
├── LICENSE              # License file
└── README.md           # This file
```

## Development

### Prerequisites

- Google Chrome or Chromium-based browser
- Basic knowledge of Chrome Extension APIs

### Making Changes

1. Edit the source files in the `src/` directory
2. Reload the extension in `chrome://extensions/` to see changes
3. Check the browser console for any errors

## Permissions

This extension requires the following permissions:

- `alarms`: To schedule hourly check-in reminders
- `notifications`: To display check-in notifications
- `storage`: To save your logged entries
- `tabs`: To open the full-view page

## License

See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have suggestions, please open an issue on the repository.