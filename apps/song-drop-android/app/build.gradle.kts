plugins { alias(libs.plugins.android.application); alias(libs.plugins.kotlin.android); alias(libs.plugins.kotlin.compose) }
android {
  namespace = "vip.studios3000.songdrop"; compileSdk = 36
  defaultConfig { applicationId = "vip.studios3000.songdrop"; minSdk = 29; targetSdk = 36; versionCode = 1; versionName = "1.0.0" }
  buildTypes { release { isMinifyEnabled = true; proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro") } }
  compileOptions { sourceCompatibility = JavaVersion.VERSION_11; targetCompatibility = JavaVersion.VERSION_11 }
  kotlinOptions { jvmTarget = "11" }; buildFeatures { compose = true }
}
dependencies {
  implementation(platform(libs.androidx.compose.bom)); implementation(libs.androidx.activity.compose)
  implementation(libs.androidx.compose.material3); implementation(libs.androidx.compose.ui)
  implementation(libs.androidx.compose.ui.graphics); implementation(libs.androidx.compose.ui.tooling.preview)
  implementation(libs.androidx.core.ktx); implementation(libs.androidx.lifecycle.runtime.ktx)
  implementation(libs.kotlinx.coroutines.android); implementation("com.squareup.okhttp3:okhttp:4.12.0")
  implementation("androidx.security:security-crypto:1.1.0-alpha06"); debugImplementation(libs.androidx.compose.ui.tooling)
}
