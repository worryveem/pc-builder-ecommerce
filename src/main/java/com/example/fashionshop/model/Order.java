package com.example.fashionshop.model;
//
import com.example.fashionshop.common.OrderStatus;
import com.example.fashionshop.common.PaymentMethod;
import com.example.fashionshop.common.PaymentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
@Getter
@Setter
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Boolean isGuest;

    private String email;
    private String phone;
    
    private String fullName;
    private String address;
    private String notes;

    private Double subtotal;
    private Double discountAmount;
    private Double shippingFee;
    private Double totalPrice;

    private String voucherCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order" ,cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;
}