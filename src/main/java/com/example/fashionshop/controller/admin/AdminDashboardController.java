package com.example.fashionshop.controller.admin;

import com.example.fashionshop.common.OrderStatus;
import com.example.fashionshop.dto.OrderDTO;
import com.example.fashionshop.dto.response.ResponseData;
import com.example.fashionshop.model.Order;
import com.example.fashionshop.model.Product;
import com.example.fashionshop.repository.OrderRepository;
import com.example.fashionshop.repository.ProductRepository;
import com.example.fashionshop.repository.UserRepository;
import com.example.fashionshop.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderService orderService;

    @GetMapping("/stats")
    public ResponseEntity<ResponseData> getDashboardStats() {
        List<Product> products = productRepository.findAll();
        List<Order> orders = orderRepository.findAll();
        long usersCount = userRepository.count();

        long totalProducts = products.size();
        long totalOrders = orders.size();

        double totalRevenue = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(o -> o.getTotalPrice() != null ? o.getTotalPrice() : 0.0)
                .sum();

        long lowStockCount = products.stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() < 5)
                .count();

        long pendingOrdersCount = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING)
                .count();

        // Recent 5 orders
        List<OrderDTO> recentOrders = orderService.getAllOrders().stream()
                .limit(5)
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalUsers", usersCount);
        stats.put("totalRevenue", totalRevenue);
        stats.put("lowStockCount", lowStockCount);
        stats.put("pendingOrdersCount", pendingOrdersCount);
        stats.put("recentOrders", recentOrders);

        ResponseData response = new ResponseData();
        response.setSuccess(true);
        response.setData(stats);
        return ResponseEntity.ok(response);
    }
}
