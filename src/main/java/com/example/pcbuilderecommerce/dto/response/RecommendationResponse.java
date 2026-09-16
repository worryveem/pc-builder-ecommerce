package com.example.pcbuilderecommerce.dto.response;

import com.example.pcbuilderecommerce.dto.response.products.ProductsResponse;
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
