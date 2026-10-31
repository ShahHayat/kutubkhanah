package com.hayat.kutubkhanah_webapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class KutubkhanahWebappApplication {

    public static void main(String[] args) {
        SpringApplication.run(KutubkhanahWebappApplication.class, args);
    }
}
