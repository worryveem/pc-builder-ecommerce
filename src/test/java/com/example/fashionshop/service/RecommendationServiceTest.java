package com.example.fashionshop.service;

import com.example.fashionshop.dto.request.RecommendationRequest;
import com.example.fashionshop.dto.response.RecommendationResponse;
import com.example.fashionshop.dto.response.products.ProductsResponse;
import com.example.fashionshop.model.Category;
import com.example.fashionshop.model.Product;
import com.example.fashionshop.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecommendationServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductService productService;

    @InjectMocks
    private RecommendationService recommendationService;

    private List<Product> mockProducts;

    @BeforeEach
    void setUp() {
        mockProducts = new ArrayList<>();

        Category gpuCat = new Category();
        gpuCat.setId(1);
        gpuCat.setName("VGA");
        gpuCat.setBuilderSupported(true);
        gpuCat.setBuilderComponentType("GPU");

        Product gpu = new Product();
        gpu.setId(101);
        gpu.setName("ASUS RTX 4070 Dual Gaming 12GB");
        gpu.setBrand("ASUS");
        gpu.setPrice(16500000.0);
        gpu.setCategory(gpuCat);
        mockProducts.add(gpu);

        Category cpuCat = new Category();
        cpuCat.setId(2);
        cpuCat.setName("CPU");
        cpuCat.setBuilderSupported(true);
        cpuCat.setBuilderComponentType("CPU");

        Product cpu = new Product();
        cpu.setId(102);
        cpu.setName("AMD Ryzen 5 7600X");
        cpu.setBrand("AMD");
        cpu.setPrice(5990000.0);
        cpu.setCategory(cpuCat);
        mockProducts.add(cpu);

        when(productService.mapToProductResponse(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            ProductsResponse resp = new ProductsResponse();
            resp.setId(p.getId());
            resp.setName(p.getName());
            resp.setBrand(p.getBrand());
            resp.setPrice(p.getPrice());
            return resp;
        });
    }

    @Test
    @DisplayName("Empty query returns catalog fallback recommendations")
    void testRecommendation_EmptyQuery() {
        when(productRepository.findAll()).thenReturn(mockProducts);

        RecommendationRequest req = new RecommendationRequest();
        req.setQuery("");

        RecommendationResponse response = recommendationService.getRecommendations(req);

        assertNotNull(response);
        assertNotNull(response.getAdvice());
        assertFalse(response.getRecommendedProducts().isEmpty());
        assertTrue(response.isHasBuilderRecommendations());
    }

    @Test
    @DisplayName("Gaming query successfully scores and selects gaming hardware")
    void testRecommendation_GamingQuery() {
        when(productRepository.findAll()).thenReturn(mockProducts);

        RecommendationRequest req = new RecommendationRequest();
        req.setQuery("Cần nâng cấp Card chơi game");

        RecommendationResponse response = recommendationService.getRecommendations(req);

        assertNotNull(response);
        assertFalse(response.getRecommendedProducts().isEmpty());
        assertEquals(101, response.getRecommendedProducts().get(0).getId());
    }

    @Test
    @DisplayName("Recommendation strictly returns database products and never fake products")
    void testRecommendation_OnlyExistingProducts() {
        when(productRepository.findAll()).thenReturn(mockProducts);

        RecommendationRequest req = new RecommendationRequest();
        req.setQuery("Laptop văn phòng giá rẻ");

        RecommendationResponse response = recommendationService.getRecommendations(req);

        assertNotNull(response);
        for (ProductsResponse p : response.getRecommendedProducts()) {
            assertTrue(p.getId() == 101 || p.getId() == 102);
        }
    }
}
