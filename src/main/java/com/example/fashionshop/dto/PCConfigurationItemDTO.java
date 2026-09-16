package com.example.fashionshop.dto;

import com.example.fashionshop.dto.response.products.ProductsResponse;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PCConfigurationItemDTO {
    private Integer id;
    private Integer productId;
    private String componentType;
    private Integer quantity;
    private Double priceAtSelection;
    private ProductsResponse product;
}
