package com.example.pcbuilderecommerce.repository;

import com.example.pcbuilderecommerce.common.ProductType;
import com.example.pcbuilderecommerce.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findByPriceBetweenOrderByPriceAsc(double minPrice, double maxPrice);
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategoryId(Integer categoryId);
    List<Product> findByProductType(ProductType productType);
    List<Product> findByBrandIgnoreCase(String brand);
}
