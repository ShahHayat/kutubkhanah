package com.hayat.backend_order_service.domain;

import jakarta.persistence.*;
import lombok.*;

public class InvalidOrderException extends RuntimeException {
    public InvalidOrderException(String message) {
        super(message);
    }
}
