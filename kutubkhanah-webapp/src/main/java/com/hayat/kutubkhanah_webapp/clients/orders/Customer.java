package com.hayat.kutubkhanah_webapp.clients.orders;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

public record Customer(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Email is required") @Email String email,
        @NotBlank(message = "Phone number is required") String phone)
        implements Serializable {}
