plugins {
    alias(libs.plugins.spring.framework.boot) apply false
    alias(libs.plugins.spring.dependency.managment) apply false
    id("base")
}

allprojects {
    val versionFromProperty = "${project.property("version")}"
    val versionFromEnv: String? = System.getenv("VERSION")

    version = versionFromEnv ?: versionFromProperty
    group = "${project.property("group")}"

    repositories {
        mavenCentral()
        maven(url = "https://nexus.sibmaks.ru/repository/maven-snapshots/")
        maven(url = "https://nexus.sibmaks.ru/repository/maven-releases/")
    }
}
