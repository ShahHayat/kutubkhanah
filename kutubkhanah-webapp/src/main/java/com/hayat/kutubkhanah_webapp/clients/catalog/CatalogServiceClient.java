package com.hayat.kutubkhanah_webapp.clients.catalog;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;

/**
 * Calls the catalog service through the API gateway.
 * The paths mirror the gateway route ({@code /catalog/**}) and the catalog controller ({@code /api/product}).
 */
public interface CatalogServiceClient {

    @GetExchange("/catalog/api/product")
    PagedResult<Product> getProducts(@RequestParam int page);

    @GetExchange("/catalog/api/product/{code}")
    Product getProductByCode(@PathVariable String code);
}
