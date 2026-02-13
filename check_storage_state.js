// Check current storage state
chrome.storage.local.get(['entries', 'demoModeEnabled', 'realEntriesBackup'], (data) => {
  console.log('=== Storage State ===');
  console.log('Demo Mode Enabled:', data.demoModeEnabled);
  console.log('Current Entries Count:', (data.entries || []).length);
  console.log('Real Entries Backup Count:', (data.realEntriesBackup || []).length);
  console.log('\nCurrent Entries:', data.entries);
  console.log('\nReal Entries Backup:', data.realEntriesBackup);
});

// Made with Bob
