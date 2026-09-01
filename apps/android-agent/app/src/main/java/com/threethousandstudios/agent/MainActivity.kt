package com.threethousandstudios.agent

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.Settings
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Memory
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import java.util.Locale

class MainActivity : ComponentActivity(), TextToSpeech.OnInitListener {
  private var tts: TextToSpeech? = null
  private val spokenText = mutableStateOf("Ready when you are. Let's make this phone work smarter without doing anything stupid.")
  private val speaking = mutableStateOf(false)
  private val guardianRunning = mutableStateOf(true)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    tts = TextToSpeech(this, this)
    ContextCompat.startForegroundService(this, Intent(this, GuardianService::class.java))
    setContent { AgentApp() }
  }

  override fun onInit(status: Int) {
    if (status == TextToSpeech.SUCCESS) {
      tts?.language = Locale.US
      tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
        override fun onStart(utteranceId: String?) = runOnUiThread { speaking.value = true }
        override fun onDone(utteranceId: String?) = runOnUiThread { speaking.value = false }
        @Deprecated("Deprecated in Java")
        override fun onError(utteranceId: String?) = runOnUiThread { speaking.value = false }
      })
    }
  }

  private fun say(text: String) {
    spokenText.value = text
    tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "agent-response")
  }

  private fun abortAll() {
    tts?.stop()
    speaking.value = false
    spokenText.value = "ABORT confirmed. All agent activity is stopped."
    stopService(Intent(this, GuardianService::class.java))
    guardianRunning.value = false
  }

  private fun restartGuardian() {
    ContextCompat.startForegroundService(this, Intent(this, GuardianService::class.java))
    guardianRunning.value = true
    say("Phone Guardian restarted. I am monitoring locally again.")
  }

  override fun onDestroy() { tts?.shutdown(); super.onDestroy() }

  @Composable
  private fun AgentApp() {
    val observations = remember { mutableStateListOf<SecurityObservation>().apply { addAll(SecurityScanner.scan(this@MainActivity)) } }
    var memoryCount by remember { mutableStateOf(getPreferences(MODE_PRIVATE).getInt("memory_count", 0)) }
    val backupLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
      if (uri != null) {
        val payload = "{\"app\":\"3000 Studios Agent\",\"memoryCount\":$memoryCount,\"createdAt\":${System.currentTimeMillis()}}"
        contentResolver.openOutputStream(uri)?.bufferedWriter()?.use { it.write(payload) }
        say("Encrypted-device memory export saved. Google Drive sync depends on the location you selected.")
      }
    }
    val speechLauncher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
      val text = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull().orEmpty()
      if (text.contains("abort", true)) abortAll() else if (text.isNotBlank()) {
        memoryCount += 1
        getPreferences(MODE_PRIVATE).edit().putInt("memory_count", memoryCount).apply()
        say("I heard: $text. The secure agent connection is the next step; I will not fake an action before it is connected.")
      }
    }
    val micPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
      if (granted) speechLauncher.launch(Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US")
      })
    }
    val pulse by rememberInfiniteTransition(label = "voice").animateFloat(
      initialValue = .45f, targetValue = if (speaking.value) 1f else .55f,
      animationSpec = infiniteRepeatable(tween(if (speaking.value) 180 else 1200), RepeatMode.Reverse), label = "voice-pulse"
    )
    val colors = darkColors()
    MaterialTheme(colorScheme = colors) {
      Surface(modifier = Modifier.fillMaxSize(), color = Color(0xFF02040A)) {
        Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 24.dp)) {
          Box(Modifier.fillMaxWidth().height(370.dp)) {
            Image(painterResource(R.drawable.agent_portrait), "DUDE lifelike assistant", Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
            Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xFF02040A)))))
            Text("3000 STUDIOS  •  LIVE", color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.padding(20.dp))
            Box(Modifier.align(Alignment.BottomCenter).padding(18.dp).fillMaxWidth().border(1.dp, Color(0xFF9C5CFF), RoundedCornerShape(20.dp)).background(Color(0xD9090D17), RoundedCornerShape(20.dp)).padding(16.dp)) {
              Text(spokenText.value, color = Color.White, fontSize = 16.sp, lineHeight = 23.sp, maxLines = 3, overflow = TextOverflow.Ellipsis)
            }
          }
          Column(Modifier.padding(horizontal = 18.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Box(Modifier.size((86 + pulse * 8).dp).background(Color(0xFF111725), CircleShape).border(3.dp, Brush.sweepGradient(listOf(Color(0xFFA855F7), Color(0xFF25D8FF), Color(0xFFA855F7))), CircleShape).clickable {
              if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                speechLauncher.launch(Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply { putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US") })
              } else micPermission.launch(Manifest.permission.RECORD_AUDIO)
            }, contentAlignment = Alignment.Center) { Icon(Icons.Default.Mic, "Press to talk", tint = Color.White, modifier = Modifier.size(38.dp)) }
            Text(if (speaking.value) "SPEAKING" else "PRESS TO TALK", color = Color(0xFFB279FF), fontSize = 11.sp, letterSpacing = 2.sp, modifier = Modifier.padding(10.dp))
            GuardianPanel(observations) { observations.clear(); observations.addAll(SecurityScanner.scan(this@MainActivity)) }
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
              InfoChip(Icons.Default.Memory, "$memoryCount memories", Modifier.weight(1f))
              InfoChip(Icons.Default.Settings, "Controls", Modifier.weight(1f)) { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
            }
            Spacer(Modifier.height(10.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
              InfoChip(Icons.Default.Security, "Usage access", Modifier.weight(1f)) { startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)) }
              InfoChip(Icons.Default.Memory, "Drive backup", Modifier.weight(1f)) { backupLauncher.launch("3000-agent-memory.json") }
            }
            Button(onClick = { if (guardianRunning.value) abortAll() else restartGuardian() }, modifier = Modifier.fillMaxWidth().height(58.dp).padding(top = 10.dp), colors = ButtonDefaults.buttonColors(containerColor = if (guardianRunning.value) Color(0xFFB40916) else Color(0xFF176B47), contentColor = Color.White), shape = RoundedCornerShape(14.dp)) {
              Icon(if (guardianRunning.value) Icons.Default.Stop else Icons.Default.Security, null); Spacer(Modifier.size(8.dp)); Text(if (guardianRunning.value) "ABORT ALL AGENT ACTIONS" else "RESTART PHONE GUARDIAN", color = Color.White, fontWeight = FontWeight.Bold)
            }
          }
        }
      }
    }
  }

  @Composable
  private fun GuardianPanel(observations: List<SecurityObservation>, rescan: () -> Unit) {
    Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Color(0xFF080C14)), shape = RoundedCornerShape(18.dp)) {
      Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Default.Security, null, tint = Color(0xFF55E59C)); Spacer(Modifier.size(10.dp)); Column { Text("PHONE GUARDIAN", color = Color(0xFFB279FF), fontWeight = FontWeight.Bold); Text(if (observations.any { it.warning }) "REVIEW NEEDED" else "SECURE", color = if (observations.any { it.warning }) Color(0xFFFFB54A) else Color(0xFF55E59C), fontSize = 22.sp, fontWeight = FontWeight.Bold) } }
        observations.take(3).forEach { item -> Row(verticalAlignment = Alignment.Top) { Icon(if (item.warning) Icons.Default.Error else Icons.Default.Security, null, tint = if (item.warning) Color(0xFFFFB54A) else Color(0xFF55E59C), modifier = Modifier.size(20.dp)); Spacer(Modifier.size(10.dp)); Column { Text(item.title, color = Color.White, fontWeight = FontWeight.SemiBold); Text(item.detail, color = Color(0xFFA5A9B8), fontSize = 12.sp) } } }
        Button(onClick = rescan, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4E2384))) { Text("REVIEW NOW") }
      }
    }
  }

  @Composable
  private fun InfoChip(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, modifier: Modifier, action: (() -> Unit)? = null) {
    Row(modifier.height(48.dp).background(Color(0xFF090D16), RoundedCornerShape(12.dp)).then(if (action != null) Modifier.clickable(onClick = action) else Modifier).padding(12.dp), verticalAlignment = Alignment.CenterVertically) { Icon(icon, null, tint = Color(0xFF25D8FF)); Spacer(Modifier.size(8.dp)); Text(label, color = Color(0xFFC8CAD5), fontSize = 12.sp) }
  }

  private fun darkColors() = androidx.compose.material3.darkColorScheme(primary = Color(0xFFA855F7), secondary = Color(0xFF25D8FF), background = Color(0xFF02040A), surface = Color(0xFF080C14))
}
