package com.samarth.standupnow

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

class NotificationHelper(private val context: Context) {
    
    companion object {
        const val CHANNEL_ID = "standup_reminders"
        const val CHANNEL_NAME = "Standup Reminders"
        const val NOTIFICATION_ID = 1001
        
        const val ACTION_SNOOZE = "com.samarth.standupnow.ACTION_SNOOZE"
        const val ACTION_OPEN_APP = "com.samarth.standupnow.ACTION_OPEN_APP"
        
        private const val PREFS_NAME = "StandupNowPrefs"
        private const val KEY_SNOOZE_UNTIL = "snooze_until"
        private const val KEY_REMINDER_INTERVAL = "reminder_interval_minutes"
        private const val DEFAULT_INTERVAL_MINUTES = 60L // 1 hour
        private const val SNOOZE_DURATION_HOURS = 10L
    }
    
    init {
        createNotificationChannel()
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance).apply {
                description = "Reminders to make standup entries"
                enableVibration(true)
                enableLights(true)
            }
            
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    fun showReminderNotification() {
        // Check if snoozed
        if (isSnoozed()) {
            return
        }
        
        // Create intent to open app
        val openIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            action = ACTION_OPEN_APP
        }
        val openPendingIntent = PendingIntent.getActivity(
            context,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Create snooze intent
        val snoozeIntent = Intent(context, NotificationReceiver::class.java).apply {
            action = ACTION_SNOOZE
        }
        val snoozePendingIntent = PendingIntent.getBroadcast(
            context,
            1,
            snoozeIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        // Build notification
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Time for a standup entry! 📝")
            .setContentText("Tap to jot down what you're working on")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(openPendingIntent)
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Snooze 10h",
                snoozePendingIntent
            )
            .build()
        
        // Show notification
        with(NotificationManagerCompat.from(context)) {
            notify(NOTIFICATION_ID, notification)
        }
    }
    
    fun snooze() {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val snoozeUntil = System.currentTimeMillis() + (SNOOZE_DURATION_HOURS * 60 * 60 * 1000)
        prefs.edit().putLong(KEY_SNOOZE_UNTIL, snoozeUntil).apply()
        
        // Cancel any existing notification
        cancelNotification()
    }
    
    fun isSnoozed(): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val snoozeUntil = prefs.getLong(KEY_SNOOZE_UNTIL, 0)
        val now = System.currentTimeMillis()
        
        if (snoozeUntil > now) {
            return true
        } else if (snoozeUntil > 0) {
            // Snooze period expired, clear it
            prefs.edit().remove(KEY_SNOOZE_UNTIL).apply()
        }
        
        return false
    }
    
    fun cancelNotification() {
        with(NotificationManagerCompat.from(context)) {
            cancel(NOTIFICATION_ID)
        }
    }
    
    fun setReminderInterval(minutes: Long) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putLong(KEY_REMINDER_INTERVAL, minutes).apply()
    }
    
    fun getReminderInterval(): Long {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getLong(KEY_REMINDER_INTERVAL, DEFAULT_INTERVAL_MINUTES)
    }
    
    fun getSnoozedUntilTime(): Long {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getLong(KEY_SNOOZE_UNTIL, 0)
    }
}

// Made with Bob
