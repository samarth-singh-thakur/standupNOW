# Timer-End Functionality Documentation

## Overview
The StandupNOW extension now includes a customizable timer that automatically opens a response page when it's time for your next standup update. This ensures you never miss documenting your work progress.

## Features

### 1. **Customizable Timer Intervals**
- **Quick Presets**: 15 min, 30 min, 1 hour, 2 hours
- **Custom Intervals**: Set any interval from 1 minute to 1 day
  - Days: 0-365
  - Hours: 0-23
  - Minutes: 1-59
- Default interval: 1 hour (60 minutes)

### 2. **Automatic Timer Management**
- Timer starts from the most recent entry (either from extension or phone sync)
- Automatically resets when you add a new entry
- Persists across browser restarts
- Runs in the background using Chrome's alarm API

### 3. **Smart Tab Management**
- Opens timer-end page in a new tab when timer expires
- If the timer-end tab is already open, it focuses that tab instead
- **No duplicate tabs** - only one timer-end tab at a time

### 4. **Response UI Features**
- Beautiful, user-friendly interface
- Shows last entry time and elapsed time
- Quick entry form to add your update
- **Submit & Reset Timer** - Adds entry and resets the timer
- **Snooze (15 min)** - Delays the timer by 15 minutes
- **Dismiss** - Closes the tab without action
- Displays recent entries for context
- Auto-closes after successful submission

### 5. **Phone Sync Integration**
- Timer automatically resets when new entries arrive from phone
- Uses the most recent entry time (whether from extension or phone)
- Ensures accurate timing across devices

## How to Use

### Setting Up Timer Interval

1. **Open Settings**
   - Click the settings icon (⚙️) in the extension header
   - Settings modal will open

2. **Choose Timer Interval**
   - **Quick Presets**: Click on 15 min, 30 min, 1 hour, or 2 hours
   - **Custom Interval**: 
     - Check "Custom interval" checkbox
     - Enter days, hours, and minutes
     - Preview shows total interval

3. **Save Settings**
   - Click "Save Settings" button
   - Timer will immediately update with new interval
   - Existing timer will be recalculated based on last entry

### Using the Timer-End Page

When the timer expires:

1. **Timer-End Page Opens**
   - Shows time since last entry
   - Displays recent entries for context

2. **Add Your Update**
   - Type your standup update in the text area
   - Click "Submit & Reset Timer" to:
     - Save the entry
     - Reset timer to your configured interval
     - Close the tab automatically

3. **Alternative Actions**
   - **Snooze (15 min)**: Postpone reminder for 15 minutes
   - **Dismiss**: Close without adding entry (timer continues)

## How It Works

### Timer Lifecycle

1. **Initialization**
   - On extension install/startup, timer checks for existing entries
   - Sets timer based on most recent entry time
   - If no entries exist, starts from current time

2. **Adding Entries**
   - When you add an entry via the extension, timer resets
   - When phone sync brings new entries, timer resets to latest entry
   - Timer uses your configured interval (default: 1 hour)

3. **Timer Expiration**
   - After configured interval, Chrome alarm fires
   - Background service worker opens/focuses timer-end.html
   - User can submit update, snooze, or dismiss

4. **Timer Reset**
   - Submitting an entry resets timer to configured interval
   - Snoozing sets timer to fire in 15 minutes
   - Dismissing closes tab but doesn't reset timer

## Settings Features

### Timer Settings
- Quick preset buttons for common intervals
- Custom interval with days, hours, minutes
- Real-time preview of selected interval
- Instant application of new settings

### Data Management
- Clear all entries option
- Confirmation dialog to prevent accidental deletion
- Resets timer when entries are cleared

## Testing the Timer

### Quick Test (For Development)

To test without waiting long periods:

1. Open Settings (⚙️ icon)
2. Check "Custom interval"
3. Set to 1 minute (0 days, 0 hours, 1 minute)
4. Click "Save Settings"
5. Add a test entry
6. Wait 1 minute - timer-end page should open

**Remember to set it back to your preferred interval!**

### Full Test Procedure

1. **Load the Extension**
   ```
   - Open Chrome
   - Go to chrome://extensions/
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory
   ```

2. **Configure Timer**
   ```
   - Open extension popup
   - Click settings icon
   - Choose your preferred interval (e.g., 15 min for testing)
   - Save settings
   ```

3. **Test Initial Timer**
   ```
   - Add a test entry: "Testing timer functionality"
   - Close the popup
   - Wait for configured interval
   - Timer-end page should open automatically
   ```

4. **Test Submit & Reset**
   ```
   - When timer-end page opens, enter an update
   - Click "Submit & Reset Timer"
   - Entry should be added
   - Timer should reset to configured interval
   - Tab should close after 2 seconds
   ```

5. **Test Snooze**
   ```
   - When timer-end page opens, click "Snooze (15 min)"
   - Tab should close
   - Timer should fire again in 15 minutes
   ```

6. **Test Custom Interval**
   ```
   - Open settings
   - Enable custom interval
   - Set to 2 days, 3 hours, 30 minutes
   - Preview should show "2 days 3 hours 30 min"
   - Save and verify timer updates
   ```

7. **Test Duplicate Tab Prevention**
   ```
   - Manually open timer-end.html in a tab
   - Wait for timer to fire (or trigger manually)
   - Extension should focus existing tab, not create new one
   ```

8. **Test Phone Sync Integration**
   ```
   - Add an entry from your phone app
   - Sync with extension
   - Timer should reset based on phone entry time
   - Check console logs for "Timer reset for phone entry"
   ```

9. **Test Browser Restart**
   ```
   - Set timer to 5 minutes
   - Add an entry
   - Close Chrome completely
   - Reopen Chrome after 3 minutes
   - Wait 2 more minutes
   - Timer should fire at correct time
   ```

## Files Created/Modified

### New Files
- `src/js/background.js` - Background service worker for timer management
- `timer-end.html` - Timer-end response page
- `src/js/timer-end.js` - Timer-end page logic
- `src/css/timer-end.css` - Timer-end page styling
- `src/components/settings-modal.html` - Settings modal UI
- `src/js/settings-modal.js` - Settings modal logic
- `TIMER_FUNCTIONALITY.md` - This documentation

### Modified Files
- `manifest.json` - Added background service worker, alarms, and tabs permissions
- `src/js/entries.js` - Added timer reset on new entry
- `src/js/sync-manager.js` - Added timer reset on phone sync
- `src/js/extension.js` - Integrated settings modal
- `src/css/components/modal.css` - Added settings modal styles
- `index.html` - Added settings-modal.js script

## Technical Details

### Storage Keys
- `standupnow_timer_state` - Stores timer state (lastEntryTime, nextAlarmTime)
- `standupnow_timer_config` - Stores timer configuration (timerMinutes, isCustom)
- `standupnow_entries` - Existing entries storage (monitored for changes)

### Chrome APIs Used
- `chrome.alarms` - For scheduling timer
- `chrome.tabs` - For opening/focusing tabs
- `chrome.storage.local` - For persisting timer state and config
- `chrome.runtime` - For message passing between components

### Message Types
- `RESET_TIMER` - Sent to background to reset timer with new entry time
- `GET_TIMER_STATE` - Query current timer state
- `UPDATE_TIMER_INTERVAL` - Update timer interval configuration

## Troubleshooting

### Timer Not Firing
1. Check if background service worker is running:
   - Go to `chrome://extensions/`
   - Click "service worker" link under your extension
   - Check console for errors

2. Verify alarm is scheduled:
   - In service worker console, type: `chrome.alarms.getAll(console.log)`
   - Should show `standupnow_timer` alarm

3. Check timer state:
   - In service worker console, type:
   ```javascript
   chrome.storage.local.get(['standupnow_timer_state', 'standupnow_timer_config'], console.log)
   ```

### Settings Not Saving
1. Check browser console for errors
2. Verify storage permissions in manifest.json
3. Try clearing extension storage and reconfiguring

### Timer Not Resetting on New Entry
1. Check browser console when adding entry
2. Look for "Timer reset message sent" log
3. Verify background service worker is receiving messages

### Custom Interval Not Working
1. Ensure at least 1 minute is set
2. Check that values are within valid ranges
3. Verify timer preview shows correct total

## Best Practices

1. **Choose Appropriate Intervals**
   - For active development: 15-30 minutes
   - For regular work: 1 hour
   - For long tasks: 2 hours

2. **Use Snooze Wisely**
   - Snooze when in the middle of focused work
   - Don't rely on snooze too often - defeats the purpose

3. **Regular Updates**
   - Add entries even before timer expires
   - More frequent updates = better standup notes

4. **Sync Regularly**
   - Keep phone and extension in sync
   - Timer will always use most recent entry

## Future Enhancements

Possible improvements:
- Timer pause/resume functionality
- Multiple timer profiles (work, break, meeting)
- Desktop notifications in addition to tab opening
- Timer status indicator in extension popup
- Statistics on standup frequency
- Integration with calendar for meeting-aware timing
- Smart timer adjustment based on work patterns

## Support

For issues or questions:
1. Check service worker console logs
2. Verify all files are present
3. Ensure Chrome version supports Manifest V3
4. Test with simplified timer interval (1 minute)
5. Check that all permissions are granted

---

**Made with Bob** 🤖