package com.example.fashionshop.repository;

import com.example.fashionshop.model.PCConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PCConfigurationRepository extends JpaRepository<PCConfiguration, Integer> {
    List<PCConfiguration> findByUserId(Integer userId);
    Optional<PCConfiguration> findByShareToken(String shareToken);
}
