package com.example.fashionshop.dto.response.products;

import com.example.fashionshop.common.ProductType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductsResponse {
    private long id;
    private String name;
    private String brand;
    private String modelCode;
    private String description;
    private Double price;
    private Integer warrantyMonths;
    private ProductType productType;
    private Integer stockQuantity;
    private List<ProductImageResponse> images;
    private ProductSpecificationResponse specification;
    private long categoryId;
    private CategoryResponse category;
}
