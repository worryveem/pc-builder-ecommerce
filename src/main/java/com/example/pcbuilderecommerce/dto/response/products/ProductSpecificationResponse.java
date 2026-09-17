package com.example.pcbuilderecommerce.dto.response.products;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSpecificationResponse {
    private Integer id;
    private String socket;
    private String chipset;
    private String supportedSockets;

    @JsonAlias({"coolerHeightMm", "heightMm"})
    private Integer coolerHeightMm;

    private String ramType;
    private Integer maxRamCapacity;
    private Integer ramSlots;
    private Integer capacityGb;

    @JsonAlias({"speedMhz", "busSpeed"})
    private Integer speedMhz;

    private Integer modulesCount;
    private String formFactor;
    private String supportedFormFactors;

    @JsonAlias({"gpuLengthMm", "lengthMm"})
    private Integer gpuLengthMm;

    private Integer maxGpuLengthMm;
    private Integer maxCoolerHeightMm;

    @JsonAlias({"tdpW", "tdp"})
    private Integer tdpW;

    private Integer powerConsumptionW;
    private Integer recommendedPsuW;

    @JsonAlias({"psuWattage", "wattage"})
    private Integer psuWattage;

    private Double screenSize;
    private String resolution;
    private Integer refreshRate;
    private String panelType;
    private Double responseTime;
    private String rawExtraSpecs;
}
