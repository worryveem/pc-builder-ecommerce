package com.example.pcbuilderecommerce.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PCConfigurationDTO {
    private Integer id;
    private Integer userId;
    private String name;
    private String shareToken;
    private Double totalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PCConfigurationItemDTO> items;
}
