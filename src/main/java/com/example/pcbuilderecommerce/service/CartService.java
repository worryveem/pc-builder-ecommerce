package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.dto.CartDTO;
import com.example.pcbuilderecommerce.dto.CartItemDTO;
import com.example.pcbuilderecommerce.model.*;
import com.example.pcbuilderecommerce.repository.CartItemRepository;
import com.example.pcbuilderecommerce.repository.CartRepository;
import com.example.pcbuilderecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductService productService;

    // hiển thị ds sản phẩm trong giỏ hàng
    public CartDTO getCartByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) return new CartDTO();

        Cart cart = cartRepository.findByUserId(user.getId());

        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart = cartRepository.save(cart);
        }

        return convertToDTO(cart);
    }

    private CartDTO convertToDTO(Cart cart) {
        CartDTO cartDTO = new CartDTO();
        List<CartItemDTO> cartItemDTOs = new ArrayList<>();

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        double totalPrice = 0.0;

        for (CartItem item : cartItems) {
            CartItemDTO dto = new CartItemDTO();
            dto.setId(item.getId());
            dto.setQuantity(item.getQuantity());

            Product product = item.getProduct();
            if (product != null) {
                dto.setProduct(productService.mapToProductResponse(product));
                totalPrice += (product.getPrice() != null ? product.getPrice() : 0.0) * item.getQuantity();
            }

            if (item.getConfiguration() != null) {
                dto.setConfigurationId(item.getConfiguration().getId());
            }

            cartItemDTOs.add(dto);
        }

        cart.setTotalPrice(totalPrice);
        cartDTO.setItems(cartItemDTOs);
        return cartDTO;
    }

    public void clearCartByUsername(String username) {
        if (username == null) return;
        User user = userRepository.findByUsername(username);
        if (user == null) return;

        Cart cart = cartRepository.findByUserId(user.getId());
        if (cart != null) {
            List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
            if (items != null && !items.isEmpty()) {
                cartItemRepository.deleteAll(items);
            }
            cart.setTotalPrice(0.0);
            cartRepository.save(cart);
        }
    }
}