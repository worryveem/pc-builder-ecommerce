package com.example.fashionshop.dto.response.products;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private Boolean isMain;
}
