package com.example.pcbuilderecommerce.dto.response.products;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private long id;
    private String name;
    private String slug;
    private String description;
    private Long parentId;
    private Boolean builderSupported;
    private String builderComponentType;
    private Integer displayOrder;
    private List<CategoryResponse> children;

    public CategoryResponse(long id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}
