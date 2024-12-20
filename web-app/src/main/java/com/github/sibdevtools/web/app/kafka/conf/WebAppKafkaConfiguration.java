package com.github.sibdevtools.web.app.kafka.conf;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.ClassicConfiguration;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import javax.sql.DataSource;
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


    @Bean
    @ConfigurationProperties("spring.flyway.web-app-kafka")
    public ClassicConfiguration webAppKafkaFlywayConfiguration(DataSource dataSource) {
        var classicConfiguration = new ClassicConfiguration();
        classicConfiguration.setDataSource(dataSource);
        return classicConfiguration;
    }

    @Bean
    public Flyway webAppKafkaFlyway(@Qualifier("webAppKafkaFlywayConfiguration") ClassicConfiguration configuration) {
        var flyway = new Flyway(configuration);
        flyway.migrate();
        return flyway;
    }
}
