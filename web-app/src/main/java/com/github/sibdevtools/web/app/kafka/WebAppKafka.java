package com.github.sibdevtools.web.app.kafka;

import com.github.sibdevtools.localization.api.dto.LocalizationId;
import com.github.sibdevtools.localization.api.dto.LocalizationSourceId;
import com.github.sibdevtools.localization.mutable.api.source.LocalizationJsonSource;
import com.github.sibdevtools.webapp.api.dto.HealthStatus;
import com.github.sibdevtools.webapp.api.dto.WebApplication;
import jakarta.annotation.Nonnull;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Set;

import static com.github.sibdevtools.web.app.kafka.constant.Constants.SYSTEM_CODE;

/**
 * @author sibmaks
 * @since 0.0.1
 */
@Getter
@Component
@LocalizationJsonSource(
        systemCode = SYSTEM_CODE,
        path = "classpath:/web/app/kafka/content/localizations/eng.json",
        iso3Code = "eng"
)
@LocalizationJsonSource(
        systemCode = SYSTEM_CODE,
        path = "classpath:/web/app/kafka/content/localizations/rus.json",
        iso3Code = "rus"
)
public class WebAppKafka implements WebApplication {
    private static final LocalizationSourceId LOCALIZATION_SOURCE_ID = new LocalizationSourceId(SYSTEM_CODE);

    @Value("${web.app.kafka.version}")
    private String version;

    @Nonnull
    @Override
    public String getCode() {
        return "web.app.kafka";
    }

    @Nonnull
    @Override
    public String getFrontendUrl() {
        return "/web/app/kafka/ui/";
    }

    @Nonnull
    @Override
    public LocalizationId getIconCode() {
        return new LocalizationId(LOCALIZATION_SOURCE_ID, "web.app.kafka.icon");
    }

    @Nonnull
    @Override
    public LocalizationId getTitleCode() {
        return new LocalizationId(LOCALIZATION_SOURCE_ID, "web.app.kafka.title");
    }

    @Nonnull
    @Override
    public LocalizationId getDescriptionCode() {
        return new LocalizationId(LOCALIZATION_SOURCE_ID, "web.app.kafka.description");
    }

    @Nonnull
    @Override
    public Set<String> getTags() {
        return Set.of(
                "kafka",
                "messaging",
                "broker"
        );
    }

    @Nonnull
    @Override
    public HealthStatus getHealthStatus() {
        return HealthStatus.UP;
    }
}
