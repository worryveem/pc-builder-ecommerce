package com.example.pcbuilderecommerce.controller;

import com.example.pcbuilderecommerce.Exception.GlobalExceptionHandler;
import com.example.pcbuilderecommerce.Exception.ResourceNotFoundException;
import com.example.pcbuilderecommerce.dto.PCConfigurationDTO;
import com.example.pcbuilderecommerce.dto.request.builder.BuilderSaveConfigurationRequest;
import com.example.pcbuilderecommerce.dto.response.builder.BuilderCategoriesResponse;
import com.example.pcbuilderecommerce.service.CompatibilityService;
import com.example.pcbuilderecommerce.service.PCBuilderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PCBuilderControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PCBuilderService pcBuilderService;

    @Mock
    private CompatibilityService compatibilityService;

    @InjectMocks
    private PCBuilderController pcBuilderController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(pcBuilderController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/builder/categories returns categories response")
    void testGetBuilderCategories() throws Exception {
        BuilderCategoriesResponse response = new BuilderCategoriesResponse();
        when(pcBuilderService.getBuilderCategories()).thenReturn(response);

        mockMvc.perform(get("/api/builder/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").exists());

        verify(pcBuilderService, times(1)).getBuilderCategories();
    }

    @Test
    @DisplayName("GET /api/builder/filter-products returns filtered products")
    void testFilterProducts() throws Exception {
        when(pcBuilderService.filterProducts(eq("cpu"), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/builder/filter-products")
                        .param("categorySlug", "cpu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        verify(pcBuilderService, times(1)).filterProducts(eq("cpu"), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("POST /api/builder/configurations saves configuration")
    void testSaveConfiguration() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken("builderuser", "password", Collections.emptyList());

        BuilderSaveConfigurationRequest req = new BuilderSaveConfigurationRequest();
        req.setName("Dàn PC Gaming");

        PCConfigurationDTO dto = new PCConfigurationDTO();
        dto.setId(1);
        dto.setName("Dàn PC Gaming");
        dto.setTotalPrice(15000000.0);

        when(pcBuilderService.saveConfiguration(eq("builderuser"), any(BuilderSaveConfigurationRequest.class)))
                .thenReturn(dto);

        mockMvc.perform(post("/api/builder/configurations")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.name").value("Dàn PC Gaming"));
    }

    @Test
    @DisplayName("GET /api/builder/configurations/{idOrToken} returns 404 when not found")
    void testGetConfiguration_NotFound() throws Exception {
        when(pcBuilderService.getConfiguration("999"))
                .thenThrow(new ResourceNotFoundException("Configuration not found: 999"));

        mockMvc.perform(get("/api/builder/configurations/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Configuration not found: 999"));
    }

    @Test
    @DisplayName("POST /api/builder/configurations/{id}/add-to-cart adds to cart")
    void testAddConfigurationToCart() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken("builderuser", "password", Collections.emptyList());

        doNothing().when(pcBuilderService).addConfigurationToCart(1, "builderuser");

        mockMvc.perform(post("/api/builder/configurations/1/add-to-cart").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đã thêm toàn bộ linh kiện trong cấu hình vào giỏ hàng thành công"));

        verify(pcBuilderService, times(1)).addConfigurationToCart(1, "builderuser");
    }

    @Test
    @DisplayName("DELETE /api/builder/configurations/{id} deletes configuration")
    void testDeleteConfiguration() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken("builderuser", "password", Collections.emptyList());

        doNothing().when(pcBuilderService).deleteConfiguration(1, "builderuser");

        mockMvc.perform(delete("/api/builder/configurations/1").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đã xóa cấu hình PC thành công"));

        verify(pcBuilderService, times(1)).deleteConfiguration(1, "builderuser");
    }
}
