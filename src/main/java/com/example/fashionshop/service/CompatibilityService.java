package com.example.fashionshop.service;

import com.example.fashionshop.common.ProductType;
import com.example.fashionshop.dto.request.builder.BuilderItemRequest;
import com.example.fashionshop.dto.response.builder.CompatibilityIssue;
import com.example.fashionshop.dto.response.builder.CompatibilityResponse;
import com.example.fashionshop.model.PCConfiguration;
import com.example.fashionshop.model.PCConfigurationItem;
import com.example.fashionshop.model.Product;
import com.example.fashionshop.model.ProductSpecification;
import com.example.fashionshop.repository.ProductRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CompatibilityService {

    @Autowired
    private ProductRepository productRepository;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class SelectedComponent {
        private Product product;
        private int quantity;
    }

    /**
     * Validate compatibility for a list of item requests from builder API.
     */
    public CompatibilityResponse validateItemRequests(List<BuilderItemRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            CompatibilityResponse resp = new CompatibilityResponse();
            resp.setCompatible(true);
            resp.setEstimatedWattage(70);
            resp.setRecommendedPsuWattage((int) Math.ceil(70 * 1.25));
            return resp;
        }

        List<SelectedComponent> components = new ArrayList<>();
        for (BuilderItemRequest req : requests) {
            if (req.getProductId() != null) {
                Product p = productRepository.findById(req.getProductId()).orElse(null);
                if (p != null) {
                    int qty = (req.getQuantity() != null && req.getQuantity() > 0) ? req.getQuantity() : 1;
                    components.add(new SelectedComponent(p, qty));
                }
            }
        }

        return validateComponents(components);
    }

    /**
     * Validate compatibility for an existing PCConfiguration entity.
     */
    public CompatibilityResponse validateConfiguration(PCConfiguration configuration) {
        if (configuration == null || configuration.getItems() == null || configuration.getItems().isEmpty()) {
            CompatibilityResponse resp = new CompatibilityResponse();
            resp.setCompatible(true);
            resp.setEstimatedWattage(70);
            resp.setRecommendedPsuWattage((int) Math.ceil(70 * 1.25));
            return resp;
        }

        List<SelectedComponent> components = new ArrayList<>();
        for (PCConfigurationItem item : configuration.getItems()) {
            if (item.getProduct() != null) {
                int qty = (item.getQuantity() != null && item.getQuantity() > 0) ? item.getQuantity() : 1;
                components.add(new SelectedComponent(item.getProduct(), qty));
            }
        }

        return validateComponents(components);
    }

    /**
     * Core validation engine.
     */
    public CompatibilityResponse validateComponents(List<SelectedComponent> components) {
        CompatibilityResponse response = new CompatibilityResponse();

        Product cpu = null;
        Product mainboard = null;
        List<SelectedComponent> rams = new ArrayList<>();
        Product gpu = null;
        Product cooler = null;
        Product caseProduct = null;
        Product psu = null;

        // Group components by builderComponentType, ignore ACCESSORY types from hardware rules
        for (SelectedComponent sc : components) {
            Product p = sc.getProduct();
            if (p == null || p.getProductType() == ProductType.ACCESSORY) {
                continue; // Accessories do not participate in compatibility engine
            }

            String compType = getNormalizedComponentType(p);
            if (compType == null) continue;

            switch (compType) {
                case "CPU":
                    if (cpu == null) cpu = p;
                    break;
                case "MAINBOARD":
                    if (mainboard == null) mainboard = p;
                    break;
                case "RAM":
                    rams.add(sc);
                    break;
                case "GPU":
                    if (gpu == null) gpu = p;
                    break;
                case "COOLER":
                case "CPU_COOLER":
                    if (cooler == null) cooler = p;
                    break;
                case "CASE":
                    if (caseProduct == null) caseProduct = p;
                    break;
                case "PSU":
                    if (psu == null) psu = p;
                    break;
                default:
                    // SSD, HDD, FAN, etc. don't have socket/dimension constraints
                    break;
            }
        }

        // Rule A: CPU ↔ Mainboard Socket
        if (cpu != null && mainboard != null) {
            ProductSpecification cpuSpec = cpu.getSpecification();
            ProductSpecification mbSpec = mainboard.getSpecification();
            if (cpuSpec != null && mbSpec != null) {
                String cpuSocket = cpuSpec.getSocket();
                String mbSocket = mbSpec.getSocket();
                if (cpuSocket != null && mbSocket != null && !cpuSocket.trim().equalsIgnoreCase(mbSocket.trim())) {
                    response.getErrors().add(new CompatibilityIssue(
                            "CPU_MAINBOARD_SOCKET_MISMATCH",
                            "CPU socket (" + cpuSocket + ") không tương thích với Mainboard socket (" + mbSocket + ")",
                            "CPU"
                    ));
                }
            }
        }

        // Rule B: RAM ↔ Mainboard
        if (!rams.isEmpty() && mainboard != null) {
            ProductSpecification mbSpec = mainboard.getSpecification();
            if (mbSpec != null) {
                String mbRamType = mbSpec.getRamType();
                int totalCapacityGb = 0;
                int totalModules = 0;

                for (SelectedComponent ramItem : rams) {
                    ProductSpecification ramSpec = ramItem.getProduct().getSpecification();
                    if (ramSpec != null) {
                        // Check RAM type
                        String ramType = ramSpec.getRamType();
                        if (mbRamType != null && ramType != null && !mbRamType.trim().equalsIgnoreCase(ramType.trim())) {
                            response.getErrors().add(new CompatibilityIssue(
                                    "RAM_TYPE_MISMATCH",
                                    "Mainboard chỉ hỗ trợ chuẩn RAM " + mbRamType + ", không tương thích với RAM " + ramType + " của '" + ramItem.getProduct().getName() + "'",
                                    "RAM"
                            ));
                        }

                        // Accumulate capacity and module count:
                        // capacity_gb = capacity per module, modules_count = modules per kit, quantity = kits selected
                        int modCount = (ramSpec.getModulesCount() != null && ramSpec.getModulesCount() > 0) ? ramSpec.getModulesCount() : 1;
                        int capPerMod = (ramSpec.getCapacityGb() != null) ? ramSpec.getCapacityGb() : 0;
                        int qty = (ramItem.getQuantity() > 0) ? ramItem.getQuantity() : 1;

                        totalModules += modCount * qty;
                        totalCapacityGb += capPerMod * modCount * qty;
                    }
                }

                // Check capacity limit
                if (mbSpec.getMaxRamCapacity() != null && totalCapacityGb > mbSpec.getMaxRamCapacity()) {
                    response.getErrors().add(new CompatibilityIssue(
                            "RAM_CAPACITY_EXCEEDED",
                            "Tổng dung lượng RAM (" + totalCapacityGb + "GB) vượt quá mức tối đa Mainboard hỗ trợ (" + mbSpec.getMaxRamCapacity() + "GB)",
                            "RAM"
                    ));
                }

                // Check slot limit
                if (mbSpec.getRamSlots() != null && totalModules > mbSpec.getRamSlots()) {
                    response.getErrors().add(new CompatibilityIssue(
                            "RAM_SLOTS_EXCEEDED",
                            "Tổng số thanh RAM (" + totalModules + " thanh) vượt quá số khe cắm RAM của Mainboard (" + mbSpec.getRamSlots() + " khe)",
                            "RAM"
                    ));
                }
            }
        }

        // Rule C: CPU Cooler ↔ CPU Socket
        if (cooler != null && cpu != null) {
            ProductSpecification coolerSpec = cooler.getSpecification();
            ProductSpecification cpuSpec = cpu.getSpecification();
            if (coolerSpec != null && cpuSpec != null) {
                String cpuSocket = cpuSpec.getSocket();
                Set<String> supportedSockets = coolerSpec.getSupportedSocketsSet();
                if (cpuSocket != null && !supportedSockets.isEmpty()) {
                    if (!supportedSockets.contains(cpuSocket.trim().toUpperCase())) {
                        response.getErrors().add(new CompatibilityIssue(
                                "COOLER_SOCKET_MISMATCH",
                                "Tản nhiệt không hỗ trợ ngàm socket " + cpuSocket + " của CPU đã chọn",
                                "COOLER"
                        ));
                    }
                }
            }
        }

        // Rule D: CPU Cooler ↔ Case Height
        if (cooler != null && caseProduct != null) {
            ProductSpecification coolerSpec = cooler.getSpecification();
            ProductSpecification caseSpec = caseProduct.getSpecification();
            if (coolerSpec != null && caseSpec != null) {
                Integer coolerHeight = coolerSpec.getCoolerHeightMm();
                Integer maxCoolerHeight = caseSpec.getMaxCoolerHeightMm();
                if (coolerHeight != null && maxCoolerHeight != null && coolerHeight > maxCoolerHeight) {
                    response.getErrors().add(new CompatibilityIssue(
                            "COOLER_HEIGHT_EXCEEDED",
                            "Chiều cao tản nhiệt (" + coolerHeight + "mm) vượt quá khoảng trống tối đa của vỏ case (" + maxCoolerHeight + "mm)",
                            "COOLER"
                    ));
                }
            }
        }

        // Rule E: GPU ↔ Case Length
        if (gpu != null && caseProduct != null) {
            ProductSpecification gpuSpec = gpu.getSpecification();
            ProductSpecification caseSpec = caseProduct.getSpecification();
            if (gpuSpec != null && caseSpec != null) {
                Integer gpuLength = gpuSpec.getGpuLengthMm();
                Integer maxGpuLength = caseSpec.getMaxGpuLengthMm();
                if (gpuLength != null && maxGpuLength != null && gpuLength > maxGpuLength) {
                    response.getErrors().add(new CompatibilityIssue(
                            "GPU_LENGTH_EXCEEDED",
                            "Chiều dài card đồ họa (" + gpuLength + "mm) vượt quá chiều dài tối đa vỏ case hỗ trợ (" + maxGpuLength + "mm)",
                            "GPU"
                    ));
                }
            }
        }

        // Rule F: Mainboard ↔ Case Form Factor
        if (mainboard != null && caseProduct != null) {
            ProductSpecification mbSpec = mainboard.getSpecification();
            ProductSpecification caseSpec = caseProduct.getSpecification();
            if (mbSpec != null && caseSpec != null) {
                String mbFormFactor = mbSpec.getFormFactor();
                Set<String> supportedFormFactors = caseSpec.getSupportedFormFactorsSet();
                if (mbFormFactor != null && !supportedFormFactors.isEmpty()) {
                    if (!supportedFormFactors.contains(mbFormFactor.trim().toUpperCase())) {
                        response.getErrors().add(new CompatibilityIssue(
                                "MAINBOARD_FORM_FACTOR_MISMATCH",
                                "Vỏ case không hỗ trợ bo mạch chủ chuẩn kích thước " + mbFormFactor,
                                "MAINBOARD"
                        ));
                    }
                }
            }
        }

        // Rule G: PSU & Power Estimation
        int cpuTdp = (cpu != null && cpu.getSpecification() != null && cpu.getSpecification().getTdpW() != null)
                ? cpu.getSpecification().getTdpW() : 0;
        int gpuPower = (gpu != null && gpu.getSpecification() != null && gpu.getSpecification().getPowerConsumptionW() != null)
                ? gpu.getSpecification().getPowerConsumptionW() : 0;
        int baseline = 70; // Baseline for motherboard, RAM, storage, fans
        int estimatedPower = cpuTdp + gpuPower + baseline;

        int gpuRecPsu = (gpu != null && gpu.getSpecification() != null && gpu.getSpecification().getRecommendedPsuW() != null)
                ? gpu.getSpecification().getRecommendedPsuW() : 0;
        int recommendedWattage = Math.max(gpuRecPsu, (int) Math.ceil(estimatedPower * 1.25));

        response.setEstimatedWattage(estimatedPower);
        response.setRecommendedPsuWattage(recommendedWattage);

        if (psu != null) {
            ProductSpecification psuSpec = psu.getSpecification();
            int psuWattage = (psuSpec != null && psuSpec.getPsuWattage() != null) ? psuSpec.getPsuWattage() : 0;

            if (psuWattage > 0) {
                if (psuWattage < estimatedPower) {
                    // ERROR: PSU cannot cover the baseline estimated power
                    response.getErrors().add(new CompatibilityIssue(
                            "PSU_INSUFFICIENT_POWER",
                            "Công suất nguồn (" + psuWattage + "W) thấp hơn tổng công suất ước tính tối thiểu của hệ thống (" + estimatedPower + "W). Hệ thống không thể vận hành an toàn.",
                            "PSU"
                    ));
                } else {
                    // WARNINGS: Does not invalidate compatibility
                    if (gpuRecPsu > 0 && psuWattage < gpuRecPsu) {
                        response.getWarnings().add(new CompatibilityIssue(
                                "PSU_BELOW_GPU_RECOMMENDED",
                                "Công suất nguồn (" + psuWattage + "W) thấp hơn mức khuyến nghị của hãng GPU (" + gpuRecPsu + "W).",
                                "PSU"
                        ));
                    }
                    if (psuWattage < (int) Math.ceil(estimatedPower * 1.25)) {
                        response.getWarnings().add(new CompatibilityIssue(
                                "PSU_BELOW_RECOMMENDED_HEADROOM",
                                "Công suất nguồn (" + psuWattage + "W) thấp hơn mức đề xuất có 25% công suất đệm dự phòng (" + recommendedWattage + "W) để hoạt động tối ưu.",
                                "PSU"
                        ));
                    }
                }
            }
        }

        response.setCompatible(response.getErrors().isEmpty());
        return response;
    }

    private String getNormalizedComponentType(Product product) {
        if (product == null || product.getCategory() == null) return null;
        String type = product.getCategory().getBuilderComponentType();
        return (type != null) ? type.trim().toUpperCase() : null;
    }
}
