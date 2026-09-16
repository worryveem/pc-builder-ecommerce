package com.example.fashionshop.dto.request.builder;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BuilderItemRequest {
    private Integer productId;
    private Integer quantity = 1;
}
