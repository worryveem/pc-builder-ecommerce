package com.example.fashionshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherApplyResponse {
    private boolean valid;
    private String code;
    private String message;
    private Double originalAmount;
    private Double discountAmount;
    private Double finalAmount;
}
