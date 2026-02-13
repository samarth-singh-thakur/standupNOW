# Demo Mode Guide

## Overview

Demo Mode is a feature that allows you to hide your real data and display demo entries instead. This is perfect for:
- Taking screenshots for presentations
- Recording demos or tutorials
- Sharing your screen without exposing personal data
- Testing the app with realistic data

## How It Works

When you enable Demo Mode:
1. **Your real data is safely backed up** - All your actual entries are stored securely
2. **Demo data is generated** - The system creates realistic demo entries spanning the last 14 days
3. **Visual indicators appear** - A banner shows across all views indicating demo mode is active
4. **All features work normally** - You can interact with the demo data just like real data

When you disable Demo Mode:
1. **Your real data is restored** - All your original entries come back exactly as they were
2. **Demo data is removed** - The generated demo entries are cleared
3. **Everything returns to normal** - The app functions with your actual data

## How to Use

### Enabling Demo Mode

1. Click the **⚙️ Settings** button (gear icon) in any view
2. Scroll down to the **🎭 Demo Mode** section
3. Click the toggle switch to turn it **ON**
4. You'll see a confirmation message and a banner will appear
5. The app will now display demo data instead of your real entries

### Disabling Demo Mode

1. Click the **⚙️ Settings** button again
2. Find the **🎭 Demo Mode** section
3. Click the toggle switch to turn it **OFF**
4. Your real data will be immediately restored
5. The demo mode banner will disappear

## Visual Indicators

When Demo Mode is active, you'll see:
- **Orange banner** at the top of all views stating "🎭 DEMO MODE ACTIVE"
- **Orange toggle** in the settings modal
- **Status text** showing "Demo Mode Active"

## Demo Data Details

The demo mode generates:
- **2-5 entries per day** for the last 14 days
- **Realistic timestamps** between 9 AM and 5 PM
- **Varied activities** including:
  - ✅ Completed tasks and features
  - 🚀 Deployments and releases
  - 🐛 Bug fixes
  - 📝 Documentation updates
  - 🎨 UI/UX improvements
  - ⚡ Performance optimizations
  - 🔧 Refactoring work
  - 🤝 Team collaboration
  - 📊 Analytics implementation
  - 🔐 Security enhancements

## Safety Features

- **Automatic backup**: Your real data is backed up before demo mode activates
- **No data loss**: Your original entries are never deleted or modified
- **Easy restoration**: One click restores everything to normal
- **Persistent across sessions**: Demo mode state is saved even if you close the browser

## Use Cases

### 1. Screenshots for Documentation
Enable demo mode before taking screenshots to show realistic data without exposing your actual work.

### 2. Screen Recordings
Record tutorials or demos with professional-looking sample data.

### 3. Presentations
Present the app to stakeholders or team members without revealing sensitive information.

### 4. Testing
Test features with a full set of realistic data without affecting your real entries.

## Important Notes

- ⚠️ **New entries while in demo mode**: If you create new entries while demo mode is active, they will be added to the demo data and will be lost when you disable demo mode
- 💡 **Best practice**: Disable demo mode before creating any real entries
- 🔄 **Switching modes**: You can toggle demo mode on and off as many times as needed
- 📱 **Works everywhere**: Demo mode affects all views (popup, full view, timer-end)

## Troubleshooting

### Demo mode won't enable
- Make sure you have the latest version of the extension
- Try refreshing the page
- Check the browser console for any errors

### Real data not restored
- Your data is safely backed up in Chrome storage
- Try toggling demo mode off again
- If issues persist, your data is stored under the key `realEntriesBackup`

### Demo data looks wrong
- Demo data is randomly generated each time you enable demo mode
- Disable and re-enable demo mode to get a fresh set of demo entries

## Technical Details

For developers:
- Demo mode state is stored in `chrome.storage.local` under the key `demoModeEnabled`
- Real data backup is stored under `realEntriesBackup`
- Demo data generation is handled by `src/js/demo-mode.js`
- The system generates entries with realistic timestamps and varied content

## Support

If you encounter any issues with demo mode:
1. Check this guide for common solutions
2. Try disabling and re-enabling demo mode
3. Refresh the extension
4. Check the browser console for error messages

---

**Remember**: Your real data is always safe! Demo mode is designed to be completely reversible with no risk to your actual entries.