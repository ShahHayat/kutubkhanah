package com.hayat.kutubkhanah_webapp.clients.orders;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.Set;

/**
 * {@code comments} is the "note for the shop" from the checkout page.
 * The order service does not accept it yet (see the API list); it is ignored until then.
 */
public record CreateOrderRequest(
        @NotEmpty(message = "Items cannot be empty.") @NotNull(message = "Items cannot be null.") Set<OrderItem> items,

        @Valid Customer customer,
        @Valid Address deliveryAddress,
        String comments)
        implements Serializable {}
