package com.example.pcbuilderecommerce.dto;

import com.example.pcbuilderecommerce.dto.response.products.ProductsResponse;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemDTO {
    private Integer id;
    private Double price;
    private Integer quantity;
    private ProductsResponse product;
    private Integer configurationId;
}
