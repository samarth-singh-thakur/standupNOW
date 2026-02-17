// Migration script to add IDs and sync fields to existing entries
// Run this in the browser console on the fullview.html page

async function migrateExistingEntries() {
  console.log('🔄 Starting migration of existing entries...');
  
  const data = await chrome.storage.local.get("entries");
  const entries = data.entries || [];
  
  if (entries.length === 0) {
    console.log('ℹ️ No entries found to migrate.');
    return;
  }
  
  let migratedCount = 0;
  let alreadyMigratedCount = 0;
  
  const migratedEntries = entries.map(entry => {
    // Check if entry already has the new schema
    if (entry.id && entry.createdAt && entry.updatedAt && 
        entry.version !== undefined && entry.deleted !== undefined) {
      alreadyMigratedCount++;
      return entry; // Already migrated
    }
    
    migratedCount++;
    
    // Migrate old format to new format
    return {
      id: crypto.randomUUID(),
      time: entry.time,
      note: entry.note,
      createdAt: entry.time, // Use original time as creation time
      updatedAt: entry.time, // Use original time as update time
      version: 1,
      deleted: false
    };
  });
  
  // Save migrated entries
  await chrome.storage.local.set({ entries: migratedEntries });
  
  console.log('✅ Migration complete!');
  console.log(`📊 Total entries: ${entries.length}`);
  console.log(`🆕 Migrated: ${migratedCount}`);
  console.log(`✓ Already migrated: ${alreadyMigratedCount}`);
  
  if (migratedCount > 0) {
    console.log('🔄 Reloading page to show updated entries...');
    setTimeout(() => window.location.reload(), 1000);
  }
}

// Run the migration
migrateExistingEntries();

// Made with Bob
