// Delete all entries script for StandupNow
// Run this in the browser console on any extension page (popup.html or fullview.html)

async function deleteAllEntries() {
  try {
    // Get current entries count
    const data = await chrome.storage.local.get("entries");
    const currentEntries = data.entries || [];
    const count = currentEntries.length;
    
    if (count === 0) {
      console.log("ℹ️ No entries to delete.");
      return;
    }
    
    // Confirm deletion
    const confirmed = confirm(
      `⚠️ WARNING: This will permanently delete all ${count} check-in ${count === 1 ? 'entry' : 'entries'}.\n\n` +
      `This action cannot be undone!\n\n` +
      `Click OK to proceed or Cancel to abort.`
    );
    
    if (!confirmed) {
      console.log("❌ Deletion cancelled by user.");
      return;
    }
    
    // Delete all entries
    await chrome.storage.local.set({ entries: [] });
    
    console.log(`✅ Successfully deleted ${count} ${count === 1 ? 'entry' : 'entries'}!`);
    console.log("📊 Total entries now: 0");
    
    // Reload the page to reflect changes
    window.location.reload();
    
  } catch (error) {
    console.error("❌ Error deleting entries:", error);
    alert("Failed to delete entries. Check console for details.");
  }
}

// Run the function
deleteAllEntries();

// Made with Bob