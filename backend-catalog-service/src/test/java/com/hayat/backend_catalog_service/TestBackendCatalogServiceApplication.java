package com.hayat.backend_catalog_service;

import org.springframework.boot.SpringApplication;

public class TestBackendCatalogServiceApplication {

	public static void main(String[] args) {
		SpringApplication.from(BackendCatalogServiceApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
