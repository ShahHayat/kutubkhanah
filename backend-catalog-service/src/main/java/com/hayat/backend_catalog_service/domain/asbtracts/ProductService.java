package com.hayat.backend_catalog_service.domain.asbtracts;

import com.hayat.backend_catalog_service.domain.PagedResult;
import com.hayat.backend_catalog_service.domain.Product;
import java.util.Optional;

public interface ProductService {
    public PagedResult<Product> getProducts(int pageNo);

    public Optional<Product> getProductByCode(String code);
}
