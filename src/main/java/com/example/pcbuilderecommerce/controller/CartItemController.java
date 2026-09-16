package com.example.pcbuilderecommerce.controller;

import com.example.pcbuilderecommerce.dto.response.ResponseData;
import com.example.pcbuilderecommerce.service.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/cart/items")
public class CartItemController {

    @Autowired
    private CartItemService cartItemService;

    // thêm sản phẩm vào cart (user)
    @PostMapping
    public ResponseEntity<ResponseData> addToCart(
            Authentication authentication,
            @RequestParam Long productId,
            @RequestParam(required = false, defaultValue = "1") Integer quantity,
            @RequestParam(required = false) Integer configurationId) {

        ResponseData res = new ResponseData();

        if (authentication == null) {
            res.setData("Guest dùng localStorage, không gọi API này");
            return ResponseEntity.ok(res);
        }

        String username = authentication.getName();

        cartItemService.addToCart(username, productId, quantity, configurationId);

        res.setData("Add to cart success");
        return ResponseEntity.ok(res);
    }

    // xóa sp trong cart (user)
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData> delete(@PathVariable long id) {
        ResponseData res = new ResponseData();
        res.setData(cartItemService.deleteCartItem(id));
        return ResponseEntity.ok(res);
    }

    // xem chi tiết sp trong cart
    @GetMapping("/{id}")
    public ResponseEntity<ResponseData> getCartItem(@PathVariable Long id) {
        ResponseData responseData = new ResponseData();
        responseData.setData(cartItemService.getCartItemById(id));
        return ResponseEntity.ok(responseData);
    }

    // cập nhật số lượng sp trong cart
    @PutMapping("/{id}")
    public ResponseEntity<ResponseData> updateQuantity(@PathVariable long id, @RequestParam int quantity) {
        ResponseData res = new ResponseData();
        res.setData(cartItemService.updateQuantity(id, quantity));
        return ResponseEntity.ok(res);
    }
}