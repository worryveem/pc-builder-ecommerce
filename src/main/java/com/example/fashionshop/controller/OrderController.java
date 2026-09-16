package com.example.fashionshop.controller;

import com.example.fashionshop.dto.OrderDTO;
import com.example.fashionshop.common.OrderStatus;
import com.example.fashionshop.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/order")
public class OrderController {
    @Autowired
    private OrderService orderService;

    // hien thi don hang
    @GetMapping("/user")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {

        String username = authentication.getName();
        List<OrderDTO> orders = orderService.getOrdersByUsername(username);

        return ResponseEntity.ok(orders);
    }

    // hien thi don hang theo status
    @GetMapping("/user/status")
    public ResponseEntity<?> getMyOrdersByStatus(
            Authentication authentication,
            @RequestParam OrderStatus status) {

        String username = authentication.getName();
        return ResponseEntity.ok(
                orderService.getOrdersByUsernameAndStatus(username, status)
        );
    }

    // hien thi chi tiet don hang
    @GetMapping("/user/{id}")
    public ResponseEntity<?> getMyOrderDetail(
            @PathVariable long id,
            Authentication authentication) {

        String username = authentication.getName();
        return ResponseEntity.ok(
                orderService.getOrderDetailForUser(id, username)
        );
    }

    // xoa don hang
    @PutMapping("/user/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable long id,
            Authentication authentication) {

        String username = authentication.getName();
        return ResponseEntity.ok(
                orderService.cancelOrderByUser(id, username)
        );
    }

    // xem don hang (guest)
    @GetMapping("/guest")
    public ResponseEntity<?> getOrdersByEmail(@RequestParam String email) {
        return ResponseEntity.ok(orderService.getOrdersByEmail(email));
    }

    // hien thi chi tiet don hang (guest)
    @GetMapping("/guest/{id}")
    public ResponseEntity<?> getGuestOrderDetail(
            @PathVariable long id,
            @RequestParam String email) {

        return ResponseEntity.ok(
                orderService.getOrderDetailForGuest(id, email)
        );
    }

    // xoa don hang (guest)
    @PutMapping("/guest/{id}/cancel")
    public ResponseEntity<?> cancelGuestOrder(
            @PathVariable long id,
            @RequestParam String email) {

        return ResponseEntity.ok(
                orderService.cancelOrderByGuest(id, email)
        );
    }

    // dat hang (user + guest)
    @PostMapping
    public ResponseEntity<?> placeOrder(
            @RequestBody OrderDTO request,
            Authentication authentication) {

        String username = null;

        if (authentication != null) {
            username = authentication.getName();
        }

        boolean result = orderService.placeOrder(request, username);
        return ResponseEntity.ok(result);
    }
}