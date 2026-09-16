package com.example.pcbuilderecommerce.dto.response.builder;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class CompatibilityResponse {
    private boolean isCompatible = true;
    private Integer estimatedWattage = 0;
    private Integer recommendedPsuWattage = 0;
    private List<CompatibilityIssue> errors = new ArrayList<>();
    private List<CompatibilityIssue> warnings = new ArrayList<>();
}
