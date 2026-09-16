package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.common.OrderStatus;
import com.example.pcbuilderecommerce.common.PaymentMethod;
import com.example.pcbuilderecommerce.common.PaymentStatus;
import com.example.pcbuilderecommerce.dto.OrderDTO;
import com.example.pcbuilderecommerce.dto.OrderItemDTO;
import com.example.pcbuilderecommerce.dto.response.products.ProductsResponse;
import com.example.pcbuilderecommerce.model.*;
import com.example.pcbuilderecommerce.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private PCConfigurationRepository pcConfigurationRepository;

    @Mock
    private ProductService productService;

    @Mock
    private VoucherService voucherService;

    @Mock
    private CartService cartService;

    @InjectMocks
    private OrderService orderService;

    private User sampleUser;
    private Order sampleOrder;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("user1");
        sampleUser.setFullName("Nguyen Van A");
        sampleUser.setPhone("0987654321");
        sampleUser.setEmail("user1@example.com");

        sampleOrder = new Order();
        sampleOrder.setId(10);
        sampleOrder.setUser(sampleUser);
        sampleOrder.setStatus(OrderStatus.PENDING);
        sampleOrder.setPaymentStatus(PaymentStatus.PENDING);
        sampleOrder.setPaymentMethod(PaymentMethod.COD);
        sampleOrder.setFullName("Nguyen Van A");
        sampleOrder.setPhone("0987654321");
        sampleOrder.setAddress("123 Cong Nghe, Ha Noi");
        sampleOrder.setEmail("user1@example.com");
        sampleOrder.setSubtotal(15000000.0);
        sampleOrder.setDiscountAmount(500000.0);
        sampleOrder.setShippingFee(50000.0);
        sampleOrder.setTotalPrice(14550000.0);
        sampleOrder.setCreatedAt(LocalDateTime.now());
        sampleOrder.setItems(new ArrayList<>());

        sampleProduct = new Product();
        sampleProduct.setId(101);
        sampleProduct.setName("RTX 4060 Ti");
        sampleProduct.setPrice(11500000.0);
    }

    @Test
    @DisplayName("getOrderById returns OrderDTO when order exists")
    void testGetOrderById_Found() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(sampleOrder));

        OrderDTO dto = orderService.getOrderById(10L);

        assertNotNull(dto);
        assertEquals(Integer.valueOf(10), dto.getId());
        assertEquals("Nguyen Van A", dto.getFullName());
        assertEquals(14550000.0, dto.getTotalPrice());
    }

    @Test
    @DisplayName("getOrderById returns null when order not found")
    void testGetOrderById_NotFound() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        OrderDTO dto = orderService.getOrderById(999L);

        assertNull(dto);
    }

    @Test
    @DisplayName("cancelOrder cancels order and returns true")
    void testCancelOrder_Success() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(sampleOrder));

        boolean result = orderService.cancelOrder(10L);

        assertTrue(result);
        assertEquals(OrderStatus.CANCELLED, sampleOrder.getStatus());
        verify(orderRepository, times(1)).save(sampleOrder);
    }

    @Test
    @DisplayName("cancelOrder returns false when order not found")
    void testCancelOrder_NotFound() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        boolean result = orderService.cancelOrder(999L);

        assertFalse(result);
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateStatusOrder updates status for valid status string")
    void testUpdateStatusOrder_ValidStatus() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(sampleOrder));

        boolean result = orderService.updateStatusOrder(10L, "COMPLETED");

        assertTrue(result);
        assertEquals(OrderStatus.COMPLETED, sampleOrder.getStatus());
        verify(orderRepository, times(1)).save(sampleOrder);
    }

    @Test
    @DisplayName("updateStatusOrder returns false for invalid status string")
    void testUpdateStatusOrder_InvalidStatus() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(sampleOrder));

        boolean result = orderService.updateStatusOrder(10L, "UNKNOWN_STATUS");

        assertFalse(result);
    }

    @Test
    @DisplayName("getOrdersByUsername returns orders for existing user")
    void testGetOrdersByUsername_Success() {
        when(userRepository.findByUsername("user1")).thenReturn(sampleUser);
        when(orderRepository.findByUserId(1L)).thenReturn(List.of(sampleOrder));

        List<OrderDTO> orders = orderService.getOrdersByUsername("user1");

        assertEquals(1, orders.size());
        assertEquals(Integer.valueOf(10), orders.get(0).getId());
    }

    @Test
    @DisplayName("getOrdersByUsername returns empty list when user not found")
    void testGetOrdersByUsername_UserNotFound() {
        when(userRepository.findByUsername("unknown")).thenReturn(null);

        List<OrderDTO> orders = orderService.getOrdersByUsername("unknown");

        assertTrue(orders.isEmpty());
    }

    @Test
    @DisplayName("getOrderDetailForUser returns null when username does not match")
    void testGetOrderDetailForUser_MismatchUser() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(sampleOrder));

        OrderDTO dto = orderService.getOrderDetailForUser(10L, "other_user");

        assertNull(dto);
    }

    @Test
    @DisplayName("cancelOrderByUser cancels order when PENDING and user matches")
    void testCancelOrderByUser_Success() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(sampleOrder));

        boolean result = orderService.cancelOrderByUser(10L, "user1");

        assertTrue(result);
        assertEquals(OrderStatus.CANCELLED, sampleOrder.getStatus());
    }

    @Test
    @DisplayName("cancelOrderByUser returns false when order is not PENDING")
    void testCancelOrderByUser_NotPending() {
        sampleOrder.setStatus(OrderStatus.COMPLETED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(sampleOrder));

        boolean result = orderService.cancelOrderByUser(10L, "user1");

        assertFalse(result);
    }

    @Test
    @DisplayName("placeOrder returns false when orderItems is empty")
    void testPlaceOrder_EmptyItems() {
        OrderDTO req = new OrderDTO();
        req.setOrderItems(new ArrayList<>());

        boolean result = orderService.placeOrder(req, "user1");

        assertFalse(result);
    }

    @Test
    @DisplayName("placeOrder successfully processes order, vouchers and clears cart")
    void testPlaceOrder_Success() {
        OrderDTO req = new OrderDTO();
        req.setFullName("Nguyen Van A");
        req.setPhone("0987654321");
        req.setEmail("user1@example.com");
        req.setAddress("123 Cong Nghe");
        req.setVoucherCode("TECH10");
        req.setDiscountAmount(500000.0);
        req.setShippingFee(50000.0);
        req.setPaymentMethod(PaymentMethod.COD);

        OrderItemDTO itemDto = new OrderItemDTO();
        itemDto.setQuantity(1);
        ProductsResponse prodDto = new ProductsResponse();
        prodDto.setId(101);
        itemDto.setProduct(prodDto);
        req.setOrderItems(List.of(itemDto));

        when(userRepository.findByUsername("user1")).thenReturn(sampleUser);
        when(productRepository.findById(101)).thenReturn(Optional.of(sampleProduct));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        boolean result = orderService.placeOrder(req, "user1");

        assertTrue(result);
        verify(orderRepository, times(1)).save(any(Order.class));
        verify(voucherService, times(1)).recordVoucherUsage("TECH10");
        verify(cartService, times(1)).clearCartByUsername("user1");
    }

    @Test
    @DisplayName("cancelOrderByGuest cancels pending order when email matches")
    void testCancelOrderByGuest_Success() {
        sampleOrder.setEmail("guest@example.com");
        when(orderRepository.findById(10L)).thenReturn(Optional.of(sampleOrder));

        boolean result = orderService.cancelOrderByGuest(10L, "guest@example.com");

        assertTrue(result);
        assertEquals(OrderStatus.CANCELLED, sampleOrder.getStatus());
    }

    @Test
    @DisplayName("cancelOrderByGuest returns false when email mismatches")
    void testCancelOrderByGuest_EmailMismatch() {
        sampleOrder.setEmail("guest@example.com");
        when(orderRepository.findById(10L)).thenReturn(Optional.of(sampleOrder));

        boolean result = orderService.cancelOrderByGuest(10L, "wrong@example.com");

        assertFalse(result);
    }
}
