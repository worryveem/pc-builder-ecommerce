package com.example.pcbuilderecommerce.dto.response.products;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSpecificationResponse {
    private Integer id;
    private String socket;
    private String chipset;
    private String supportedSockets;
    private Integer coolerHeightMm;
    private String ramType;
    private Integer maxRamCapacity;
    private Integer ramSlots;
    private Integer capacityGb;
    private Integer speedMhz;
    private Integer modulesCount;
    private String formFactor;
    private String supportedFormFactors;
    private Integer gpuLengthMm;
    private Integer maxGpuLengthMm;
    private Integer maxCoolerHeightMm;
    private Integer tdpW;
    private Integer powerConsumptionW;
    private Integer recommendedPsuW;
    private Integer psuWattage;
    private Double screenSize;
    private String resolution;
    private Integer refreshRate;
    private String panelType;
    private Double responseTime;
    private String rawExtraSpecs;
}
