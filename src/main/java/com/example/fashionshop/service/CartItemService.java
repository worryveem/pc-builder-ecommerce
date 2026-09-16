package com.example.fashionshop.service;

import com.example.fashionshop.Exception.ResourceNotFoundException;
import com.example.fashionshop.Exception.UnauthorizedException;
import com.example.fashionshop.dto.CartItemDTO;
import com.example.fashionshop.model.Cart;
import com.example.fashionshop.model.CartItem;
import com.example.fashionshop.model.PCConfiguration;
import com.example.fashionshop.model.Product;
import com.example.fashionshop.model.User;
import com.example.fashionshop.repository.CartItemRepository;
import com.example.fashionshop.repository.CartRepository;
import com.example.fashionshop.repository.PCConfigurationRepository;
import com.example.fashionshop.repository.ProductRepository;
import com.example.fashionshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PCConfigurationRepository pcConfigurationRepository;

    @Autowired
    private ProductService productService;

    // Chi tiết sản phẩm trong giỏ hàng
    public CartItemDTO getCartItemById(Long id) {
        CartItem cartItem = cartItemRepository.findById(id).orElse(null);
        if (cartItem == null) return null;

        CartItemDTO cartItemDTO = new CartItemDTO();
        cartItemDTO.setId(cartItem.getId());
        cartItemDTO.setQuantity(cartItem.getQuantity());

        if (cartItem.getProduct() != null) {
            cartItemDTO.setProduct(productService.mapToProductResponse(cartItem.getProduct()));
        }

        if (cartItem.getConfiguration() != null) {
            cartItemDTO.setConfigurationId(cartItem.getConfiguration().getId());
        }

        return cartItemDTO;
    }

    // Thêm sản phẩm vào giỏ hàng
    public void addToCart(String username, Long productId, Integer quantity, Integer configurationId) {
        if (username == null) {
            throw new UnauthorizedException("Guest không dùng DB cart");
        }

        User user = userRepository.findByUsername(username);
        if (user == null) throw new ResourceNotFoundException("User not found");

        Cart cart = cartRepository.findByUserId(user.getId());
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart = cartRepository.save(cart);
        }

        Product product = productRepository.findById(productId.intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        PCConfiguration configuration = null;
        if (configurationId != null) {
            configuration = pcConfigurationRepository.findById(configurationId).orElse(null);
        }

        int qtyToAdd = (quantity != null && quantity > 0) ? quantity : 1;

        CartItem existing;
        if (configurationId != null) {
            existing = cartItemRepository.findByCartIdAndProductIdAndConfigurationId(cart.getId(), product.getId(), configurationId);
        } else {
            existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        }

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + qtyToAdd);
            cartItemRepository.save(existing);
            return;
        }

        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(product);
        item.setConfiguration(configuration);
        item.setQuantity(qtyToAdd);

        cartItemRepository.save(item);
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    public boolean updateQuantity(long id, int quantity) {
        CartItem item = cartItemRepository.findById(id).orElse(null);
        if (item == null) return false;
        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return true;
        }
        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return true;
    }

    // Xóa sản phẩm khỏi giỏ hàng
    public boolean deleteCartItem(long id) {
        try {
            cartItemRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}