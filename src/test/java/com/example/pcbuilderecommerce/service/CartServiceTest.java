package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.dto.CartDTO;
import com.example.pcbuilderecommerce.dto.response.products.ProductsResponse;
import com.example.pcbuilderecommerce.model.*;
import com.example.pcbuilderecommerce.repository.CartItemRepository;
import com.example.pcbuilderecommerce.repository.CartRepository;
import com.example.pcbuilderecommerce.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductService productService;

    @InjectMocks
    private CartService cartService;

    private User sampleUser;
    private Cart sampleCart;
    private Product sampleProduct;
    private CartItem sampleCartItem;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("testuser");

        sampleCart = new Cart();
        sampleCart.setId(10);
        sampleCart.setUser(sampleUser);
        sampleCart.setTotalPrice(0.0);

        sampleProduct = new Product();
        sampleProduct.setId(100);
        sampleProduct.setName("CPU Core i5");
        sampleProduct.setPrice(5000000.0);

        sampleCartItem = new CartItem();
        sampleCartItem.setId(1000);
        sampleCartItem.setCart(sampleCart);
        sampleCartItem.setProduct(sampleProduct);
        sampleCartItem.setQuantity(2);
    }

    @Test
    @DisplayName("getCartByUsername returns empty CartDTO when user not found")
    void testGetCartByUsername_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(null);

        CartDTO result = cartService.getCartByUsername("unknown");

        assertNotNull(result);
        assertNull(result.getItems());
        verify(cartRepository, never()).findByUserId(anyLong());
    }

    @Test
    @DisplayName("getCartByUsername creates new Cart when user has no cart yet")
    void testGetCartByUsername_CartDoesNotExist_CreatesNewCart() {
        when(userRepository.findByUsername("testuser")).thenReturn(sampleUser);
        when(cartRepository.findByUserId(1L)).thenReturn(null);
        when(cartRepository.save(any(Cart.class))).thenReturn(sampleCart);
        when(cartItemRepository.findByCartId(10)).thenReturn(new ArrayList<>());

        CartDTO result = cartService.getCartByUsername("testuser");

        assertNotNull(result);
        assertNotNull(result.getItems());
        assertTrue(result.getItems().isEmpty());
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    @DisplayName("getCartByUsername returns cart items and calculates total price correctly")
    void testGetCartByUsername_WithItems() {
        when(userRepository.findByUsername("testuser")).thenReturn(sampleUser);
        when(cartRepository.findByUserId(1L)).thenReturn(sampleCart);
        when(cartItemRepository.findByCartId(10)).thenReturn(List.of(sampleCartItem));

        ProductsResponse prodResponse = new ProductsResponse();
        prodResponse.setId(100);
        prodResponse.setName("CPU Core i5");
        prodResponse.setPrice(5000000.0);
        when(productService.mapToProductResponse(sampleProduct)).thenReturn(prodResponse);

        CartDTO result = cartService.getCartByUsername("testuser");

        assertNotNull(result);
        assertEquals(1, result.getItems().size());
        assertEquals(1000, result.getItems().get(0).getId().intValue());
        assertEquals(2, result.getItems().get(0).getQuantity());
        assertEquals("CPU Core i5", result.getItems().get(0).getProduct().getName());
        assertEquals(10000000.0, sampleCart.getTotalPrice());
    }

    @Test
    @DisplayName("clearCartByUsername does nothing when username is null or user not found")
    void testClearCartByUsername_UserNull() {
        cartService.clearCartByUsername(null);
        verify(cartRepository, never()).findByUserId(anyLong());

        when(userRepository.findByUsername("notfound")).thenReturn(null);
        cartService.clearCartByUsername("notfound");
        verify(cartRepository, never()).findByUserId(anyLong());
    }

    @Test
    @DisplayName("clearCartByUsername deletes all items and resets total price to 0")
    void testClearCartByUsername_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(sampleUser);
        when(cartRepository.findByUserId(1L)).thenReturn(sampleCart);
        when(cartItemRepository.findByCartId(10)).thenReturn(List.of(sampleCartItem));

        cartService.clearCartByUsername("testuser");

        verify(cartItemRepository, times(1)).deleteAll(List.of(sampleCartItem));
        assertEquals(0.0, sampleCart.getTotalPrice());
        verify(cartRepository, times(1)).save(sampleCart);
    }
}
