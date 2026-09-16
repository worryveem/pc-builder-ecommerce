package com.example.pcbuilderecommerce.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationRequest {
    private String query;
    private Integer categoryId;
    private Double budget;
    private String useCase;
}
