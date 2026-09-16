package com.example.pcbuilderecommerce.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryDTO {
    private Integer id;
    private String name;
    private String slug;
    private String description;
    private Integer parentId;
    private Boolean builderSupported;
    private String builderComponentType;
    private Integer displayOrder;
}
