/**
 * Script to find and display today's entries from StandupNow extension
 * 
 * This script reads Chrome extension storage data directly.
 * 
 * Usage Options:
 * 
 * OPTION 1 - Run from Extension Console (Recommended):
 * 1. Open Chrome and go to: chrome://extensions/
 * 2. Enable "Developer mode" (top right)
 * 3. Find "StandupNow" extension
 * 4. Click "Inspect views: service worker" or "background page"
 * 5. In the console that opens, paste this code and press Enter
 * 
 * OPTION 2 - Run from Extension Popup:
 * 1. Right-click the StandupNow extension icon
 * 2. Select "Inspect popup"
 * 3. In the console, paste this code and press Enter
 */

// Check if running in browser extension context
if (typeof chrome !== 'undefined' && chrome.storage) {
  // Browser extension context
  (async function getTodayEntries() {
    console.log('🔍 Fetching today\'s entries from StandupNow...\n');
    
    try {
      // Get all entries from Chrome storage
      const data = await chrome.storage.local.get('entries');
      const allEntries = data.entries || [];
      
      if (allEntries.length === 0) {
        console.log('📝 No entries found in storage.');
        return;
      }
      
      // Get today's date range (start of day to now)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Filter entries for today
      const todayEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.time);
        return entryDate >= today;
      });
      
      // Display results
      console.log(`📊 Total entries in storage: ${allEntries.length}`);
      console.log(`📅 Today's entries: ${todayEntries.length}\n`);
      
      if (todayEntries.length === 0) {
        console.log('No check-ins recorded today yet.');
        return;
      }
      
      // Format and display each entry
      console.log('═══════════════════════════════════════════════════════');
      todayEntries.forEach((entry, index) => {
        const date = new Date(entry.time);
        const timeStr = date.toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        
        console.log(`\n📌 Entry ${index + 1} - ${timeStr}`);
        console.log(`   Time: ${entry.time}`);
        console.log(`   Note: ${entry.note}`);
        console.log('───────────────────────────────────────────────────────');
      });
      
      // Also create a formatted text output
      const formattedOutput = todayEntries.map((entry, index) => {
        const date = new Date(entry.time);
        const timeStr = date.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        return `Entry ${index + 1}:\n${timeStr}\n${entry.note}`;
      }).join('\n\n---\n\n');
      
      console.log('\n\n📋 Formatted output (copy-ready):\n');
      console.log(formattedOutput);
      
      // Return data for further processing
      return {
        total: allEntries.length,
        today: todayEntries.length,
        entries: todayEntries,
        formatted: formattedOutput
      };
      
    } catch (error) {
      console.error('❌ Error fetching entries:', error);
    }
  })();
} else {
  // Node.js context - provide instructions
  console.log('⚠️  This script needs to run in a Chrome extension context.\n');
  console.log('📖 Instructions:\n');
  console.log('1. Open Chrome and navigate to: chrome://extensions/');
  console.log('2. Enable "Developer mode" (toggle in top right)');
  console.log('3. Find the "StandupNow" extension');
  console.log('4. Click "Inspect views: service worker" or "background page"');
  console.log('5. Copy and paste this entire script into the console');
  console.log('6. Press Enter to execute\n');
  console.log('Alternative: Right-click the extension icon → Inspect popup → paste in console\n');
}

// Made with Bob
