package com.github.sibdevtools.web.app.kafka.conf;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import java.util.Base64;

/**
 * @author sibmaks
 * @since 0.0.1
 */
@Configuration
@PropertySource("classpath:web/app/kafka/application.properties")
public class WebAppKafkaConfiguration {

    @Bean("webAppKafkaBase64Encoder")
    public Base64.Encoder webAppKafkaBase64Encoder() {
        return Base64.getEncoder();
    }

    @Bean("webAppKafkaBase64Decoder")
    public Base64.Decoder webAppKafkaBase64Decoder() {
        return Base64.getDecoder();
    }

}
