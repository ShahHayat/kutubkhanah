package com.hayat.backend_notification_service;

import org.springframework.boot.SpringApplication;

public class TestBackendNotificationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.from(BackendNotificationServiceApplication::main)
                .with(TestcontainersConfiguration.class)
                .run(args);
    }
}
