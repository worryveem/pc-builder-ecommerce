package com.example.fashionshop.dto;

import com.example.fashionshop.dto.response.products.ProductsResponse;
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
