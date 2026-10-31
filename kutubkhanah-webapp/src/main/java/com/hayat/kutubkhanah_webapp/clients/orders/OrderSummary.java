package com.hayat.kutubkhanah_webapp.clients.orders;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OrderSummary(String orderNumber, OrderStatus status) {}
