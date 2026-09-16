package com.example.pcbuilderecommerce.repository;

import com.example.pcbuilderecommerce.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    CartItem findByCartIdAndProductId(Integer cartId, Integer productId);

    CartItem findByCartIdAndProductIdAndConfigurationId(Integer cartId, Integer productId, Integer configurationId);

    List<CartItem> findByCartId(Integer id);
}
