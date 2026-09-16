package com.example.pcbuilderecommerce.repository;

import com.example.pcbuilderecommerce.model.PCConfigurationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PCConfigurationItemRepository extends JpaRepository<PCConfigurationItem, Integer> {
    List<PCConfigurationItem> findByConfigurationId(Integer configurationId);
}
