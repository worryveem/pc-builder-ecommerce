package com.example.fashionshop.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "vouchers")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, length = 20)
    private String discountType; // "PERCENTAGE" or "FIXED_AMOUNT"

    @Column(nullable = false)
    private Double discountValue; // e.g. 10.0 for 10%, or 50000.0 for 50,000 VND

    private Double minOrderAmount; // Minimum order subtotal required to apply

    private Double maxDiscountAmount; // Max discount amount in VND (for percentage discounts)

    private Integer usageLimit; // Total uses allowed
/*  */
    private Integer usedCount; // Number of times used so far

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();
}
