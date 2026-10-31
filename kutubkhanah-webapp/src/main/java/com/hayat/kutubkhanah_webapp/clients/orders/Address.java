package com.hayat.kutubkhanah_webapp.clients.orders;

import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

public record Address(
        @NotBlank(message = "Address line 1 is required") String addressLine1,
        String addressLine2,
        @NotBlank(message = "City is required") String city,
        @NotBlank(message = "State is required") String state,
        @NotBlank(message = "Postal code is required") String zipCode,
        @NotBlank(message = "Country is required") String country)
        implements Serializable {}
