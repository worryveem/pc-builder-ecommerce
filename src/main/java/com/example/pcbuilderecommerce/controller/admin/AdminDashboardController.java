package com.example.pcbuilderecommerce.controller.admin;

import com.example.pcbuilderecommerce.common.OrderStatus;
import com.example.pcbuilderecommerce.dto.OrderDTO;
import com.example.pcbuilderecommerce.dto.response.ResponseData;
import com.example.pcbuilderecommerce.model.Order;
import com.example.pcbuilderecommerce.model.Product;
import com.example.pcbuilderecommerce.repository.OrderRepository;
import com.example.pcbuilderecommerce.repository.ProductRepository;
import com.example.pcbuilderecommerce.repository.UserRepository;
import com.example.pcbuilderecommerce.service.OrderService;
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

        // Weekly stats (last 7 days)
        java.time.LocalDate today = java.time.LocalDate.now();
        List<Map<String, Object>> weeklyStats = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate day = today.minusDays(i);
            double dayRevenue = orders.stream()
                    .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getCreatedAt() != null)
                    .filter(o -> o.getCreatedAt().toLocalDate().equals(day))
                    .mapToDouble(o -> o.getTotalPrice() != null ? o.getTotalPrice() : 0.0)
                    .sum();
            long dayOrders = orders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().equals(day))
                    .count();

            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("label", day.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM")));
            dayMap.put("fullDate", day.toString());
            dayMap.put("revenue", dayRevenue);
            dayMap.put("orders", dayOrders);
            weeklyStats.add(dayMap);
        }

        // Monthly stats (12 months of current year)
        int currentYear = today.getYear();
        List<Map<String, Object>> monthlyStats = new java.util.ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            final int monthVal = m;
            double monthRevenue = orders.stream()
                    .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getCreatedAt() != null)
                    .filter(o -> o.getCreatedAt().getYear() == currentYear && o.getCreatedAt().getMonthValue() == monthVal)
                    .mapToDouble(o -> o.getTotalPrice() != null ? o.getTotalPrice() : 0.0)
                    .sum();
            long monthOrders = orders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().getYear() == currentYear && o.getCreatedAt().getMonthValue() == monthVal)
                    .count();

            Map<String, Object> monthMap = new HashMap<>();
            monthMap.put("label", "T" + monthVal);
            monthMap.put("fullDate", "Tháng " + monthVal + "/" + currentYear);
            monthMap.put("revenue", monthRevenue);
            monthMap.put("orders", monthOrders);
            monthlyStats.add(monthMap);
        }

        // Yearly stats (last 5 years)
        List<Map<String, Object>> yearlyStats = new java.util.ArrayList<>();
        for (int y = currentYear - 4; y <= currentYear; y++) {
            final int yearVal = y;
            double yearRevenue = orders.stream()
                    .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getCreatedAt() != null)
                    .filter(o -> o.getCreatedAt().getYear() == yearVal)
                    .mapToDouble(o -> o.getTotalPrice() != null ? o.getTotalPrice() : 0.0)
                    .sum();
            long yearOrders = orders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().getYear() == yearVal)
                    .count();

            Map<String, Object> yearMap = new HashMap<>();
            yearMap.put("label", String.valueOf(yearVal));
            yearMap.put("fullDate", "Năm " + yearVal);
            yearMap.put("revenue", yearRevenue);
            yearMap.put("orders", yearOrders);
            yearlyStats.add(yearMap);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalUsers", usersCount);
        stats.put("totalRevenue", totalRevenue);
        stats.put("lowStockCount", lowStockCount);
        stats.put("pendingOrdersCount", pendingOrdersCount);
        stats.put("recentOrders", recentOrders);
        stats.put("weeklyStats", weeklyStats);
        stats.put("monthlyStats", monthlyStats);
        stats.put("yearlyStats", yearlyStats);

        ResponseData response = new ResponseData();
        response.setSuccess(true);
        response.setData(stats);
        return ResponseEntity.ok(response);
    }
}
