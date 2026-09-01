plugins {
  alias(libs.plugins.android.application)
  alias(libs.plugins.kotlin.android)
  alias(libs.plugins.kotlin.compose)
}

android {
  namespace = "com.threethousandstudios.agent"
  compileSdk = 36

  defaultConfig {
    applicationId = "com.threethousandstudios.agent"
    minSdk = 29
    targetSdk = 36
    versionCode = 2
    versionName = "0.2.0-guardian"
    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
  }
  buildTypes {
    release { isMinifyEnabled = true; proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro") }
    debug { applicationIdSuffix = ".debug"; versionNameSuffix = "-debug" }
  }
  compileOptions { sourceCompatibility = JavaVersion.VERSION_11; targetCompatibility = JavaVersion.VERSION_11 }
  kotlinOptions { jvmTarget = "11" }
  buildFeatures { compose = true }
}

dependencies {
  implementation(platform(libs.androidx.compose.bom))
  implementation(libs.androidx.activity.compose)
  implementation(libs.androidx.compose.material3)
  implementation(libs.androidx.compose.material.icons.extended)
  implementation(libs.androidx.compose.ui)
  implementation(libs.androidx.compose.ui.graphics)
  implementation(libs.androidx.compose.ui.tooling.preview)
  implementation(libs.androidx.core.ktx)
  implementation(libs.androidx.lifecycle.runtime.ktx)
  implementation(libs.androidx.lifecycle.runtime.compose)
  implementation(libs.kotlinx.coroutines.android)
  implementation("androidx.security:security-crypto:1.1.0-alpha06")
  implementation("com.squareup.okhttp3:okhttp:4.12.0")
  debugImplementation(libs.androidx.compose.ui.tooling)
  testImplementation(libs.junit)
}
