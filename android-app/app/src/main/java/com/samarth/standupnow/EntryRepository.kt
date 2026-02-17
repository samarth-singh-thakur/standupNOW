package com.samarth.standupnow

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

class EntryRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("entries_db", Context.MODE_PRIVATE)
    
    companion object {
        private const val KEY_ENTRIES = "entries"
    }
    
    // Get all active entries (sorted by time, newest first)
    fun getAllEntries(): List<UserItem> {
        val jsonString = prefs.getString(KEY_ENTRIES, "[]") ?: "[]"
        return parseEntries(jsonString)
            .filter { !it.deleted }
            .sortedByDescending { UserItem.parseISOTime(it.time) }
    }
    
    // Get all entries including deleted (for sync)
    fun getAllEntriesIncludingDeleted(): List<UserItem> {
        val jsonString = prefs.getString(KEY_ENTRIES, "[]") ?: "[]"
        return parseEntries(jsonString)
    }
    
    // Get entries updated since a specific time
    fun getEntriesUpdatedSince(isoTime: String): List<UserItem> {
        val sinceMillis = UserItem.parseISOTime(isoTime)
        return getAllEntriesIncludingDeleted().filter { entry ->
            UserItem.parseISOTime(entry.updatedAt) > sinceMillis
        }
    }
    
    // Get entry by ID
    fun getEntryById(id: String): UserItem? {
        return getAllEntriesIncludingDeleted().find { it.id == id }
    }
    
    // Add new entry
    fun addEntry(entry: UserItem) {
        val entries = getAllEntriesIncludingDeleted().toMutableList()
        entries.add(0, entry)
        saveEntries(entries)
    }
    
    // Update existing entry
    fun updateEntry(entry: UserItem) {
        val entries = getAllEntriesIncludingDeleted().toMutableList()
        val index = entries.indexOfFirst { it.id == entry.id }
        if (index != -1) {
            entries[index] = entry
            saveEntries(entries)
        }
    }
    
    // Delete entry (soft delete)
    fun deleteEntry(id: String) {
        val entries = getAllEntriesIncludingDeleted().toMutableList()
        val index = entries.indexOfFirst { it.id == id }
        if (index != -1) {
            entries[index] = entries[index].markDeleted()
            saveEntries(entries)
        }
    }
    
    // Merge entries from sync (phone wins conflicts)
    fun mergeEntries(incomingEntries: List<UserItem>) {
        val localEntries = getAllEntriesIncludingDeleted().toMutableList()
        val entryMap = localEntries.associateBy { it.id }.toMutableMap()
        
        incomingEntries.forEach { incoming ->
            val existing = entryMap[incoming.id]
            
            if (existing == null) {
                // New entry from extension
                entryMap[incoming.id] = incoming
            } else {
                // Conflict resolution: phone wins
                // Only accept incoming if it has higher version AND newer timestamp
                val incomingTime = UserItem.parseISOTime(incoming.updatedAt)
                val existingTime = UserItem.parseISOTime(existing.updatedAt)
                
                if (incoming.version > existing.version && incomingTime > existingTime) {
                    entryMap[incoming.id] = incoming
                }
                // Otherwise keep phone version (phone wins)
            }
        }
        
        val merged = entryMap.values.toList()
        saveEntries(merged)
    }
    
    // Save all entries
    private fun saveEntries(entries: List<UserItem>) {
        val jsonArray = JSONArray()
        entries.forEach { entry ->
            jsonArray.put(entryToJson(entry))
        }
        prefs.edit().putString(KEY_ENTRIES, jsonArray.toString()).apply()
    }
    
    // Parse entries from JSON
    private fun parseEntries(jsonString: String): List<UserItem> {
        val entries = mutableListOf<UserItem>()
        try {
            val jsonArray = JSONArray(jsonString)
            for (i in 0 until jsonArray.length()) {
                val jsonObject = jsonArray.getJSONObject(i)
                entries.add(jsonToEntry(jsonObject))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return entries
    }
    
    // Convert entry to JSON
    private fun entryToJson(entry: UserItem): JSONObject {
        return JSONObject().apply {
            put("id", entry.id)
            put("time", entry.time)
            put("note", entry.note)
            put("createdAt", entry.createdAt)
            put("updatedAt", entry.updatedAt)
            put("version", entry.version)
            put("deleted", entry.deleted)
        }
    }
    
    // Convert JSON to entry
    private fun jsonToEntry(json: JSONObject): UserItem {
        return UserItem(
            id = json.getString("id"),
            time = json.getString("time"),
            note = json.getString("note"),
            createdAt = json.getString("createdAt"),
            updatedAt = json.getString("updatedAt"),
            version = json.getInt("version"),
            deleted = json.getBoolean("deleted")
        )
    }
    
    // Clear all entries (for testing)
    fun clearAll() {
        prefs.edit().remove(KEY_ENTRIES).apply()
    }
}

// Made with Bob
