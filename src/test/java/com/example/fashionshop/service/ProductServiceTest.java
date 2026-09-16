package com.example.fashionshop.service;

import com.example.fashionshop.common.ProductType;
import com.example.fashionshop.dto.response.products.ProductImageResponse;
import com.example.fashionshop.dto.response.products.ProductSpecificationResponse;
import com.example.fashionshop.dto.response.products.ProductsResponse;
import com.example.fashionshop.model.*;
import com.example.fashionshop.repository.CategoryRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category();
        sampleCategory.setId(1);
        sampleCategory.setName("CPU");
        sampleCategory.setSlug("cpu");
        sampleCategory.setBuilderSupported(true);
        sampleCategory.setBuilderComponentType("CPU");
        sampleCategory.setDescription("Bộ vi xử lý");

        sampleProduct = new Product();
        sampleProduct.setId(101);
        sampleProduct.setName("Intel Core i7 14700K");
        sampleProduct.setBrand("Intel");
        sampleProduct.setModelCode("BX8071514700K");
        sampleProduct.setPrice(10500000.0);
        sampleProduct.setWarrantyMonths(36);
        sampleProduct.setProductType(ProductType.COMPONENT);
        sampleProduct.setStockQuantity(25);
        sampleProduct.setDescription("CPU Intel Gen 14 Socket LGA1700");
        sampleProduct.setCategory(sampleCategory);
        sampleProduct.setImages(new ArrayList<>());
    }

    @Test
    @DisplayName("mapToProductResponse returns null when product is null")
    void testMapToProductResponse_Null() {
        assertNull(productService.mapToProductResponse(null));
    }

    @Test
    @DisplayName("mapToProductResponse maps all fields including category, images, and specification")
    void testMapToProductResponse_FullMapping() {
        ProductImage img = new ProductImage();
        img.setImageUrl("i7_14700k.png");
        img.setIsMain(true);
        sampleProduct.getImages().add(img);

        ProductSpecification spec = new ProductSpecification();
        spec.setId(1);
        spec.setSocket("LGA1700");
        spec.setTdpW(125);
        sampleProduct.setSpecification(spec);

        ProductsResponse response = productService.mapToProductResponse(sampleProduct);

        assertNotNull(response);
        assertEquals(101, response.getId());
        assertEquals("Intel Core i7 14700K", response.getName());
        assertEquals("Intel", response.getBrand());
        assertEquals(10500000.0, response.getPrice());
        assertEquals(1, response.getCategoryId());
        assertEquals("CPU", response.getCategory().getName());
        assertEquals(1, response.getImages().size());
        assertEquals("i7_14700k.png", response.getImages().get(0).getImageUrl());
        assertNotNull(response.getSpecification());
        assertEquals("LGA1700", response.getSpecification().getSocket());
        assertEquals(125, response.getSpecification().getTdpW());
    }

    @Test
    @DisplayName("getAllProducts returns all products correctly")
    void testGetAllProducts() {
        when(productRepository.findAll()).thenReturn(List.of(sampleProduct));

        List<ProductsResponse> list = productService.getAllProducts();

        assertEquals(1, list.size());
        assertEquals("Intel Core i7 14700K", list.get(0).getName());
        verify(productRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getProductDetail returns detail when product exists")
    void testGetProductDetail_Found() {
        when(productRepository.findById(101)).thenReturn(Optional.of(sampleProduct));

        ProductsResponse response = productService.getProductDetail(101L);

        assertNotNull(response);
        assertEquals("Intel Core i7 14700K", response.getName());
    }

    @Test
    @DisplayName("getProductDetail returns null when product not found")
    void testGetProductDetail_NotFound() {
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        ProductsResponse response = productService.getProductDetail(999L);

        assertNull(response);
    }

    @Test
    @DisplayName("getProductsByCategory returns products by category id")
    void testGetProductsByCategory() {
        when(productRepository.findByCategoryId(1)).thenReturn(List.of(sampleProduct));

        List<ProductsResponse> list = productService.getProductsByCategory(1);

        assertEquals(1, list.size());
        assertEquals(1, list.get(0).getCategoryId());
    }

    @Test
    @DisplayName("filterPrice returns products within price range")
    void testFilterPrice() {
        when(productRepository.findByPriceBetweenOrderByPriceAsc(10000000.0, 11000000.0))
                .thenReturn(List.of(sampleProduct));

        List<ProductsResponse> list = productService.filterPrice(10000000.0, 11000000.0);

        assertEquals(1, list.size());
        assertEquals(10500000.0, list.get(0).getPrice());
    }

    @Test
    @DisplayName("filterName returns matching products")
    void testFilterName() {
        when(productRepository.findByNameContainingIgnoreCase("Intel"))
                .thenReturn(List.of(sampleProduct));

        List<ProductsResponse> list = productService.filterName("Intel");

        assertEquals(1, list.size());
        assertTrue(list.get(0).getName().contains("Intel"));
    }

    @Test
    @DisplayName("addProduct successfully saves product with category, images and specification")
    void testAddProduct_Success() {
        ProductsResponse dto = new ProductsResponse();
        dto.setId(201);
        dto.setName("AMD Ryzen 7 7800X3D");
        dto.setBrand("AMD");
        dto.setModelCode("100-100000910WOF");
        dto.setPrice(9800000.0);
        dto.setDescription("CPU Gaming hàng đầu");
        dto.setCategoryId(1);
        dto.setProductType(ProductType.COMPONENT);
        dto.setStockQuantity(15);

        ProductImageResponse imgRes = new ProductImageResponse();
        imgRes.setImageUrl("7800x3d.png");
        dto.setImages(List.of(imgRes));

        ProductSpecificationResponse specRes = new ProductSpecificationResponse();
        specRes.setSocket("AM5");
        specRes.setTdpW(120);
        dto.setSpecification(specRes);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        boolean result = productService.addProduct(dto);

        assertTrue(result);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("addProduct returns false when repository throws exception")
    void testAddProduct_Exception() {
        ProductsResponse dto = new ProductsResponse();
        dto.setId(201);
        dto.setName("Sản phẩm lỗi");

        when(productRepository.save(any())).thenThrow(new RuntimeException("Database error"));

        boolean result = productService.addProduct(dto);

        assertFalse(result);
    }

    @Test
    @DisplayName("updateProduct returns false when product not found")
    void testUpdateProduct_NotFound() {
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        boolean result = productService.updateProduct(999, new ProductsResponse());

        assertFalse(result);
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateProduct successfully updates existing product")
    void testUpdateProduct_Success() {
        ProductsResponse dto = new ProductsResponse();
        dto.setName("Intel Core i7 14700KF");
        dto.setBrand("Intel");
        dto.setPrice(10100000.0);
        dto.setDescription("CPU Intel Gen 14 không iGPU");
        dto.setCategoryId(1);

        when(productRepository.findById(101)).thenReturn(Optional.of(sampleProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(sampleCategory));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        boolean result = productService.updateProduct(101, dto);

        assertTrue(result);
        assertEquals("Intel Core i7 14700KF", sampleProduct.getName());
        assertEquals(10100000.0, sampleProduct.getPrice());
        verify(productRepository, times(1)).save(sampleProduct);
    }

    @Test
    @DisplayName("deleteProduct returns true when delete succeeds")
    void testDeleteProduct_Success() {
        doNothing().when(productRepository).deleteById(101);

        boolean result = productService.deleteProduct(101);

        assertTrue(result);
        verify(productRepository, times(1)).deleteById(101);
    }

    @Test
    @DisplayName("deleteProduct returns false when exception occurs")
    void testDeleteProduct_Exception() {
        doThrow(new RuntimeException("Foreign key violation")).when(productRepository).deleteById(101);

        boolean result = productService.deleteProduct(101);

        assertFalse(result);
    }
}
