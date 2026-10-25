package com.hayat.backend_order_service;

import org.springframework.boot.SpringApplication;

public class TestBackendOrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.from(BackendOrderServiceApplication::main)
                .with(TestcontainersConfiguration.class)
                .run(args);
    }
}
