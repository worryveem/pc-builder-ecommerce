package com.example.pcbuilderecommerce.repository;

import com.example.pcbuilderecommerce.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Integer> {
    List<Rating> findByProductId(Integer productId);
    Rating findByUserIdAndProductId(Long userId, Integer productId);
}
