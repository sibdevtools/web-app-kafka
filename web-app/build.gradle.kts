import java.text.SimpleDateFormat
import java.util.*

plugins {
    id("java")
    id("jacoco")
    id("maven-publish")
    alias(libs.plugins.spring.dependency.managment)
}

dependencyManagement {
    imports {
        mavenBom(libs.spring.boot.bom.map { it.toString() }.get())
    }
}

dependencies {
    compileOnly("org.projectlombok:lombok")
    compileOnly("jakarta.servlet:jakarta.servlet-api")

    annotationProcessor("org.projectlombok:lombok")
    annotationProcessor(libs.mapstruct)

    implementation("org.springframework:spring-aspects")
    implementation("org.springframework:spring-context")
    implementation("org.springframework:spring-core")
    implementation("org.springframework:spring-web")
    implementation("org.springframework:spring-webmvc")
    implementation("org.springframework.boot:spring-boot-autoconfigure")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    implementation("org.springframework.data:spring-data-jpa")

    implementation("org.flywaydb:flyway-core")

    implementation("com.fasterxml.jackson.core:jackson-databind")

    implementation("com.fasterxml.jackson.module:jackson-module-parameter-names")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jdk8")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")

    implementation("jakarta.annotation:jakarta.annotation-api")
    implementation("jakarta.persistence:jakarta.persistence-api")

    implementation(libs.mapstruct)
    implementation(libs.mapstruct.lombok)

    implementation(libs.api.common)
    implementation(libs.api.error)
    implementation(libs.api.localization)
    implementation(libs.api.web.app)

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-starter-web")

    testImplementation("org.junit.jupiter:junit-jupiter-api")
    testImplementation("org.junit.jupiter:junit-jupiter-params")

    testImplementation("org.mockito:mockito-core")

    testCompileOnly("org.projectlombok:lombok")
    testAnnotationProcessor("org.projectlombok:lombok")

    testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.register<Copy>("copyFrontendResources") {
    group = "build"
    description = "Copies the frontend build resources to the Spring Boot static directory"

    dependsOn(":web-app-frontend:build")

    from(project(":web-app-frontend").file("build/out"))
    into(layout.buildDirectory.dir("resources/main/web/app/kafka/static"))
}

tasks.named("processResources") {
    dependsOn("copyFrontendResources")
}

tasks.withType<ProcessResources> {
    filesMatching("**/application.properties") {
        expand("appVersion" to version)
    }
}

tasks.named<ProcessResources>("processResources") {
    notCompatibleWithConfigurationCache("Uses objects that are not serializable with configuration cache.")
}

tasks.named<ProcessResources>("processTestResources") {
    notCompatibleWithConfigurationCache("Uses objects that are not serializable with configuration cache.")
}

tasks.jar {
    dependsOn("copyFrontendResources")
    from("LICENSE") {
        rename { "${it}_${project.property("project_name")}" }
    }
    manifest {
        attributes(
            mapOf(
                "Specification-Title" to project.name,
                "Specification-Vendor" to project.property("author"),
                "Specification-Version" to project.version,
                "Specification-Timestamp" to SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ").format(Date()),
                "Timestamp" to System.currentTimeMillis(),
                "Built-On-Java" to "${System.getProperty("java.vm.version")} (${System.getProperty("java.vm.vendor")})"
            )
        )
    }
}


tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
}

publishing {
    publications {
        create<MavenPublication>("mavenJava") {
            from(components["java"])
            artifactId = "web-app-kafka"
            pom {
                packaging = "jar"
                url = "https://github.com/sibdevtools/web-app-kafka"

                licenses {
                    license {
                        name.set("The MIT License (MIT)")
                        url.set("https://www.mit.edu/~amini/LICENSE.md")
                    }
                }

                scm {
                    connection.set("scm:https://github.com/sibdevtools/web-app-kafka.git")
                    developerConnection.set("scm:git:ssh://github.com/sibdevtools")
                    url.set("https://github.com/sibdevtools/web-app-kafka")
                }

                developers {
                    developer {
                        id.set("sibmaks")
                        name.set("Maksim Drobyshev")
                        email.set("sibmaks@vk.com")
                    }
                }
            }
        }
    }
    repositories {
        maven {
            val releasesUrl = uri("https://nexus.sibmaks.ru/repository/maven-releases/")
            val snapshotsUrl = uri("https://nexus.sibmaks.ru/repository/maven-snapshots/")
            url = if (version.toString().endsWith("SNAPSHOT")) snapshotsUrl else releasesUrl
            credentials {
                username = project.findProperty("nexus_username")?.toString() ?: System.getenv("NEXUS_USERNAME")
                password = project.findProperty("nexus_password")?.toString() ?: System.getenv("NEXUS_PASSWORD")
            }
        }
    }
}
