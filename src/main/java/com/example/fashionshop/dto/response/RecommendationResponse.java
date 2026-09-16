package com.example.fashionshop.dto.response;

import com.example.fashionshop.dto.response.products.ProductsResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {
    private String advice;
    private List<ProductsResponse> recommendedProducts;
    private boolean hasBuilderRecommendations;
}
