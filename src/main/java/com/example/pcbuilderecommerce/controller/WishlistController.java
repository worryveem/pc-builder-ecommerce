package com.example.pcbuilderecommerce.controller;

import com.example.pcbuilderecommerce.dto.response.ResponseData;
import com.example.pcbuilderecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping("")
    public ResponseEntity<?> getWishlist(Authentication authentication) {
        ResponseData response = new ResponseData();
        if (authentication == null || !authentication.isAuthenticated()) {
            response.setSuccess(false);
            response.setMessage("Vui lòng đăng nhập để xem danh sách yêu thích");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        response.setSuccess(true);
        response.setData(wishlistService.getWishlist(authentication.getName()));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable int productId, Authentication authentication) {
        ResponseData response = new ResponseData();
        if (authentication == null || !authentication.isAuthenticated()) {
            response.setSuccess(false);
            response.setMessage("Vui lòng đăng nhập để lưu vào yêu thích");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        boolean success = wishlistService.addToWishlist(authentication.getName(), productId);
        response.setSuccess(success);
        response.setMessage(success ? "Đã thêm vào danh sách yêu thích" : "Không thể thêm vào yêu thích");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable int productId, Authentication authentication) {
        ResponseData response = new ResponseData();
        if (authentication == null || !authentication.isAuthenticated()) {
            response.setSuccess(false);
            response.setMessage("Vui lòng đăng nhập");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }

        boolean success = wishlistService.removeFromWishlist(authentication.getName(), productId);
        response.setSuccess(success);
        response.setMessage(success ? "Đã xóa khỏi danh sách yêu thích" : "Không thể xóa");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<?> checkWishlist(@PathVariable int productId, Authentication authentication) {
        ResponseData response = new ResponseData();
        if (authentication == null || !authentication.isAuthenticated()) {
            response.setSuccess(true);
            response.setData(false);
            return ResponseEntity.ok(response);
        }

        boolean isWishlisted = wishlistService.isWishlisted(authentication.getName(), productId);
        response.setSuccess(true);
        response.setData(isWishlisted);
        return ResponseEntity.ok(response);
    }
}
