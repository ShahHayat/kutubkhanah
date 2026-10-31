package com.hayat.kutubkhanah_webapp.clients.orders;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CreateOrderResponse(String orderNumber) {}
