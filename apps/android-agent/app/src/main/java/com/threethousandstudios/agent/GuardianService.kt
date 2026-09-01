package com.threethousandstudios.agent

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat

class GuardianService : Service() {
  override fun onCreate() {
    super.onCreate()
    val manager = getSystemService(NotificationManager::class.java)
    manager.createNotificationChannel(NotificationChannel(CHANNEL, "Agent Guardian", NotificationManager.IMPORTANCE_LOW))
    val notification = NotificationCompat.Builder(this, CHANNEL)
      .setSmallIcon(android.R.drawable.ic_lock_lock)
      .setContentTitle("3000 Studios Agent")
      .setContentText("Guardian monitoring is active")
      .setOngoing(true)
      .build()
    startForeground(3000, notification)
  }
  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int) = START_STICKY
  override fun onBind(intent: Intent?): IBinder? = null
  companion object { const val CHANNEL = "agent_guardian" }
}
