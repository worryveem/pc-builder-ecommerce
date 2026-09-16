package com.example.fashionshop.dto.response.builder;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompatibilityIssue {
    private String code;
    private String message;
    private String componentType;

    public CompatibilityIssue(String code, String message) {
        this.code = code;
        this.message = message;
    }
}
