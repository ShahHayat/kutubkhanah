package com.hayat.backend_catalog_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BackendCatalogServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendCatalogServiceApplication.class, args);
    }
}
