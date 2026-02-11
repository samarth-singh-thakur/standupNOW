// Demo data generator for StandupNow
// Run this in the browser console on the fullview.html page

async function addDemoData() {
  const demoEntries = [];
  
  // Sample activities for variety
  const activities = [
    "✅ Completed user authentication module\n- Implemented JWT tokens\n- Added password reset flow\n- Fixed security vulnerabilities",
    "🚀 Deployed new features to production\n- Updated API endpoints\n- Migrated database schema\n- Ran performance tests",
    "🐛 Fixed critical bugs\n- Resolved memory leak in background service\n- Fixed UI rendering issues\n- Updated error handling",
    "📝 Documentation updates\n- Wrote API documentation\n- Updated README\n- Created user guides",
    "🎨 UI/UX improvements\n- Redesigned dashboard\n- Improved mobile responsiveness\n- Added dark mode support",
    "⚡ Performance optimization\n- Reduced bundle size by 30%\n- Implemented lazy loading\n- Optimized database queries",
    "🔧 Refactoring and code cleanup\n- Removed deprecated code\n- Improved code structure\n- Added unit tests",
    "🤝 Team collaboration\n- Code review sessions\n- Sprint planning meeting\n- Knowledge sharing session",
    "📊 Analytics implementation\n- Added tracking events\n- Created dashboards\n- Set up monitoring alerts",
    "🔐 Security enhancements\n- Updated dependencies\n- Implemented rate limiting\n- Added input validation"
  ];
  
  // Generate entries for February 2026 (1st to 11th, current date)
  const year = 2026;
  const month = 1; // February (0-indexed)
  const today = new Date();
  const currentDay = today.getDate();
  
  // Generate 1-4 entries per day with varying times
  for (let day = 1; day <= currentDay; day++) {
    const entriesPerDay = Math.floor(Math.random() * 4) + 1; // 1 to 4 entries
    
    for (let i = 0; i < entriesPerDay; i++) {
      const hour = 9 + Math.floor(Math.random() * 9); // 9 AM to 5 PM
      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      
      const entryDate = new Date(year, month, day, hour, minute, second);
      const activity = activities[Math.floor(Math.random() * activities.length)];
      
      demoEntries.push({
        time: entryDate.toISOString(),
        note: activity
      });
    }
  }
  
  // Sort entries by time (newest first)
  demoEntries.sort((a, b) => new Date(b.time) - new Date(a.time));
  
  // Get existing entries
  const data = await chrome.storage.local.get("entries");
  const existingEntries = data.entries || [];
  
  // Merge with existing entries (avoid duplicates by time)
  const existingTimes = new Set(existingEntries.map(e => e.time));
  const newEntries = demoEntries.filter(e => !existingTimes.has(e.time));
  
  const allEntries = [...newEntries, ...existingEntries];
  
  // Save to storage
  await chrome.storage.local.set({ entries: allEntries });
  
  console.log(`✅ Added ${newEntries.length} demo entries for February 2026!`);
  console.log(`📊 Total entries: ${allEntries.length}`);
  
  // Reload the page to show new data
  window.location.reload();
}

// Run the function
addDemoData();

// Made with Bob
