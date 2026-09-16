package com.example.fashionshop.repository;

import com.example.fashionshop.model.PCConfigurationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PCConfigurationItemRepository extends JpaRepository<PCConfigurationItem, Integer> {
    List<PCConfigurationItem> findByConfigurationId(Integer configurationId);
}
