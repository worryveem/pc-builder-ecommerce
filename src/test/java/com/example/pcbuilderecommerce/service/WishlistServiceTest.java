package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.dto.response.WishlistResponse;
import com.example.pcbuilderecommerce.model.Category;
import com.example.pcbuilderecommerce.model.Product;
import com.example.pcbuilderecommerce.model.ProductImage;
import com.example.pcbuilderecommerce.model.User;
import com.example.pcbuilderecommerce.model.Wishlist;
import com.example.pcbuilderecommerce.repository.ProductRepository;
import com.example.pcbuilderecommerce.repository.UserRepository;
import com.example.pcbuilderecommerce.repository.WishlistRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WishlistServiceTest {

    @Mock
    private WishlistRepository wishlistRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private WishlistService wishlistService;

    private User sampleUser;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("kid_mom");

        sampleProduct = new Product();
        sampleProduct.setId(101);
        sampleProduct.setName("Mũ Vành Tròn Cho Bé");
        sampleProduct.setPrice(95000.0);
        sampleProduct.setImages(new ArrayList<>());
    }

    @Test
    @DisplayName("addToWishlist returns false when user does not exist")
    void testAddToWishlist_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(null);

        boolean result = wishlistService.addToWishlist("unknown", 101);

        assertFalse(result);
        verify(wishlistRepository, never()).save(any());
    }

    @Test
    @DisplayName("addToWishlist returns false when product does not exist")
    void testAddToWishlist_ProductNotFound() {
        when(userRepository.findByUsername("kid_mom")).thenReturn(sampleUser);
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        boolean result = wishlistService.addToWishlist("kid_mom", 999);

        assertFalse(result);
        verify(wishlistRepository, never()).save(any());
    }

    @Test
    @DisplayName("addToWishlist returns true without duplicate save if already wishlisted")
    void testAddToWishlist_AlreadyExists() {
        when(userRepository.findByUsername("kid_mom")).thenReturn(sampleUser);
        when(productRepository.findById(101)).thenReturn(Optional.of(sampleProduct));
        when(wishlistRepository.existsByUserAndProduct(sampleUser, sampleProduct)).thenReturn(true);

        boolean result = wishlistService.addToWishlist("kid_mom", 101);

        assertTrue(result);
        verify(wishlistRepository, never()).save(any());
    }

    @Test
    @DisplayName("addToWishlist saves wishlist and returns true for new item")
    void testAddToWishlist_Success() {
        when(userRepository.findByUsername("kid_mom")).thenReturn(sampleUser);
        when(productRepository.findById(101)).thenReturn(Optional.of(sampleProduct));
        when(wishlistRepository.existsByUserAndProduct(sampleUser, sampleProduct)).thenReturn(false);

        boolean result = wishlistService.addToWishlist("kid_mom", 101);

        assertTrue(result);
        verify(wishlistRepository, times(1)).save(any(Wishlist.class));
    }

    @Test
    @DisplayName("removeFromWishlist returns false when user or product not found")
    void testRemoveFromWishlist_NotFound() {
        when(userRepository.findByUsername("kid_mom")).thenReturn(null);
        assertFalse(wishlistService.removeFromWishlist("kid_mom", 101));

        when(userRepository.findByUsername("kid_mom")).thenReturn(sampleUser);
        when(productRepository.findById(999)).thenReturn(Optional.empty());
        assertFalse(wishlistService.removeFromWishlist("kid_mom", 999));
    }

    @Test
    @DisplayName("removeFromWishlist deletes item and returns true")
    void testRemoveFromWishlist_Success() {
        when(userRepository.findByUsername("kid_mom")).thenReturn(sampleUser);
        when(productRepository.findById(101)).thenReturn(Optional.of(sampleProduct));
        doNothing().when(wishlistRepository).deleteByUserAndProduct(sampleUser, sampleProduct);

        boolean result = wishlistService.removeFromWishlist("kid_mom", 101);

        assertTrue(result);
        verify(wishlistRepository, times(1)).deleteByUserAndProduct(sampleUser, sampleProduct);
    }

    @Test
    @DisplayName("getWishlist returns mapped wishlist items with proper image and category")
    void testGetWishlist() {
        ProductImage img = new ProductImage();
        img.setImageUrl("hat.png");
        sampleProduct.getImages().add(img);

        Category cat = new Category();
        cat.setName("Phụ Kiện");
        sampleProduct.setCategory(cat);

        Wishlist w = new Wishlist(sampleUser, sampleProduct);
        w.setId(10L);
        w.setCreatedAt(LocalDateTime.now());

        when(wishlistRepository.findByUserUsernameOrderByCreatedAtDesc("kid_mom"))
                .thenReturn(List.of(w));

        List<WishlistResponse> list = wishlistService.getWishlist("kid_mom");

        assertEquals(1, list.size());
        assertEquals(10L, list.get(0).getId());
        assertEquals("Mũ Vành Tròn Cho Bé", list.get(0).getProductName());
        assertEquals("hat.png", list.get(0).getImageUrl());
        assertEquals("Phụ Kiện", list.get(0).getCategoryName());
    }

    @Test
    @DisplayName("isWishlisted returns true if exists, false otherwise")
    void testIsWishlisted() {
        when(userRepository.findByUsername("kid_mom")).thenReturn(sampleUser);
        when(productRepository.findById(101)).thenReturn(Optional.of(sampleProduct));
        when(wishlistRepository.existsByUserAndProduct(sampleUser, sampleProduct)).thenReturn(true);

        assertTrue(wishlistService.isWishlisted("kid_mom", 101));

        when(wishlistRepository.existsByUserAndProduct(sampleUser, sampleProduct)).thenReturn(false);
        assertFalse(wishlistService.isWishlisted("kid_mom", 101));
    }
}
