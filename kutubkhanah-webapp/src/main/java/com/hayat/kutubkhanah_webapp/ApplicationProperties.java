package com.hayat.kutubkhanah_webapp;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "kutubkhanah")
public record ApplicationProperties(String apiGatewayUrl) {}
