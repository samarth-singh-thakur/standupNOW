package com.samarth.standupnow

import android.content.Context
import androidx.work.Worker
import androidx.work.WorkerParameters

class ReminderWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {
    
    override fun doWork(): Result {
        val notificationHelper = NotificationHelper(applicationContext)
        val repository = EntryRepository(applicationContext)
        
        // Check if snoozed
        if (notificationHelper.isSnoozed()) {
            return Result.success()
        }
        
        // Check if there are recent entries (within last hour)
        val entries = repository.getAllEntries()
        if (entries.isNotEmpty()) {
            val lastEntry = entries.first() // Entries are sorted newest first
            val oneHourAgo = System.currentTimeMillis() - (60 * 60 * 1000)
            
            // If last entry was made within the last hour, don't notify
            if (lastEntry.timestamp > oneHourAgo) {
                return Result.success()
            }
        }
        
        // Show notification
        notificationHelper.showReminderNotification()
        
        return Result.success()
    }
}

// Made with Bob
