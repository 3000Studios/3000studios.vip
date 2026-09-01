plugins {
  alias(libs.plugins.android.application) apply false
  alias(libs.plugins.kotlin.android) apply false
  alias(libs.plugins.kotlin.compose) apply false
}

layout.buildDirectory = file("C:/Users/MrJws/Documents/Codex/build-cache/3000-studios-agent/root")
subprojects {
  layout.buildDirectory = file("C:/Users/MrJws/Documents/Codex/build-cache/3000-studios-agent/${project.name}")
}
