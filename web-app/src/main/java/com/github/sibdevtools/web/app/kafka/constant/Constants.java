package com.github.sibdevtools.web.app.kafka.constant;

import com.github.sibdevtools.error.api.dto.ErrorSourceId;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * @author sibmaks
 * @since 0.0.1
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class Constants {
    public static final String SYSTEM_CODE = "WEB.APP.KAFKA";
    public static final ErrorSourceId ERROR_SOURCE = new ErrorSourceId(SYSTEM_CODE);
}
