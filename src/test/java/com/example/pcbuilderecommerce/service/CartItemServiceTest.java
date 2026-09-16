package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.Exception.ResourceNotFoundException;
import com.example.pcbuilderecommerce.Exception.UnauthorizedException;
import com.example.pcbuilderecommerce.dto.CartItemDTO;
import com.example.pcbuilderecommerce.dto.response.products.ProductsResponse;
import com.example.pcbuilderecommerce.model.*;
import com.example.pcbuilderecommerce.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartItemServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PCConfigurationRepository pcConfigurationRepository;

    @Mock
    private ProductService productService;

    @InjectMocks
    private CartItemService cartItemService;

    private User sampleUser;
    private Cart sampleCart;
    private Product sampleProduct;
    private CartItem sampleCartItem;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("user1");

        sampleCart = new Cart();
        sampleCart.setId(10);
        sampleCart.setUser(sampleUser);

        sampleProduct = new Product();
        sampleProduct.setId(101);
        sampleProduct.setName("RTX 4070 Super");
        sampleProduct.setPrice(16500000.0);
        sampleProduct.setImages(new ArrayList<>());

        sampleCartItem = new CartItem();
        sampleCartItem.setId(20);
        sampleCartItem.setCart(sampleCart);
        sampleCartItem.setProduct(sampleProduct);
        sampleCartItem.setQuantity(2);
    }

    @Test
    @DisplayName("getCartItemById returns CartItemDTO when item exists")
    void testGetCartItemById_Found() {
        when(cartItemRepository.findById(20L)).thenReturn(Optional.of(sampleCartItem));
        ProductsResponse prodRes = new ProductsResponse();
        prodRes.setId(101);
        prodRes.setName("RTX 4070 Super");
        when(productService.mapToProductResponse(sampleProduct)).thenReturn(prodRes);

        CartItemDTO dto = cartItemService.getCartItemById(20L);

        assertNotNull(dto);
        assertEquals(Integer.valueOf(20), dto.getId());
        assertEquals(2, dto.getQuantity());
        assertEquals("RTX 4070 Super", dto.getProduct().getName());
    }

    @Test
    @DisplayName("getCartItemById returns null when not found")
    void testGetCartItemById_NotFound() {
        when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

        CartItemDTO dto = cartItemService.getCartItemById(999L);

        assertNull(dto);
    }

    @Test
    @DisplayName("addToCart throws UnauthorizedException when username is null")
    void testAddToCart_GuestThrowsUnauthorizedException() {
        UnauthorizedException ex = assertThrows(
                UnauthorizedException.class,
                () -> cartItemService.addToCart(null, 101L, 1, null)
        );

        assertEquals("Guest không dùng DB cart", ex.getMessage());
    }

    @Test
    @DisplayName("addToCart throws ResourceNotFoundException when user does not exist")
    void testAddToCart_UserNotFoundThrowsResourceNotFoundException() {
        when(userRepository.findByUsername("unknownUser")).thenReturn(null);

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> cartItemService.addToCart("unknownUser", 101L, 1, null)
        );

        assertEquals("User not found", ex.getMessage());
    }

    @Test
    @DisplayName("addToCart increments quantity when item already in cart")
    void testAddToCart_ItemAlreadyExistsIncrementsQuantity() {
        when(userRepository.findByUsername("user1")).thenReturn(sampleUser);
        when(cartRepository.findByUserId(1L)).thenReturn(sampleCart);
        when(productRepository.findById(101)).thenReturn(Optional.of(sampleProduct));
        when(cartItemRepository.findByCartIdAndProductId(10, 101)).thenReturn(sampleCartItem);

        cartItemService.addToCart("user1", 101L, 3, null);

        assertEquals(5, sampleCartItem.getQuantity()); // 2 + 3
        verify(cartItemRepository, times(1)).save(sampleCartItem);
    }

    @Test
    @DisplayName("addToCart creates new cart and item when not existing")
    void testAddToCart_NewCartAndNewItem() {
        when(userRepository.findByUsername("user1")).thenReturn(sampleUser);
        when(cartRepository.findByUserId(1L)).thenReturn(null);
        when(cartRepository.save(any(Cart.class))).thenReturn(sampleCart);
        when(productRepository.findById(101)).thenReturn(Optional.of(sampleProduct));
        when(cartItemRepository.findByCartIdAndProductId(any(), any())).thenReturn(null);

        cartItemService.addToCart("user1", 101L, 1, null);

        verify(cartRepository, times(1)).save(any(Cart.class));
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    @DisplayName("updateQuantity returns false when cart item not found")
    void testUpdateQuantity_NotFound() {
        when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

        boolean result = cartItemService.updateQuantity(999L, 5);

        assertFalse(result);
    }

    @Test
    @DisplayName("updateQuantity deletes item when quantity is zero or negative")
    void testUpdateQuantity_ZeroOrNegativeDeletesItem() {
        when(cartItemRepository.findById(20L)).thenReturn(Optional.of(sampleCartItem));

        boolean result = cartItemService.updateQuantity(20L, 0);

        assertTrue(result);
        verify(cartItemRepository, times(1)).delete(sampleCartItem);
    }

    @Test
    @DisplayName("updateQuantity updates quantity when positive")
    void testUpdateQuantity_PositiveUpdatesQuantity() {
        when(cartItemRepository.findById(20L)).thenReturn(Optional.of(sampleCartItem));

        boolean result = cartItemService.updateQuantity(20L, 4);

        assertTrue(result);
        assertEquals(4, sampleCartItem.getQuantity());
        verify(cartItemRepository, times(1)).save(sampleCartItem);
    }

    @Test
    @DisplayName("deleteCartItem deletes by id and returns true")
    void testDeleteCartItem_Success() {
        doNothing().when(cartItemRepository).deleteById(20L);

        boolean result = cartItemService.deleteCartItem(20L);

        assertTrue(result);
        verify(cartItemRepository, times(1)).deleteById(20L);
    }

    @Test
    @DisplayName("deleteCartItem returns false when exception occurs")
    void testDeleteCartItem_Exception() {
        doThrow(new RuntimeException("DB error")).when(cartItemRepository).deleteById(20L);

        boolean result = cartItemService.deleteCartItem(20L);

        assertFalse(result);
    }
}
