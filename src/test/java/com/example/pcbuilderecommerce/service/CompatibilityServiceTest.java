package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.common.ProductType;
import com.example.pcbuilderecommerce.dto.response.builder.CompatibilityResponse;
import com.example.pcbuilderecommerce.model.Category;
import com.example.pcbuilderecommerce.model.Product;
import com.example.pcbuilderecommerce.model.ProductSpecification;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CompatibilityServiceTest {

    @InjectMocks
    private CompatibilityService compatibilityService;

    private Product createProduct(String name, String componentType, ProductType productType) {
        Category category = new Category();
        category.setName(name + " Category");
        category.setBuilderComponentType(componentType);
        category.setBuilderSupported(true);

        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setProductType(productType);
        return product;
    }

    @Test
    @DisplayName("CPU and Mainboard with identical socket are compatible")
    void testCpuMainboard_Compatible() {
        Product cpu = createProduct("Intel i7 14700K", "CPU", ProductType.COMPONENT);
        ProductSpecification cpuSpec = new ProductSpecification();
        cpuSpec.setSocket("LGA1700");
        cpu.setSpecification(cpuSpec);

        Product mb = createProduct("ASUS B760", "MAINBOARD", ProductType.COMPONENT);
        ProductSpecification mbSpec = new ProductSpecification();
        mbSpec.setSocket("LGA1700");
        mb.setSpecification(mbSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(cpu, 1),
                new CompatibilityService.SelectedComponent(mb, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertTrue(resp.isCompatible());
        assertTrue(resp.getErrors().isEmpty());
    }

    @Test
    @DisplayName("CPU and Mainboard with mismatched sockets generate ERROR")
    void testCpuMainboard_IncompatibleSocket() {
        Product cpu = createProduct("Intel i7 14700K", "CPU", ProductType.COMPONENT);
        ProductSpecification cpuSpec = new ProductSpecification();
        cpuSpec.setSocket("LGA1700");
        cpu.setSpecification(cpuSpec);

        Product mb = createProduct("MSI B650", "MAINBOARD", ProductType.COMPONENT);
        ProductSpecification mbSpec = new ProductSpecification();
        mbSpec.setSocket("AM5");
        mb.setSpecification(mbSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(cpu, 1),
                new CompatibilityService.SelectedComponent(mb, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertFalse(resp.isCompatible());
        assertEquals(1, resp.getErrors().size());
        assertEquals("CPU_MAINBOARD_SOCKET_MISMATCH", resp.getErrors().get(0).getCode());
    }

    @Test
    @DisplayName("RAM type mismatch with Mainboard generates ERROR")
    void testRamMainboard_TypeMismatch() {
        Product mb = createProduct("ASUS B760 DDR5", "MAINBOARD", ProductType.COMPONENT);
        ProductSpecification mbSpec = new ProductSpecification();
        mbSpec.setRamType("DDR5");
        mb.setSpecification(mbSpec);

        Product ram = createProduct("Kingston Fury DDR4", "RAM", ProductType.COMPONENT);
        ProductSpecification ramSpec = new ProductSpecification();
        ramSpec.setRamType("DDR4");
        ram.setSpecification(ramSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(mb, 1),
                new CompatibilityService.SelectedComponent(ram, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertFalse(resp.isCompatible());
        assertEquals(1, resp.getErrors().size());
        assertEquals("RAM_TYPE_MISMATCH", resp.getErrors().get(0).getCode());
    }

    @Test
    @DisplayName("RAM total capacity exceeds Mainboard limit generates ERROR")
    void testRamMainboard_CapacityExceedsLimit() {
        Product mb = createProduct("Budget B760", "MAINBOARD", ProductType.COMPONENT);
        ProductSpecification mbSpec = new ProductSpecification();
        mbSpec.setRamType("DDR5");
        mbSpec.setMaxRamCapacity(64);
        mbSpec.setRamSlots(4);
        mb.setSpecification(mbSpec);

        // Kit of 2x32GB = 64GB per kit. Quantity = 2 kits => 128GB total
        Product ram = createProduct("Corsair 64GB Kit", "RAM", ProductType.COMPONENT);
        ProductSpecification ramSpec = new ProductSpecification();
        ramSpec.setRamType("DDR5");
        ramSpec.setCapacityGb(32); // 32GB per module
        ramSpec.setModulesCount(2); // 2 modules per kit
        ram.setSpecification(ramSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(mb, 1),
                new CompatibilityService.SelectedComponent(ram, 2) // 2 kits = 4 modules = 128GB
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertFalse(resp.isCompatible());
        assertTrue(resp.getErrors().stream().anyMatch(e -> "RAM_CAPACITY_EXCEEDED".equals(e.getCode())));
    }

    @Test
    @DisplayName("RAM total modules exceed Mainboard slot count generates ERROR")
    void testRamMainboard_ModulesExceedSlots() {
        Product mb = createProduct("ITX B760", "MAINBOARD", ProductType.COMPONENT);
        ProductSpecification mbSpec = new ProductSpecification();
        mbSpec.setRamType("DDR5");
        mbSpec.setMaxRamCapacity(96);
        mbSpec.setRamSlots(2); // Only 2 slots
        mb.setSpecification(mbSpec);

        // Kit of 2 modules, quantity 2 => 4 modules total
        Product ram = createProduct("Corsair 32GB Kit", "RAM", ProductType.COMPONENT);
        ProductSpecification ramSpec = new ProductSpecification();
        ramSpec.setRamType("DDR5");
        ramSpec.setCapacityGb(16);
        ramSpec.setModulesCount(2);
        ram.setSpecification(ramSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(mb, 1),
                new CompatibilityService.SelectedComponent(ram, 2) // 4 modules > 2 slots
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertFalse(resp.isCompatible());
        assertTrue(resp.getErrors().stream().anyMatch(e -> "RAM_SLOTS_EXCEEDED".equals(e.getCode())));
    }

    @Test
    @DisplayName("Cooler socket mismatch generates ERROR")
    void testCoolerCpu_SocketMismatch() {
        Product cpu = createProduct("Intel i7", "CPU", ProductType.COMPONENT);
        ProductSpecification cpuSpec = new ProductSpecification();
        cpuSpec.setSocket("LGA1700");
        cpu.setSpecification(cpuSpec);

        Product cooler = createProduct("Older Cooler", "COOLER", ProductType.COMPONENT);
        ProductSpecification coolerSpec = new ProductSpecification();
        coolerSpec.setSupportedSockets("AM5,AM4,LGA1200");
        cooler.setSpecification(coolerSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(cpu, 1),
                new CompatibilityService.SelectedComponent(cooler, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertFalse(resp.isCompatible());
        assertEquals(1, resp.getErrors().size());
        assertEquals("COOLER_SOCKET_MISMATCH", resp.getErrors().get(0).getCode());
    }

    @Test
    @DisplayName("Cooler height exceeding Case limit generates ERROR")
    void testCoolerCase_TooTall() {
        Product cooler = createProduct("Giant Air Cooler", "COOLER", ProductType.COMPONENT);
        ProductSpecification coolerSpec = new ProductSpecification();
        coolerSpec.setCoolerHeightMm(170);
        cooler.setSpecification(coolerSpec);

        Product pcCase = createProduct("Slim Mid-Tower", "CASE", ProductType.COMPONENT);
        ProductSpecification caseSpec = new ProductSpecification();
        caseSpec.setMaxCoolerHeightMm(155);
        pcCase.setSpecification(caseSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(cooler, 1),
                new CompatibilityService.SelectedComponent(pcCase, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertFalse(resp.isCompatible());
        assertEquals(1, resp.getErrors().size());
        assertEquals("COOLER_HEIGHT_EXCEEDED", resp.getErrors().get(0).getCode());
    }

    @Test
    @DisplayName("GPU length exceeding Case limit generates ERROR")
    void testGpuCase_TooLong() {
        Product gpu = createProduct("RTX 4090 3-Fan", "GPU", ProductType.COMPONENT);
        ProductSpecification gpuSpec = new ProductSpecification();
        gpuSpec.setGpuLengthMm(340);
        gpu.setSpecification(gpuSpec);

        Product pcCase = createProduct("Compact Case", "CASE", ProductType.COMPONENT);
        ProductSpecification caseSpec = new ProductSpecification();
        caseSpec.setMaxGpuLengthMm(300);
        pcCase.setSpecification(caseSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(gpu, 1),
                new CompatibilityService.SelectedComponent(pcCase, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertFalse(resp.isCompatible());
        assertEquals(1, resp.getErrors().size());
        assertEquals("GPU_LENGTH_EXCEEDED", resp.getErrors().get(0).getCode());
    }

    @Test
    @DisplayName("Mainboard form factor not in Case supported list generates ERROR")
    void testMainboardCase_FormFactorMismatch() {
        Product mb = createProduct("E-ATX Workstation Board", "MAINBOARD", ProductType.COMPONENT);
        ProductSpecification mbSpec = new ProductSpecification();
        mbSpec.setFormFactor("E_ATX");
        mb.setSpecification(mbSpec);

        Product pcCase = createProduct("Standard Case", "CASE", ProductType.COMPONENT);
        ProductSpecification caseSpec = new ProductSpecification();
        caseSpec.setSupportedFormFactors("ATX,MICRO_ATX,MINI_ITX");
        pcCase.setSpecification(caseSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(mb, 1),
                new CompatibilityService.SelectedComponent(pcCase, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertFalse(resp.isCompatible());
        assertEquals(1, resp.getErrors().size());
        assertEquals("MAINBOARD_FORM_FACTOR_MISMATCH", resp.getErrors().get(0).getCode());
    }

    @Test
    @DisplayName("PSU wattage below estimated system power generates ERROR")
    void testPsu_BelowEstimatedPower_Error() {
        Product cpu = createProduct("Intel i7", "CPU", ProductType.COMPONENT);
        ProductSpecification cpuSpec = new ProductSpecification();
        cpuSpec.setTdpW(125);
        cpu.setSpecification(cpuSpec);

        Product gpu = createProduct("RTX 4070 Ti", "GPU", ProductType.COMPONENT);
        ProductSpecification gpuSpec = new ProductSpecification();
        gpuSpec.setPowerConsumptionW(285);
        gpuSpec.setRecommendedPsuW(750);
        gpu.setSpecification(gpuSpec);

        // Total estimated power = 125 + 285 + 70 = 480W
        Product psu = createProduct("400W Weak PSU", "PSU", ProductType.COMPONENT);
        ProductSpecification psuSpec = new ProductSpecification();
        psuSpec.setPsuWattage(400); // 400 < 480
        psu.setSpecification(psuSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(cpu, 1),
                new CompatibilityService.SelectedComponent(gpu, 1),
                new CompatibilityService.SelectedComponent(psu, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertFalse(resp.isCompatible());
        assertTrue(resp.getErrors().stream().anyMatch(e -> "PSU_INSUFFICIENT_POWER".equals(e.getCode())));
        assertEquals(480, resp.getEstimatedWattage());
    }

    @Test
    @DisplayName("PSU wattage above estimated power but below recommended headroom generates WARNING only, isCompatible remains TRUE")
    void testPsu_BelowRecommendedHeadroom_WarningOnly() {
        Product cpu = createProduct("Intel i7", "CPU", ProductType.COMPONENT);
        ProductSpecification cpuSpec = new ProductSpecification();
        cpuSpec.setTdpW(125);
        cpu.setSpecification(cpuSpec);

        Product gpu = createProduct("RTX 4070 Ti", "GPU", ProductType.COMPONENT);
        ProductSpecification gpuSpec = new ProductSpecification();
        gpuSpec.setPowerConsumptionW(285);
        gpuSpec.setRecommendedPsuW(750);
        gpu.setSpecification(gpuSpec);

        // Total estimated = 480W. 1.25x = 600W. GPU recommended = 750W.
        // PSU is 650W: greater than 480W, but less than 750W
        Product psu = createProduct("650W PSU", "PSU", ProductType.COMPONENT);
        ProductSpecification psuSpec = new ProductSpecification();
        psuSpec.setPsuWattage(650);
        psu.setSpecification(psuSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(cpu, 1),
                new CompatibilityService.SelectedComponent(gpu, 1),
                new CompatibilityService.SelectedComponent(psu, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertTrue(resp.isCompatible());
        assertTrue(resp.getErrors().isEmpty());
        assertFalse(resp.getWarnings().isEmpty());
        assertTrue(resp.getWarnings().stream().anyMatch(w -> "PSU_BELOW_GPU_RECOMMENDED".equals(w.getCode())));
    }

    @Test
    @DisplayName("Missing components in incomplete configuration do NOT generate automatic errors")
    void testMissingComponents_IncompleteConfiguration_NoAutomaticError() {
        // Only CPU and Case chosen, no Mainboard, no RAM, no PSU
        Product cpu = createProduct("AMD Ryzen 7", "CPU", ProductType.COMPONENT);
        ProductSpecification cpuSpec = new ProductSpecification();
        cpuSpec.setSocket("AM5");
        cpuSpec.setTdpW(120);
        cpu.setSpecification(cpuSpec);

        Product pcCase = createProduct("NZXT H5", "CASE", ProductType.COMPONENT);
        ProductSpecification caseSpec = new ProductSpecification();
        caseSpec.setSupportedFormFactors("ATX,MICRO_ATX");
        pcCase.setSpecification(caseSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(cpu, 1),
                new CompatibilityService.SelectedComponent(pcCase, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertTrue(resp.isCompatible());
        assertTrue(resp.getErrors().isEmpty());
        assertEquals(190, resp.getEstimatedWattage()); // 120W + 70W baseline
    }

    @Test
    @DisplayName("ACCESSORY products (Monitor, Keyboard, Mouse) do not affect compatibility engine")
    void testAccessory_DoesNotAffectCompatibility() {
        Product monitor = createProduct("LG 27 inch 2K", "MONITOR", ProductType.ACCESSORY);
        Product keyboard = createProduct("Mechanical Keyboard", "KEYBOARD", ProductType.ACCESSORY);
        Product mouse = createProduct("Gaming Mouse", "MOUSE", ProductType.ACCESSORY);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(monitor, 1),
                new CompatibilityService.SelectedComponent(keyboard, 1),
                new CompatibilityService.SelectedComponent(mouse, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertTrue(resp.isCompatible());
        assertTrue(resp.getErrors().isEmpty());
        assertTrue(resp.getWarnings().isEmpty());
    }

    @Test
    @DisplayName("CSV matching uses exact Set membership and never partial substring matches")
    void testCsvExactSetMembership_NoSubstringFalseMatch() {
        // Case supports "MICRO_ATX" and "MINI_ITX". Should NOT match "ATX"
        Product mb = createProduct("Full ATX Board", "MAINBOARD", ProductType.COMPONENT);
        ProductSpecification mbSpec = new ProductSpecification();
        mbSpec.setFormFactor("ATX");
        mb.setSpecification(mbSpec);

        Product pcCase = createProduct("Micro-ATX Only Case", "CASE", ProductType.COMPONENT);
        ProductSpecification caseSpec = new ProductSpecification();
        caseSpec.setSupportedFormFactors("MICRO_ATX,MINI_ITX");
        pcCase.setSpecification(caseSpec);

        List<CompatibilityService.SelectedComponent> items = List.of(
                new CompatibilityService.SelectedComponent(mb, 1),
                new CompatibilityService.SelectedComponent(pcCase, 1)
        );

        CompatibilityResponse resp = compatibilityService.validateComponents(items);

        assertFalse(resp.isCompatible());
        assertEquals(1, resp.getErrors().size());
        assertEquals("MAINBOARD_FORM_FACTOR_MISMATCH", resp.getErrors().get(0).getCode());
    }
}
