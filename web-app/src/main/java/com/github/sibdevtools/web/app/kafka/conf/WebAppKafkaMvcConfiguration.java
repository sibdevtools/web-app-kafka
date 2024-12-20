package com.github.sibdevtools.web.app.kafka.conf;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.VersionResourceResolver;

/**
 * @author sibmaks
 * @since 0.0.1
 */
@Configuration
@EnableWebMvc
public class WebAppKafkaMvcConfiguration implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/web/app/Kafka/ui/**")
                .addResourceLocations("classpath:/web/app/Kafka/static/")
                .resourceChain(true)
                .addResolver(new VersionResourceResolver().addContentVersionStrategy("/**"));
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/web/app/Kafka/ui/")
                .setViewName("forward:/web/app/Kafka/ui/index.html");
    }
}
