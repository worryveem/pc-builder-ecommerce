package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.Exception.BadRequestException;
import com.example.pcbuilderecommerce.Exception.ResourceNotFoundException;
import com.example.pcbuilderecommerce.Exception.UnauthorizedException;
import com.example.pcbuilderecommerce.dto.PCConfigurationDTO;
import com.example.pcbuilderecommerce.dto.request.builder.BuilderItemRequest;
import com.example.pcbuilderecommerce.dto.request.builder.BuilderSaveConfigurationRequest;
import com.example.pcbuilderecommerce.dto.response.builder.BuilderCategoriesResponse;
import com.example.pcbuilderecommerce.dto.response.builder.CompatibilityIssue;
import com.example.pcbuilderecommerce.dto.response.builder.CompatibilityResponse;
import com.example.pcbuilderecommerce.dto.response.products.CategoryResponse;
import com.example.pcbuilderecommerce.dto.response.products.ProductsResponse;
import com.example.pcbuilderecommerce.model.*;
import com.example.pcbuilderecommerce.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PCBuilderServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private PCConfigurationRepository pcConfigurationRepository;

    @Mock
    private PCConfigurationItemRepository pcConfigurationItemRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompatibilityService compatibilityService;

    @Mock
    private ProductService productService;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private PCBuilderService pcBuilderService;

    private User sampleUser;
    private Category cpuCategory;
    private Category mainboardCategory;
    private Category gpuCategory;
    private Category ramCategory;
    private Category ssdCategory;
    private Category psuCategory;
    private Category monitorCategory;

    private Product cpuProduct;
    private Product mbProduct;
    private Product gpuProduct;
    private Product ramProduct;
    private Product ssdProduct;
    private Product psuProduct;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("builderuser");

        cpuCategory = createCategory(1, "CPU", "cpu", "CPU");
        mainboardCategory = createCategory(2, "Mainboard", "mainboard", "MAINBOARD");
        gpuCategory = createCategory(3, "VGA / GPU", "gpu", "GPU");
        ramCategory = createCategory(4, "RAM", "ram", "RAM");
        ssdCategory = createCategory(5, "Ổ cứng SSD", "ssd", "SSD");
        psuCategory = createCategory(6, "Nguồn máy tính", "psu", "PSU");
        monitorCategory = createCategory(7, "Màn hình", "monitor", "MONITOR");

        cpuProduct = createProduct(101, "Intel Core i5-13400F", cpuCategory, 5000000.0, 10);
        ProductSpecification cpuSpec = new ProductSpecification();
        cpuSpec.setSocket("LGA1700");
        cpuProduct.setSpecification(cpuSpec);

        mbProduct = createProduct(102, "ASUS B760M-A", mainboardCategory, 3500000.0, 10);
        ProductSpecification mbSpec = new ProductSpecification();
        mbSpec.setSocket("LGA1700");
        mbSpec.setFormFactor("M-ATX");
        mbSpec.setRamType("DDR4");
        mbProduct.setSpecification(mbSpec);

        gpuProduct = createProduct(103, "RTX 4060", gpuCategory, 8000000.0, 5);
        ramProduct = createProduct(104, "Corsair 16GB DDR4", ramCategory, 1200000.0, 20);
        ssdProduct = createProduct(105, "Samsung 980 500GB", ssdCategory, 1500000.0, 15);
        psuProduct = createProduct(106, "Corsair CV650", psuCategory, 1400000.0, 10);
    }

    private Category createCategory(int id, String name, String slug, String compType) {
        Category cat = new Category();
        cat.setId(id);
        cat.setName(name);
        cat.setSlug(slug);
        cat.setBuilderSupported(true);
        cat.setBuilderComponentType(compType);
        return cat;
    }

    private Product createProduct(int id, String name, Category cat, Double price, int stock) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setCategory(cat);
        p.setPrice(price);
        p.setStockQuantity(stock);
        return p;
    }

    @Test
    @DisplayName("getBuilderCategories categorizes core components and optional setup gear")
    void testGetBuilderCategories() {
        when(categoryRepository.findByBuilderSupportedTrueOrderByDisplayOrderAsc())
                .thenReturn(List.of(cpuCategory, monitorCategory));

        CategoryResponse cpuResp = new CategoryResponse();
        cpuResp.setId(1);
        cpuResp.setName("CPU");

        CategoryResponse monResp = new CategoryResponse();
        monResp.setId(7);
        monResp.setName("Màn hình");

        when(categoryService.mapToResponse(cpuCategory)).thenReturn(cpuResp);
        when(categoryService.mapToResponse(monitorCategory)).thenReturn(monResp);

        BuilderCategoriesResponse response = pcBuilderService.getBuilderCategories();

        assertNotNull(response);
        assertEquals(1, response.getCoreComponents().size());
        assertEquals("CPU", response.getCoreComponents().get(0).getName());
        assertEquals(1, response.getOptionalSetupGear().size());
        assertEquals("Màn hình", response.getOptionalSetupGear().get(0).getName());
    }

    @Test
    @DisplayName("filterProducts filters out incompatible mainboard when CPU socket does not match")
    void testFilterProducts_MainboardSocketMismatch() {
        when(categoryRepository.findBySlug("mainboard")).thenReturn(Optional.of(mainboardCategory));

        Product incompatibleMb = createProduct(107, "AMD B650M", mainboardCategory, 3500000.0, 5);
        ProductSpecification amdMbSpec = new ProductSpecification();
        amdMbSpec.setSocket("AM5");
        incompatibleMb.setSpecification(amdMbSpec);

        when(productRepository.findByCategoryId(mainboardCategory.getId()))
                .thenReturn(List.of(mbProduct, incompatibleMb));
        when(productRepository.findById(101)).thenReturn(Optional.of(cpuProduct));

        ProductsResponse resp = new ProductsResponse();
        resp.setId(102);
        resp.setName("ASUS B760M-A");
        when(productService.mapToProductResponse(mbProduct)).thenReturn(resp);

        List<ProductsResponse> result = pcBuilderService.filterProducts(
                "mainboard", 101, null, null, null, null, null, null
        );

        assertEquals(1, result.size());
        assertEquals(102, result.get(0).getId());
    }

    @Test
    @DisplayName("saveConfiguration throws BadRequestException when mandatory components are missing")
    void testSaveConfiguration_MissingMandatoryComponents() {
        BuilderSaveConfigurationRequest req = new BuilderSaveConfigurationRequest();
        req.setName("Incomplete Build");
        BuilderItemRequest itemReq = new BuilderItemRequest();
        itemReq.setProductId(101);
        itemReq.setQuantity(1);
        req.setItems(List.of(itemReq));

        when(productRepository.findById(101)).thenReturn(Optional.of(cpuProduct));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                pcBuilderService.saveConfiguration("builderuser", req)
        );

        assertTrue(ex.getMessage().contains("Cấu hình PC bắt buộc phải có đủ"));
    }

    @Test
    @DisplayName("saveConfiguration successfully saves when all 6 mandatory components are provided")
    void testSaveConfiguration_Success() {
        when(userRepository.findByUsername("builderuser")).thenReturn(sampleUser);

        when(productRepository.findById(101)).thenReturn(Optional.of(cpuProduct));
        when(productRepository.findById(102)).thenReturn(Optional.of(mbProduct));
        when(productRepository.findById(103)).thenReturn(Optional.of(gpuProduct));
        when(productRepository.findById(104)).thenReturn(Optional.of(ramProduct));
        when(productRepository.findById(105)).thenReturn(Optional.of(ssdProduct));
        when(productRepository.findById(106)).thenReturn(Optional.of(psuProduct));

        BuilderSaveConfigurationRequest req = new BuilderSaveConfigurationRequest();
        req.setName("Full Build");
        req.setItems(List.of(
                new BuilderItemRequest(101, 1),
                new BuilderItemRequest(102, 1),
                new BuilderItemRequest(103, 1),
                new BuilderItemRequest(104, 1),
                new BuilderItemRequest(105, 1),
                new BuilderItemRequest(106, 1)
        ));

        when(pcConfigurationRepository.save(any(PCConfiguration.class))).thenAnswer(invocation -> {
            PCConfiguration saved = invocation.getArgument(0);
            saved.setId(1);
            return saved;
        });

        PCConfigurationDTO result = pcBuilderService.saveConfiguration("builderuser", req);

        assertNotNull(result);
        assertEquals("Full Build", result.getName());
        assertEquals(20600000.0, result.getTotalPrice());
        assertEquals(6, result.getItems().size());
        verify(pcConfigurationRepository, times(1)).save(any(PCConfiguration.class));
    }

    @Test
    @DisplayName("getConfiguration throws ResourceNotFoundException when config not found")
    void testGetConfiguration_NotFound() {
        when(pcConfigurationRepository.findById(999)).thenReturn(Optional.empty());
        when(pcConfigurationRepository.findByShareToken("999")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                pcBuilderService.getConfiguration("999")
        );
    }

    @Test
    @DisplayName("updateConfiguration throws UnauthorizedException when user does not own config")
    void testUpdateConfiguration_Unauthorized() {
        PCConfiguration config = new PCConfiguration();
        config.setId(10);
        config.setUser(sampleUser);

        when(pcConfigurationRepository.findById(10)).thenReturn(Optional.of(config));

        BuilderSaveConfigurationRequest req = new BuilderSaveConfigurationRequest();

        assertThrows(UnauthorizedException.class, () ->
                pcBuilderService.updateConfiguration(10, "otheruser", req)
        );
    }

    @Test
    @DisplayName("getUserConfigurations throws UnauthorizedException when username is null")
    void testGetUserConfigurations_UsernameNull() {
        assertThrows(UnauthorizedException.class, () ->
                pcBuilderService.getUserConfigurations(null)
        );
    }

    @Test
    @DisplayName("deleteConfiguration throws UnauthorizedException when user does not own config")
    void testDeleteConfiguration_Unauthorized() {
        PCConfiguration config = new PCConfiguration();
        config.setId(10);
        config.setUser(sampleUser);

        when(pcConfigurationRepository.findById(10)).thenReturn(Optional.of(config));

        assertThrows(UnauthorizedException.class, () ->
                pcBuilderService.deleteConfiguration(10, "attacker")
        );
    }

    @Test
    @DisplayName("deleteConfiguration deletes configuration when owned by user")
    void testDeleteConfiguration_Success() {
        PCConfiguration config = new PCConfiguration();
        config.setId(10);
        config.setUser(sampleUser);

        when(pcConfigurationRepository.findById(10)).thenReturn(Optional.of(config));

        pcBuilderService.deleteConfiguration(10, "builderuser");

        verify(pcConfigurationRepository, times(1)).delete(config);
    }

    @Test
    @DisplayName("addConfigurationToCart throws BadRequestException when hardware is incompatible")
    void testAddConfigurationToCart_Incompatible() {
        when(userRepository.findByUsername("builderuser")).thenReturn(sampleUser);

        PCConfiguration config = new PCConfiguration();
        config.setId(1);
        config.setUser(sampleUser);

        PCConfigurationItem item = new PCConfigurationItem();
        item.setProduct(cpuProduct);
        item.setQuantity(1);
        config.setItems(List.of(item));

        when(pcConfigurationRepository.findById(1)).thenReturn(Optional.of(config));

        CompatibilityResponse compatResp = new CompatibilityResponse();
        compatResp.setCompatible(false);
        compatResp.setErrors(List.of(new CompatibilityIssue("ERROR", "Socket CPU không khớp Mainboard", null)));

        when(compatibilityService.validateConfiguration(config)).thenReturn(compatResp);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                pcBuilderService.addConfigurationToCart(1, "builderuser")
        );

        assertTrue(ex.getMessage().contains("Cấu hình không tương thích phần cứng"));
    }

    @Test
    @DisplayName("addConfigurationToCart throws BadRequestException when product stock is insufficient")
    void testAddConfigurationToCart_OutOfStock() {
        when(userRepository.findByUsername("builderuser")).thenReturn(sampleUser);

        PCConfiguration config = new PCConfiguration();
        config.setId(1);
        config.setUser(sampleUser);

        Product outOfStockCpu = createProduct(101, "Intel Core i5-13400F", cpuCategory, 5000000.0, 0);

        PCConfigurationItem item = new PCConfigurationItem();
        item.setProduct(outOfStockCpu);
        item.setQuantity(1);
        config.setItems(List.of(item));

        when(pcConfigurationRepository.findById(1)).thenReturn(Optional.of(config));

        CompatibilityResponse compatResp = new CompatibilityResponse();
        compatResp.setCompatible(true);
        when(compatibilityService.validateConfiguration(config)).thenReturn(compatResp);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                pcBuilderService.addConfigurationToCart(1, "builderuser")
        );

        assertTrue(ex.getMessage().contains("không đủ số lượng trong kho"));
    }

    @Test
    @DisplayName("addConfigurationToCart successfully adds items to cart when valid")
    void testAddConfigurationToCart_Success() {
        when(userRepository.findByUsername("builderuser")).thenReturn(sampleUser);

        PCConfiguration config = new PCConfiguration();
        config.setId(1);
        config.setUser(sampleUser);

        PCConfigurationItem item = new PCConfigurationItem();
        item.setProduct(cpuProduct);
        item.setQuantity(1);
        config.setItems(List.of(item));

        when(pcConfigurationRepository.findById(1)).thenReturn(Optional.of(config));

        CompatibilityResponse compatResp = new CompatibilityResponse();
        compatResp.setCompatible(true);
        when(compatibilityService.validateConfiguration(config)).thenReturn(compatResp);

        Cart cart = new Cart();
        cart.setId(5);
        cart.setUser(sampleUser);
        when(cartRepository.findByUserId(1L)).thenReturn(cart);

        pcBuilderService.addConfigurationToCart(1, "builderuser");

        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }
}
