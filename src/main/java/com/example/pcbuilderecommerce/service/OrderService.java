package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.common.OrderStatus;
import com.example.pcbuilderecommerce.common.PaymentMethod;
import com.example.pcbuilderecommerce.common.PaymentStatus;
import com.example.pcbuilderecommerce.dto.*;
import com.example.pcbuilderecommerce.model.*;
import com.example.pcbuilderecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PCConfigurationRepository pcConfigurationRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private CartService cartService;

    public List<OrderDTO> getAllOrders() {
        List<OrderDTO> request = new ArrayList<>();
        List<Order> orders = orderRepository.findAll();

        for (Order order : orders) {
            if (order == null)
                continue;
            request.add(buildOrderDetail(order));
        }

        return request;
    }

    public OrderDTO getOrderById(long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null)
            return null;
        return buildOrderDetail(order);
    }

    // hủy đơn hàng
    public boolean cancelOrder(long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null)
            return false;

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return true;
    }

    // cập nhật trạng thái đơn hàng
    public boolean updateStatusOrder(long id, String status) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null)
            return false;

        try {
            order.setStatus(OrderStatus.valueOf(status));
        } catch (Exception e) {
            return false;
        }

        orderRepository.save(order);
        return true;
    }

    // hiển thị đơn hàng (user)
    public List<OrderDTO> getOrdersByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null)
            return new ArrayList<>();

        List<Order> orders = orderRepository.findByUserId(user.getId());
        List<OrderDTO> result = new ArrayList<>();

        for (Order order : orders) {
            result.add(buildOrderDetail(order));
        }

        return result;
    }

    // hiển thị đơn hàng theo status (user)
    public List<OrderDTO> getOrdersByUsernameAndStatus(String username, OrderStatus status) {
        User user = userRepository.findByUsername(username);
        if (user == null)
            return new ArrayList<>();

        List<Order> orders = orderRepository.findByUserIdAndStatus(user.getId(), status);
        List<OrderDTO> result = new ArrayList<>();

        for (Order order : orders) {
            result.add(buildOrderDetail(order));
        }

        return result;
    }

    // xem chi tiết đơn hàng (user)
    public OrderDTO getOrderDetailForUser(long id, String username) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null)
            return null;

        if (order.getUser() != null && !order.getUser().getUsername().equals(username)) {
            return null;
        }

        return buildOrderDetail(order);
    }

    // hủy đơn hàng (user)
    public boolean cancelOrderByUser(long id, String username) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null)
            return false;

        if (order.getUser() != null && !order.getUser().getUsername().equals(username)) {
            return false;
        }

        if (order.getStatus() != OrderStatus.PENDING)
            return false;

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return true;
    }

    // hiển thị đơn hàng (guest)
    public List<OrderDTO> getOrdersByEmail(String email) {
        List<Order> orders = orderRepository.findByEmail(email);
        List<OrderDTO> result = new ArrayList<>();

        for (Order order : orders) {
            result.add(buildOrderDetail(order));
        }

        return result;
    }

    // xem chi tiết đơn hàng (guest)
    public OrderDTO getOrderDetailForGuest(long id, String email) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null)
            return null;

        if (!email.equals(order.getEmail()))
            return null;

        return buildOrderDetail(order);
    }

    // hủy đơn hàng (guest)
    public boolean cancelOrderByGuest(long id, String email) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null)
            return false;

        if (!email.equals(order.getEmail()))
            return false;

        if (order.getStatus() != OrderStatus.PENDING)
            return false;

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return true;
    }

    // đặt hàng
    @Transactional
    public boolean placeOrder(OrderDTO request, String username) {
        User user = null;
        boolean isGuest = true;

        if (username != null) {
            user = userRepository.findByUsername(username);
            if (user != null)
                isGuest = false;
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);

        order.setIsGuest(isGuest);
        order.setEmail(request.getEmail());
        order.setPhone(request.getPhone());
        order.setFullName(request.getFullName());
        order.setAddress(request.getAddress());
        order.setNotes(request.getNotes());

        if (request.getVoucherCode() != null) {
            order.setVoucherCode(request.getVoucherCode());
        }
        order.setCreatedAt(java.time.LocalDateTime.now());

        PaymentMethod paymentMethod = PaymentMethod.COD;
        if (request.getPaymentMethod() != null) {
            paymentMethod = request.getPaymentMethod();
        }
        order.setPaymentMethod(paymentMethod);

        List<OrderItem> items = new ArrayList<>();
        double total = 0;

        if (request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
            return false;
        }

        for (OrderItemDTO dto : request.getOrderItems()) {
            Integer prodId = null;
            if (dto.getProduct() != null) {
                prodId = (int) dto.getProduct().getId();
            }

            if (prodId == null)
                continue;

            Product product = productRepository.findById(prodId).orElse(null);
            if (product == null)
                continue;

            double price = (product.getPrice() != null) ? product.getPrice() : 0.0;

            PCConfiguration config = null;
            if (dto.getConfigurationId() != null) {
                config = pcConfigurationRepository.findById(dto.getConfigurationId()).orElse(null);
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setConfiguration(config);
            item.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 1);
            item.setPrice(price);

            total += price * item.getQuantity();
            items.add(item);
        }

        if (items.isEmpty()) {
            return false;
        }

        order.setSubtotal(total);

        double discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : 0;
        if (discount == 0) {
            if (!isGuest && user != null && user.getDiscount_percent() != null) {
                discount = total * user.getDiscount_percent() / 100;
            }
        }
        order.setDiscountAmount(discount);

        double shippingFee = request.getShippingFee() != null ? request.getShippingFee() : 0.0;
        order.setShippingFee(shippingFee);

        order.setItems(items);
        order.setTotalPrice(Math.max(0.0, total - discount + shippingFee));

        orderRepository.save(order);

        // Record voucher usage
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            voucherService.recordVoucherUsage(request.getVoucherCode().trim());
        }

        // Xóa giỏ hàng sau khi đặt hàng thành công
        if (user != null) {
            try {
                cartService.clearCartByUsername(user.getUsername());
            } catch (Exception e) {
                System.err.println("Failed to clear cart for user: " + user.getUsername() + ", " + e.getMessage());
            }
        }

        return true;
    }

    private OrderDTO mapToOrderDTO(Order order) {
        OrderDTO dto = new OrderDTO();

        dto.setId(order.getId());
        dto.setIsGuest(order.getIsGuest());
        dto.setEmail(order.getEmail());
        dto.setPhone(order.getPhone());
        dto.setFullName(order.getFullName());
        dto.setAddress(order.getAddress());
        dto.setNotes(order.getNotes());
        dto.setSubtotal(order.getSubtotal());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setShippingFee(order.getShippingFee());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setVoucherCode(order.getVoucherCode());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setCreatedAt(order.getCreatedAt());

        User user = order.getUser();
        if (user != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setFullName(user.getFullName());
            userDTO.setEmail(user.getEmail());
            userDTO.setPhone(user.getPhone());
            Address address = user.getAddress();
            if (address != null) {
                AddressDTO addressDTO = new AddressDTO();
                addressDTO.setAddressLine(address.getAddressLine());
                addressDTO.setWard(address.getWard());
                addressDTO.setDistrict(address.getDistrict());
                addressDTO.setCity(address.getCity());
                userDTO.setAddress(addressDTO);
            }
            dto.setUser(userDTO);
        }

        return dto;
    }

    private OrderDTO buildOrderDetail(Order order) {
        if (order == null)
            return null;

        OrderDTO dto = mapToOrderDTO(order);

        List<OrderItemDTO> itemDTOS = new ArrayList<>();
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        if (items == null || items.isEmpty()) {
            items = order.getItems();
        }

        if (items != null) {
            for (OrderItem item : items) {
                OrderItemDTO itemDTO = new OrderItemDTO();
                itemDTO.setId(item.getId());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());

                if (item.getProduct() != null) {
                    itemDTO.setProduct(productService.mapToProductResponse(item.getProduct()));
                }

                if (item.getConfiguration() != null) {
                    itemDTO.setConfigurationId(item.getConfiguration().getId());
                }

                itemDTOS.add(itemDTO);
            }
        }

        dto.setOrderItems(itemDTOS);
        return dto;
    }
}
