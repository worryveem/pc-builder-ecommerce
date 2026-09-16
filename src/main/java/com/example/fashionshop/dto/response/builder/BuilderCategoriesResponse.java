package com.example.fashionshop.dto.response.builder;

import com.example.fashionshop.dto.response.products.CategoryResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BuilderCategoriesResponse {
    private List<CategoryResponse> coreComponents = new ArrayList<>();
    private List<CategoryResponse> optionalSetupGear = new ArrayList<>();
}
