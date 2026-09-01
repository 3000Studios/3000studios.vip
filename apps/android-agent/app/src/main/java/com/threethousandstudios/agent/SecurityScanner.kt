package com.threethousandstudios.agent

import android.app.KeyguardManager
import android.content.Context
import android.provider.Settings

data class SecurityObservation(val title: String, val detail: String, val warning: Boolean)

object SecurityScanner {
  fun scan(context: Context): List<SecurityObservation> {
    val keyguard = context.getSystemService(KeyguardManager::class.java)
    val adbEnabled = Settings.Global.getInt(context.contentResolver, Settings.Global.ADB_ENABLED, 0) == 1
    val devEnabled = Settings.Global.getInt(context.contentResolver, Settings.Global.DEVELOPMENT_SETTINGS_ENABLED, 0) == 1
    val accessibilityEnabled = Settings.Secure.getInt(context.contentResolver, Settings.Secure.ACCESSIBILITY_ENABLED, 0) == 1
    return listOf(
      SecurityObservation("Secure screen lock", if (keyguard.isDeviceSecure) "PIN, password, or biometric protection is active" else "No secure lock detected", !keyguard.isDeviceSecure),
      SecurityObservation("USB debugging", if (adbEnabled) "Enabled while this installation is connected" else "Disabled", adbEnabled),
      SecurityObservation("Developer options", if (devEnabled) "Enabled; review when setup is complete" else "Disabled", devEnabled),
      SecurityObservation("Accessibility services", if (accessibilityEnabled) "At least one service is enabled; review the approved list" else "No accessibility service enabled", accessibilityEnabled),
    )
  }
}
