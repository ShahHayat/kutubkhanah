package com.hayat.backend_order_service.config;

import com.hayat.backend_order_service.constants.CommonConstants;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPI3Configuration {
    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    String issueUri;

    @Value("${swagger.api-gateway-url}")
    String apiGatewayUrl;

    @Bean
    OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Order Service APIs")
                        .description("Kutub Khanah Order Service APIs")
                        .version(CommonConstants.APP_VERSION)
                        .contact(new Contact().name("").email("")))
                .servers(List.of(new Server().url(apiGatewayUrl)))
                .addSecurityItem(new SecurityRequirement().addList("Authorization"))
                .components(new Components()
                        .addSecuritySchemes(
                                "security_auth",
                                new SecurityScheme()
                                        .in(SecurityScheme.In.HEADER)
                                        .type(SecurityScheme.Type.OAUTH2)
                                        .flows(new OAuthFlows()
                                                .authorizationCode(new OAuthFlow()
                                                        .authorizationUrl(issueUri + "/protocol/openid-connect/auth")
                                                        .tokenUrl(issueUri + "/protocol/openid-connect/token")
                                                        .scopes(new Scopes().addString("openid", "openid scope"))))));
    }
}
