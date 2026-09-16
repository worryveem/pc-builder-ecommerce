package com.example.fashionshop.controller;

import com.example.fashionshop.dto.response.ResponseData;
import com.example.fashionshop.service.CartItemService;
import com.example.fashionshop.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private CartItemService cartItemService;

    // hien thi gio hang theo user dang nhap
    @GetMapping
    public ResponseEntity<ResponseData> getCart(Authentication authentication) {

        ResponseData res = new ResponseData();

        if (authentication == null) {
            res.setData("Guest dùng localStorage");
            return ResponseEntity.ok(res);
        }

        String username = authentication.getName();
        res.setData(cartService.getCartByUsername(username));

        return ResponseEntity.ok(res);
    }

    // Xoa toan bo gio hang
    @DeleteMapping("/clear")
    public ResponseEntity<ResponseData> clearCart(Authentication authentication) {
        ResponseData res = new ResponseData();
        if (authentication != null) {
            cartService.clearCartByUsername(authentication.getName());
        }
        res.setSuccess(true);
        res.setMessage("Đã làm trống giỏ hàng");
        return ResponseEntity.ok(res);
    }
}