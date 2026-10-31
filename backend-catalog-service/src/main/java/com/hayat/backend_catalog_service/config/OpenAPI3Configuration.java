package com.hayat.backend_catalog_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPI3Configuration {
    @Value("${swagger.api-gateway-url}")
    String apiGatewayUrl;

    @Value("${app.version}")
    String APP_VERSION;

    @Bean
    OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Catalog Service APIs")
                        .description("Kutub Khanah Catalog Service APIs")
                        .version(APP_VERSION)
                        .contact(new Contact().name("Hayat").email("smhayat225@gmail.com")))
                .servers(List.of(new Server().url(apiGatewayUrl)));
    }
}
