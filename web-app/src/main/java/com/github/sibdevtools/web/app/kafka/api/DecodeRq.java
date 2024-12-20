package com.github.sibdevtools.web.app.kafka.api;


/**
 * Decode PNG request
 *
 * @author sibmaks
 * @since 0.0.1
 */
public record DecodeRq(
        String content,
        Boolean useGZIP
) {
}
