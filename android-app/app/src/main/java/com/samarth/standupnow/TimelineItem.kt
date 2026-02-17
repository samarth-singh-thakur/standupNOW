package com.samarth.standupnow

import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.TimeUnit

/**
 * Sealed class representing items in the timeline RecyclerView
 */
sealed class TimelineItem {
    data class DateHeader(val dateText: String, val timestamp: Long) : TimelineItem()
    data class Entry(val userItem: UserItem, val timeGapText: String? = null) : TimelineItem()
}

/**
 * Utility class for timeline operations
 */
object TimelineUtils {
    private val timeFormat = SimpleDateFormat("h:mm a", Locale.getDefault())
    private val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
    
    /**
     * Format timestamp to time string (e.g., "4:00 PM")
     */
    fun formatTime(timestamp: Long): String {
        return timeFormat.format(Date(timestamp))
    }
    
    /**
     * Get date header text (Today, Yesterday, or date)
     */
    fun getDateHeaderText(timestamp: Long): String {
        val calendar = Calendar.getInstance()
        val today = calendar.clone() as Calendar
        today.set(Calendar.HOUR_OF_DAY, 0)
        today.set(Calendar.MINUTE, 0)
        today.set(Calendar.SECOND, 0)
        today.set(Calendar.MILLISECOND, 0)
        
        val yesterday = today.clone() as Calendar
        yesterday.add(Calendar.DAY_OF_YEAR, -1)
        
        calendar.timeInMillis = timestamp
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        
        return when {
            calendar.timeInMillis == today.timeInMillis -> "Today"
            calendar.timeInMillis == yesterday.timeInMillis -> "Yesterday"
            else -> dateFormat.format(Date(timestamp))
        }
    }
    
    /**
     * Calculate time gap between two timestamps
     */
    fun calculateTimeGap(newerTimestamp: Long, olderTimestamp: Long): String? {
        val diffMillis = newerTimestamp - olderTimestamp
        if (diffMillis <= 0) return null
        
        val hours = TimeUnit.MILLISECONDS.toHours(diffMillis)
        val minutes = TimeUnit.MILLISECONDS.toMinutes(diffMillis) % 60
        
        return when {
            hours > 0 && minutes > 0 -> "${hours}h ${minutes}m"
            hours > 0 -> "${hours}h"
            minutes > 0 -> "${minutes}m"
            else -> null
        }
    }
    
    /**
     * Check if two timestamps are on the same day
     */
    fun isSameDay(timestamp1: Long, timestamp2: Long): Boolean {
        val cal1 = Calendar.getInstance().apply { timeInMillis = timestamp1 }
        val cal2 = Calendar.getInstance().apply { timeInMillis = timestamp2 }
        
        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
               cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
    }
    
    /**
     * Convert list of UserItems to timeline items with headers and gaps
     */
    fun createTimelineItems(entries: List<UserItem>): List<TimelineItem> {
        if (entries.isEmpty()) return emptyList()
        
        val timelineItems = mutableListOf<TimelineItem>()
        var currentDate: String? = null
        var previousTimestamp: Long? = null
        
        entries.forEach { entry ->
            val timestamp = entry.timestamp
            val dateHeader = getDateHeaderText(timestamp)
            
            // Add date header if date changed
            if (dateHeader != currentDate) {
                timelineItems.add(TimelineItem.DateHeader(dateHeader, timestamp))
                currentDate = dateHeader
                previousTimestamp = null // Reset gap calculation for new day
            }
            
            // Calculate time gap from previous entry
            val timeGap = previousTimestamp?.let { prev ->
                calculateTimeGap(prev, timestamp)
            }
            
            // Add entry with optional time gap
            timelineItems.add(TimelineItem.Entry(entry, timeGap))
            previousTimestamp = timestamp
        }
        
        return timelineItems
    }
    
    /**
     * Filter entries by date range
     */
    fun filterByDays(entries: List<UserItem>, days: Int): List<UserItem> {
        if (days <= 0) return entries
        
        val cutoffTime = System.currentTimeMillis() - TimeUnit.DAYS.toMillis(days.toLong())
        return entries.filter { it.timestamp >= cutoffTime }
    }
    
    /**
     * Get entries for today
     */
    fun getTodayEntries(entries: List<UserItem>): List<UserItem> {
        val today = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }.timeInMillis
        
        return entries.filter { it.timestamp >= today }
    }
    
    /**
     * Format entries for copying
     */
    fun formatEntriesForCopy(entries: List<UserItem>): String {
        if (entries.isEmpty()) return ""
        
        return entries.joinToString("\n\n") { entry ->
            "${formatTime(entry.timestamp)} - ${entry.text}"
        }
    }
}

// Made with Bob