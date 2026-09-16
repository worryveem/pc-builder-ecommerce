package com.example.pcbuilderecommerce.dto;

import com.example.pcbuilderecommerce.dto.response.products.ProductsResponse;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemDTO {
    private Integer id;
    private Integer quantity;
    private ProductsResponse product;
    private Integer configurationId;
}
