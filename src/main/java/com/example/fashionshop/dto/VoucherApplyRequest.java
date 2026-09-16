package com.example.fashionshop.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoucherApplyRequest {
    private String code;
    private Double orderAmount;
}
