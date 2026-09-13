package vip.studios3000.songdrop

import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okio.BufferedSink
import org.json.JSONObject

private const val API = "https://api.3000studios.vip"
private val Gold = Color(0xFFF2C14E); private val Ink = Color(0xFF080A10); private val Card = Color(0xFF151A25)

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); setContent { MaterialTheme(colorScheme=darkColorScheme(primary=Gold,background=Ink,surface=Card)) { SongDrop() } } }

  @Composable private fun SongDrop() {
    var uri by remember { mutableStateOf<Uri?>(null) }; var name by remember { mutableStateOf("No song selected") }
    var token by remember { mutableStateOf(getPreferences(MODE_PRIVATE).getString("device_key","") ?: "") }
    var mode by remember { mutableStateOf("dry_run") }; var phrase by remember { mutableStateOf("") }; var status by remember { mutableStateOf("Ready") }; var busy by remember { mutableStateOf(false) }
    val picker=rememberLauncherForActivityResult(ActivityResultContracts.GetContent()){picked->uri=picked;name=picked?.let{displayName(it)}?:"No song selected"}
    Surface(Modifier.fillMaxSize(),color=Ink){Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),verticalArrangement=Arrangement.spacedBy(15.dp)){
      Text("3000 STUDIOS · OWNER",color=Gold,fontWeight=FontWeight.Black,letterSpacing=2.sp); Text("Remote Song Drop",fontSize=38.sp,lineHeight=40.sp,fontWeight=FontWeight.Black)
      Text("Upload from anywhere. Your workstation builds the video, release package, and social promos.",color=Color(0xFFB7C0D1))
      ElevatedCard(colors=CardDefaults.elevatedCardColors(containerColor=Card),shape=RoundedCornerShape(22.dp)){Column(Modifier.padding(18.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){
        OutlinedTextField(token,{token=it},Modifier.fillMaxWidth(),label={Text("Private pairing key")},singleLine=true)
        Button({picker.launch("audio/*")},Modifier.fillMaxWidth().heightIn(min=56.dp)){Text("Choose song")}; Text(name,color=Color(0xFFB7C0D1))
        Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){listOf("dry_run" to "Dry run","build_only" to "Build","publish" to "Publish").forEach{(v,l)->FilterChip(mode==v,{mode=v},{Text(l)})}}
        if(mode=="publish") OutlinedTextField(phrase,{phrase=it},Modifier.fillMaxWidth(),label={Text("Type PUBLISH 3000 STUDIOS")})
        Button(enabled=!busy,onClick={val song=uri;if(song==null||token.length<32){status="Choose a song and enter the pairing key."}else if(mode=="publish"&&phrase!="PUBLISH 3000 STUDIOS"){status="Exact publish confirmation required."}else{getPreferences(MODE_PRIVATE).edit().putString("device_key",token).apply();busy=true;status="Uploading securely…";lifecycleScope.launch{status=upload(song,name,mode,phrase,token);busy=false}}},modifier=Modifier.fillMaxWidth().heightIn(min=54.dp)){Text(if(busy)"Working…" else "Start remote flow",fontWeight=FontWeight.Bold)}
      }}
      ElevatedCard(colors=CardDefaults.elevatedCardColors(containerColor=Card),shape=RoundedCornerShape(22.dp)){Column(Modifier.padding(18.dp)){Text("Pipeline status",fontWeight=FontWeight.Bold,fontSize=20.sp);Spacer(Modifier.height(8.dp));Text(status,color=if(status.contains("Queued")) Color(0xFF4ADE80) else Color.White)}}
    }}
  }
  private fun displayName(uri:Uri):String { contentResolver.query(uri,null,null,null,null)?.use{c->val i=c.getColumnIndex(OpenableColumns.DISPLAY_NAME);if(c.moveToFirst()&&i>=0)return c.getString(i)};return "song.wav" }
  private suspend fun upload(uri:Uri,name:String,mode:String,phrase:String,token:String)=withContext(Dispatchers.IO){try{val size=contentResolver.openAssetFileDescriptor(uri,"r")?.length?:-1;val body=object:RequestBody(){override fun contentType()=(contentResolver.getType(uri)?:"audio/wav").toMediaTypeOrNull();override fun contentLength()=size;override fun writeTo(sink:BufferedSink){contentResolver.openInputStream(uri)!!.use{input->val bytes=ByteArray(65536);while(true){val count=input.read(bytes);if(count<0)break;sink.write(bytes,0,count)}}}};val req=Request.Builder().url("$API/music/jobs").header("x-music-device-token",token).header("x-file-name",name).header("x-pipeline-mode",mode).header("x-publish-confirmation",phrase).post(body).build();OkHttpClient().newCall(req).execute().use{r->val text=r.body?.string().orEmpty();if(!r.isSuccessful)"Upload failed (${r.code})" else "Queued · job ${JSONObject(text).optString("id").take(8)}"}}catch(e:Exception){"Connection failed · ${e.javaClass.simpleName}"}}
}
