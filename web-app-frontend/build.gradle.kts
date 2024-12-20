import com.github.gradle.node.npm.task.NpmTask

plugins {
  alias(libs.plugins.node.gradle)
}

node {
  version.set(libs.versions.node.asProvider().get())
  npmVersion.set(libs.versions.npm.get())
  download.set(true)
}

tasks.register<NpmTask>("build") {
  group = "build"
  description = "Builds the React frontend using npm."
  dependsOn("npmInstall")
  args.set(listOf("run", "build"))
}
