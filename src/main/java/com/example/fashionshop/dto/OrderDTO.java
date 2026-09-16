package com.example.fashionshop.dto;

import com.example.fashionshop.common.OrderStatus;
import com.example.fashionshop.common.PaymentMethod;
import com.example.fashionshop.common.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
//
@Getter
@Setter
public class OrderDTO {
    private Integer id;
    private Boolean isGuest;
    private String email;
    private String phone;
    private String fullName;
    private String address;
    private Double subtotal;
    private Double discountAmount;
    private Double shippingFee;
    private Double totalPrice;
    private String voucherCode;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String notes;
    private LocalDateTime createdAt;
    private UserDTO user;
    private List<OrderItemDTO> orderItems;
}
