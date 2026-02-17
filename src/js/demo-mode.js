// Demo Mode Manager for StandupNow
// Handles switching between real data and demo data

const DEMO_MODE_KEY = 'demoModeEnabled';
const REAL_ENTRIES_BACKUP_KEY = 'realEntriesBackup';

// Sample activities for demo data
const DEMO_ACTIVITIES = [
  "✅ Completed user authentication module\n- Implemented JWT tokens\n- Added password reset flow\n- Fixed security vulnerabilities",
  "🚀 Deployed new features to production\n- Updated API endpoints\n- Migrated database schema\n- Ran performance tests",
  "🐛 Fixed critical bugs\n- Resolved memory leak in background service\n- Fixed UI rendering issues\n- Updated error handling",
  "📝 Documentation updates\n- Wrote API documentation\n- Updated README\n- Created user guides",
  "🎨 UI/UX improvements\n- Redesigned dashboard\n- Improved mobile responsiveness\n- Added dark mode support",
  "⚡ Performance optimization\n- Reduced bundle size by 30%\n- Implemented lazy loading\n- Optimized database queries",
  "🔧 Refactoring and code cleanup\n- Removed deprecated code\n- Improved code structure\n- Added unit tests",
  "🤝 Team collaboration\n- Code review sessions\n- Sprint planning meeting\n- Knowledge sharing session",
  "📊 Analytics implementation\n- Added tracking events\n- Created dashboards\n- Set up monitoring alerts",
  "🔐 Security enhancements\n- Updated dependencies\n- Implemented rate limiting\n- Added input validation",
  "💡 Research and learning\n- Explored new frameworks\n- Attended tech conference\n- Completed online course",
  "🎯 Sprint goals achieved\n- Delivered all user stories\n- Met acceptance criteria\n- Passed QA testing",
  "🔄 CI/CD improvements\n- Automated deployment pipeline\n- Added integration tests\n- Improved build times",
  "📱 Mobile app development\n- Implemented new features\n- Fixed platform-specific bugs\n- Optimized performance",
  "🌐 API development\n- Created new endpoints\n- Improved error responses\n- Added rate limiting"
];

// Generate demo entries across multiple days
function generateDemoEntries() {
  const demoEntries = [];
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Generate entries for the past 14 days
  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    
    // Generate 2-5 entries per day
    const entriesPerDay = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < entriesPerDay; i++) {
      const hour = 9 + Math.floor(Math.random() * 9); // 9 AM to 5 PM
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      
      const entryDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hour,
        minute,
        second
      );
      
      const activity = DEMO_ACTIVITIES[Math.floor(Math.random() * DEMO_ACTIVITIES.length)];
      
      const entryTime = entryDate.toISOString();
      demoEntries.push({
        id: crypto.randomUUID(),
        time: entryTime,
        note: activity,
        createdAt: entryTime,
        updatedAt: entryTime,
        version: 1,
        deleted: false
      });
    }
  }
  
  // Sort entries by time (newest first)
  demoEntries.sort((a, b) => new Date(b.time) - new Date(a.time));
  
  return demoEntries;
}

// Check if demo mode is enabled
async function isDemoModeEnabled() {
  const data = await chrome.storage.local.get(DEMO_MODE_KEY);
  return data[DEMO_MODE_KEY] === true;
}

// Enable demo mode
async function enableDemoMode() {
  // Get current real entries
  const data = await chrome.storage.local.get('entries');
  const realEntries = data.entries || [];
  
  // Backup real entries
  await chrome.storage.local.set({
    [REAL_ENTRIES_BACKUP_KEY]: realEntries,
    [DEMO_MODE_KEY]: true
  });
  
  // Generate and set demo entries
  const demoEntries = generateDemoEntries();
  await chrome.storage.local.set({ entries: demoEntries });
  
  console.log('✅ Demo mode enabled');
  console.log(`📊 Backed up ${realEntries.length} real entries`);
  console.log(`🎭 Generated ${demoEntries.length} demo entries`);
  
  return demoEntries;
}

// Disable demo mode and restore real data
async function disableDemoMode() {
  // Get backed up real entries
  const data = await chrome.storage.local.get(REAL_ENTRIES_BACKUP_KEY);
  const realEntries = data[REAL_ENTRIES_BACKUP_KEY] || [];
  
  // Restore real entries
  await chrome.storage.local.set({
    entries: realEntries,
    [DEMO_MODE_KEY]: false
  });
  
  // Clean up backup
  await chrome.storage.local.remove(REAL_ENTRIES_BACKUP_KEY);
  
  console.log('✅ Demo mode disabled');
  console.log(`📊 Restored ${realEntries.length} real entries`);
  
  return realEntries;
}

// Toggle demo mode
async function toggleDemoMode() {
  const isEnabled = await isDemoModeEnabled();
  
  if (isEnabled) {
    return await disableDemoMode();
  } else {
    return await enableDemoMode();
  }
}

// Get current entries (respects demo mode)
async function getCurrentEntries() {
  const data = await chrome.storage.local.get('entries');
  return data.entries || [];
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
  window.DemoMode = {
    isDemoModeEnabled,
    enableDemoMode,
    disableDemoMode,
    toggleDemoMode,
    getCurrentEntries,
    generateDemoEntries
  };
}

// Made with Bob
