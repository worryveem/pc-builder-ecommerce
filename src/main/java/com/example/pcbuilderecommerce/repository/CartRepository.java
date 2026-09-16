package com.example.pcbuilderecommerce.repository;

import com.example.pcbuilderecommerce.model.Cart;
import com.example.pcbuilderecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    Cart findByUser(User user);

    Cart findByUserId(Long id);
}
