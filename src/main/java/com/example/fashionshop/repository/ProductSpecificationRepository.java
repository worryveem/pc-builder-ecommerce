package com.example.fashionshop.repository;

import com.example.fashionshop.model.ProductSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductSpecificationRepository extends JpaRepository<ProductSpecification, Integer> {
    Optional<ProductSpecification> findByProductId(Integer productId);
}
