package com.samarth.standupnow

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.widget.Toast

class NotificationReceiver : BroadcastReceiver() {
    
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            NotificationHelper.ACTION_SNOOZE -> {
                val notificationHelper = NotificationHelper(context)
                notificationHelper.snooze()
                Toast.makeText(context, "Snoozed for 10 hours", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

// Made with Bob
