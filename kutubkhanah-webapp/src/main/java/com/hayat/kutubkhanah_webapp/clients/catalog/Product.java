package com.hayat.kutubkhanah_webapp.clients.catalog;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

/**
 * A book from the catalog. {@code author} is not served by the catalog yet; it stays null until that API exists.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record Product(String code, String name, String author, String description, String imageUrl, BigDecimal price) {}
