package com.example.pcbuilderecommerce.controller;

import com.example.pcbuilderecommerce.Exception.GlobalExceptionHandler;
import com.example.pcbuilderecommerce.dto.CartDTO;
import com.example.pcbuilderecommerce.service.CartItemService;
import com.example.pcbuilderecommerce.service.CartService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class CartControllerTest {

    private MockMvc mockMvc;

    @Mock
    private CartService cartService;

    @Mock
    private CartItemService cartItemService;

    @InjectMocks
    private CartController cartController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(cartController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/user/cart returns guest message when not authenticated")
    void testGetCart_Guest() throws Exception {
        mockMvc.perform(get("/api/user/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("Guest dùng localStorage"));

        verify(cartService, never()).getCartByUsername(anyString());
    }

    @Test
    @DisplayName("GET /api/user/cart returns user cart when authenticated")
    void testGetCart_Authenticated() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken("customer1", "password", Collections.emptyList());

        CartDTO cartDTO = new CartDTO();
        cartDTO.setItems(Collections.emptyList());
        when(cartService.getCartByUsername("customer1")).thenReturn(cartDTO);

        mockMvc.perform(get("/api/user/cart").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isMap());

        verify(cartService, times(1)).getCartByUsername("customer1");
    }

    @Test
    @DisplayName("DELETE /api/user/cart/clear clears cart successfully")
    void testClearCart() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken("customer1", "password", Collections.emptyList());

        mockMvc.perform(delete("/api/user/cart/clear").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đã làm trống giỏ hàng"));

        verify(cartService, times(1)).clearCartByUsername("customer1");
    }
}
