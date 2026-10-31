package com.hayat.backend_order_service.constants;

import java.io.InputStream;
import java.util.Properties;

public class CommonConstants {

    public static final String APP_VERSION;

    static {
        Properties properties = new Properties();
        try (InputStream inputStream =
                CommonConstants.class.getClassLoader().getResourceAsStream("application.properties")) {
            if (inputStream == null) {
                throw new RuntimeException("Sorry, unable to find application.propertiers");
            }

            properties.load(inputStream);

            APP_VERSION = properties.getProperty("app.version", "1.0.0");
        } catch (Exception e) {
            throw new ExceptionInInitializerError("Failed to load configuration properties: " + e.getMessage());
        }
    }
}
