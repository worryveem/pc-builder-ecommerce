package com.example.pcbuilderecommerce.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
@Entity
@Table(name = "product_specifications")
public class ProductSpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    // CPU / Mainboard / Cooler
    @Column(name = "socket")
    private String socket;

    @Column(name = "chipset")
    private String chipset;

    @Column(name = "supported_sockets")
    private String supportedSockets;

    @Column(name = "cooler_height_mm")
    private Integer coolerHeightMm;

    // RAM
    @Column(name = "ram_type")
    private String ramType;

    @Column(name = "max_ram_capacity")
    private Integer maxRamCapacity;

    @Column(name = "ram_slots")
    private Integer ramSlots;

    @Column(name = "capacity_gb")
    private Integer capacityGb;

    @Column(name = "speed_mhz")
    private Integer speedMhz;

    @Column(name = "modules_count")
    private Integer modulesCount = 1;

    // Form factor & Dimensions
    @Column(name = "form_factor")
    private String formFactor;

    @Column(name = "supported_form_factors")
    private String supportedFormFactors;

    @Column(name = "gpu_length_mm")
    private Integer gpuLengthMm;

    @Column(name = "max_gpu_length_mm")
    private Integer maxGpuLengthMm;

    @Column(name = "max_cooler_height_mm")
    private Integer maxCoolerHeightMm;

    // Power & TDP
    @Column(name = "tdp_w")
    private Integer tdpW;

    @Column(name = "power_consumption_w")
    private Integer powerConsumptionW;

    @Column(name = "recommended_psu_w")
    private Integer recommendedPsuW;

    @Column(name = "psu_wattage")
    private Integer psuWattage;

    // Monitor / Display
    @Column(name = "screen_size")
    private Double screenSize;

    @Column(name = "resolution")
    private String resolution;

    @Column(name = "refresh_rate")
    private Integer refreshRate;

    @Column(name = "panel_type")
    private String panelType;

    @Column(name = "response_time")
    private Double responseTime;

    // Extra / Flexible display specs
    @Column(name = "raw_extra_specs", columnDefinition = "TEXT")
    private String rawExtraSpecs;

    /**
     * Parse supported sockets into a normalized Set<String> for exact compatibility checks.
     * Prevents false substring matches.
     */
    public Set<String> getSupportedSocketsSet() {
        if (supportedSockets == null || supportedSockets.trim().isEmpty()) {
            return Collections.emptySet();
        }
        return Arrays.stream(supportedSockets.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    /**
     * Parse supported form factors into a normalized Set<String> for exact compatibility checks.
     * Prevents false substring matches (e.g. ATX matching Micro-ATX).
     */
    public Set<String> getSupportedFormFactorsSet() {
        if (supportedFormFactors == null || supportedFormFactors.trim().isEmpty()) {
            return Collections.emptySet();
        }
        return Arrays.stream(supportedFormFactors.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }
}
