package com.example.fashionshop.repository;

import com.example.fashionshop.model.Product;
import com.example.fashionshop.model.User;
import com.example.fashionshop.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserOrderByCreatedAtDesc(User user);
    List<Wishlist> findByUserUsernameOrderByCreatedAtDesc(String username);
    boolean existsByUserAndProduct(User user, Product product);
    Optional<Wishlist> findByUserAndProduct(User user, Product product);
    void deleteByUserAndProduct(User user, Product product);
}
