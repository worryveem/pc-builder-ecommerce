package com.example.pcbuilderecommerce.repository;

import com.example.pcbuilderecommerce.model.ProductSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductSpecificationRepository extends JpaRepository<ProductSpecification, Integer> {
    Optional<ProductSpecification> findByProductId(Integer productId);
}
