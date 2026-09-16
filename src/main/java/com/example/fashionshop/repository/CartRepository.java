package com.example.fashionshop.repository;

import com.example.fashionshop.model.Cart;
import com.example.fashionshop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    Cart findByUser(User user);

    Cart findByUserId(Long id);
}
