package com.example.pcbuilderecommerce.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoucherApplyRequest {
    private String code;
    private Double orderAmount;
}
