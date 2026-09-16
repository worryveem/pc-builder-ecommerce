package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.dto.response.WishlistResponse;
import com.example.pcbuilderecommerce.model.Product;
import com.example.pcbuilderecommerce.model.User;
import com.example.pcbuilderecommerce.model.Wishlist;
import com.example.pcbuilderecommerce.repository.ProductRepository;
import com.example.pcbuilderecommerce.repository.UserRepository;
import com.example.pcbuilderecommerce.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public boolean addToWishlist(String username, int productId) {
        User user = userRepository.findByUsername(username);
        if (user == null) return false;

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return false;

        if (wishlistRepository.existsByUserAndProduct(user, product)) {
            return true; // Already in wishlist
        }

        Wishlist wishlist = new Wishlist(user, product);
        wishlistRepository.save(wishlist);
        return true;
    }

    public boolean removeFromWishlist(String username, int productId) {
        User user = userRepository.findByUsername(username);
        if (user == null) return false;

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return false;

        wishlistRepository.deleteByUserAndProduct(user, product);
        return true;
    }

    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist(String username) {
        List<Wishlist> wishlists = wishlistRepository.findByUserUsernameOrderByCreatedAtDesc(username);
        List<WishlistResponse> responses = new ArrayList<>();

        for (Wishlist w : wishlists) {
            Product p = w.getProduct();
            if (p != null) {
                String imgUrl = "hero_kids.png";
                if (p.getImages() != null && !p.getImages().isEmpty()) {
                    imgUrl = p.getImages().get(0).getImageUrl();
                }

                String catName = p.getCategory() != null ? p.getCategory().getName() : "Thời Trang Bé";

                responses.add(new WishlistResponse(
                    w.getId(),
                    Long.valueOf(p.getId()),
                    p.getName(),
                    p.getPrice(),
                    imgUrl,
                    catName,
                    w.getCreatedAt()
                ));
            }
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public boolean isWishlisted(String username, int productId) {
        User user = userRepository.findByUsername(username);
        if (user == null) return false;

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return false;

        return wishlistRepository.existsByUserAndProduct(user, product);
    }
}
