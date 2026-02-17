package com.samarth.standupnow

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

data class UserItem(
    // Core fields
    val id: String = UUID.randomUUID().toString(),
    val time: String = getCurrentISOTime(),
    val note: String,
    
    // Sync fields
    val createdAt: String = getCurrentISOTime(),
    val updatedAt: String = getCurrentISOTime(),
    val version: Int = 1,
    val deleted: Boolean = false
) {
    // Legacy compatibility
    val uuid: String get() = id
    val timestamp: Long get() = parseISOTime(time)
    val text: String get() = note
    
    companion object {
        private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
            timeZone = java.util.TimeZone.getTimeZone("UTC")
        }
        
        fun getCurrentISOTime(): String {
            return isoFormat.format(Date())
        }
        
        fun parseISOTime(isoString: String): Long {
            return try {
                isoFormat.parse(isoString)?.time ?: System.currentTimeMillis()
            } catch (e: Exception) {
                System.currentTimeMillis()
            }
        }
        
        // Create from legacy format
        fun fromLegacy(uuid: String, timestamp: Long, text: String): UserItem {
            val isoTime = isoFormat.format(Date(timestamp))
            return UserItem(
                id = uuid,
                time = isoTime,
                note = text,
                createdAt = isoTime,
                updatedAt = isoTime,
                version = 1,
                deleted = false
            )
        }
    }
    
    // Create updated copy
    fun update(newNote: String): UserItem {
        return copy(
            note = newNote,
            updatedAt = getCurrentISOTime(),
            version = version + 1
        )
    }
    
    // Create deleted copy
    fun markDeleted(): UserItem {
        return copy(
            deleted = true,
            updatedAt = getCurrentISOTime(),
            version = version + 1
        )
    }
}

// Made with Bob
