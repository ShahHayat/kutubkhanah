package com.hayat.kutubkhanah_webapp.web.controllers;

import com.hayat.kutubkhanah_webapp.clients.catalog.CatalogServiceClient;
import com.hayat.kutubkhanah_webapp.clients.catalog.PagedResult;
import com.hayat.kutubkhanah_webapp.clients.catalog.Product;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
class ProductController {
    private static final Logger log = LoggerFactory.getLogger(ProductController.class);
    private final CatalogServiceClient catalogService;

    ProductController(CatalogServiceClient catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/")
    String index() {
        return "index";
    }

    @GetMapping("/products")
    String showProductsPage(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "q", defaultValue = "") String query,
            Model model) {
        model.addAttribute("pageNo", page);
        model.addAttribute("query", query);
        return "products";
    }

    @GetMapping("/products/{code}")
    String showProductPage(@PathVariable String code, Model model) {
        model.addAttribute("code", code);
        return "product";
    }

    @GetMapping("/api/products")
    @ResponseBody
    PagedResult<Product> products(@RequestParam(name = "page", defaultValue = "1") int page) {
        log.info("Fetching products for page: {}", page);
        return catalogService.getProducts(page);
    }

    @GetMapping("/api/products/{code}")
    @ResponseBody
    Product product(@PathVariable String code) {
        log.info("Fetching product for code: {}", code);
        return catalogService.getProductByCode(code);
    }
}
