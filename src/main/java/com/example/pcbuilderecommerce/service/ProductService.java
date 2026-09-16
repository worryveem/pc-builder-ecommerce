package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.common.ProductType;
import com.example.pcbuilderecommerce.dto.response.products.*;
import com.example.pcbuilderecommerce.model.*;
import com.example.pcbuilderecommerce.repository.CategoryRepository;
import com.example.pcbuilderecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public ProductsResponse mapToProductResponse(Product product) {
        if (product == null) return null;
        ProductsResponse response = new ProductsResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setBrand(product.getBrand());
        response.setModelCode(product.getModelCode());
        response.setPrice(product.getPrice());
        response.setWarrantyMonths(product.getWarrantyMonths());
        response.setProductType(product.getProductType());
        response.setStockQuantity(product.getStockQuantity());
        response.setDescription(product.getDescription());

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            CategoryResponse catResp = new CategoryResponse();
            catResp.setId(product.getCategory().getId());
            catResp.setName(product.getCategory().getName());
            catResp.setSlug(product.getCategory().getSlug());
            catResp.setDescription(product.getCategory().getDescription());
            catResp.setBuilderSupported(product.getCategory().getBuilderSupported());
            catResp.setBuilderComponentType(product.getCategory().getBuilderComponentType());
            catResp.setDisplayOrder(product.getCategory().getDisplayOrder());
            if (product.getCategory().getParent() != null) {
                catResp.setParentId((long) product.getCategory().getParent().getId());
            }
            response.setCategory(catResp);
        }

        List<ProductImageResponse> productImageResponses = new ArrayList<>();
        if (product.getImages() != null) {
            for (ProductImage image : product.getImages()) {
                ProductImageResponse productImageResponse = new ProductImageResponse();
                productImageResponse.setImageUrl(image.getImageUrl());
                productImageResponses.add(productImageResponse);
            }
        }
        response.setImages(productImageResponses);

        if (product.getSpecification() != null) {
            ProductSpecification spec = product.getSpecification();
            ProductSpecificationResponse specResp = new ProductSpecificationResponse();
            specResp.setId(spec.getId());
            specResp.setSocket(spec.getSocket());
            specResp.setChipset(spec.getChipset());
            specResp.setSupportedSockets(spec.getSupportedSockets());
            specResp.setCoolerHeightMm(spec.getCoolerHeightMm());
            specResp.setRamType(spec.getRamType());
            specResp.setMaxRamCapacity(spec.getMaxRamCapacity());
            specResp.setRamSlots(spec.getRamSlots());
            specResp.setCapacityGb(spec.getCapacityGb());
            specResp.setSpeedMhz(spec.getSpeedMhz());
            specResp.setModulesCount(spec.getModulesCount());
            specResp.setFormFactor(spec.getFormFactor());
            specResp.setSupportedFormFactors(spec.getSupportedFormFactors());
            specResp.setGpuLengthMm(spec.getGpuLengthMm());
            specResp.setMaxGpuLengthMm(spec.getMaxGpuLengthMm());
            specResp.setMaxCoolerHeightMm(spec.getMaxCoolerHeightMm());
            specResp.setTdpW(spec.getTdpW());
            specResp.setPowerConsumptionW(spec.getPowerConsumptionW());
            specResp.setRecommendedPsuW(spec.getRecommendedPsuW());
            specResp.setPsuWattage(spec.getPsuWattage());
            specResp.setScreenSize(spec.getScreenSize());
            specResp.setResolution(spec.getResolution());
            specResp.setRefreshRate(spec.getRefreshRate());
            specResp.setPanelType(spec.getPanelType());
            specResp.setResponseTime(spec.getResponseTime());
            specResp.setRawExtraSpecs(spec.getRawExtraSpecs());
            response.setSpecification(specResp);
        }

        return response;
    }

    // hiển thị toàn bộ sản phẩm
    public List<ProductsResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        List<ProductsResponse> productsResponses = new ArrayList<>();
        for (Product product : products) {
            productsResponses.add(mapToProductResponse(product));
        }
        return productsResponses;
    }

    // hiển thị chi tiết sản phẩm
    public ProductsResponse getProductDetail(long id) {
        Product product = productRepository.findById((int) id).orElse(null);
        return mapToProductResponse(product);
    }

    // lọc sản phẩm theo danh mục
    public List<ProductsResponse> getProductsByCategory(int categoryId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        List<ProductsResponse> productsResponses = new ArrayList<>();
        for (Product product : products) {
            productsResponses.add(mapToProductResponse(product));
        }
        return productsResponses;
    }

    // lọc theo loại sản phẩm (COMPONENT, PREBUILT_PC, LAPTOP, ACCESSORY)
    public List<ProductsResponse> getProductsByType(ProductType productType) {
        List<Product> products = productRepository.findByProductType(productType);
        List<ProductsResponse> productsResponses = new ArrayList<>();
        for (Product product : products) {
            productsResponses.add(mapToProductResponse(product));
        }
        return productsResponses;
    }

    // lọc sản phẩm theo mức giá
    public List<ProductsResponse> filterPrice(double minPrice, double maxPrice) {
        List<Product> products = productRepository.findByPriceBetweenOrderByPriceAsc(minPrice, maxPrice);
        List<ProductsResponse> productsResponses = new ArrayList<>();
        for (Product product : products) {
            productsResponses.add(mapToProductResponse(product));
        }
        return productsResponses;
    }

    // tìm kiếm sản phẩm theo tên
    public List<ProductsResponse> filterName(String name) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(name);
        List<ProductsResponse> productsResponses = new ArrayList<>();
        for (Product product : products) {
            productsResponses.add(mapToProductResponse(product));
        }
        return productsResponses;
    }

    // thêm sản phẩm
    public boolean addProduct(ProductsResponse productsResponse) {
        Product product = new Product();
        if (productsResponse.getId() > 0) {
            product.setId((int) productsResponse.getId());
        }
        product.setName(productsResponse.getName());
        product.setBrand(productsResponse.getBrand() != null ? productsResponse.getBrand() : "OEM");
        product.setModelCode(productsResponse.getModelCode());
        product.setDescription(productsResponse.getDescription());
        product.setPrice(productsResponse.getPrice());
        product.setWarrantyMonths(productsResponse.getWarrantyMonths() != null ? productsResponse.getWarrantyMonths() : 36);
        product.setProductType(productsResponse.getProductType() != null ? productsResponse.getProductType() : ProductType.COMPONENT);
        product.setStockQuantity(productsResponse.getStockQuantity() != null ? productsResponse.getStockQuantity() : 0);
        product.setCreatedAt(LocalDateTime.now());

        Category category = categoryRepository.findById(productsResponse.getCategoryId()).orElse(null);
        product.setCategory(category);

        try {
            if (productsResponse.getImages() != null) {
                List<ProductImage> images = new ArrayList<>();
                for (ProductImageResponse imgRes : productsResponse.getImages()) {
                    ProductImage pi = new ProductImage();
                    pi.setImageUrl(imgRes.getImageUrl());
                    pi.setIsMain(images.isEmpty());
                    pi.setProduct(product);
                    images.add(pi);
                }
                product.setImages(images);
            }

            if (productsResponse.getSpecification() != null) {
                ProductSpecification spec = new ProductSpecification();
                spec.setProduct(product);
                copySpecificationFields(productsResponse.getSpecification(), spec);
                product.setSpecification(spec);
            }

            productRepository.save(product);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // sửa sản phẩm
    public boolean updateProduct(Integer id, ProductsResponse productsResponse) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) return false;

        product.setName(productsResponse.getName());
        if (productsResponse.getBrand() != null) product.setBrand(productsResponse.getBrand());
        if (productsResponse.getModelCode() != null) product.setModelCode(productsResponse.getModelCode());
        product.setDescription(productsResponse.getDescription());
        product.setPrice(productsResponse.getPrice());
        if (productsResponse.getWarrantyMonths() != null) product.setWarrantyMonths(productsResponse.getWarrantyMonths());
        if (productsResponse.getProductType() != null) product.setProductType(productsResponse.getProductType());
        if (productsResponse.getStockQuantity() != null) product.setStockQuantity(productsResponse.getStockQuantity());

        Category category = categoryRepository.findById(productsResponse.getCategoryId()).orElse(null);
        product.setCategory(category);

        try {
            // Sync Images
            if (productsResponse.getImages() != null) {
                if (product.getImages() == null) {
                    product.setImages(new ArrayList<>());
                } else {
                    product.getImages().clear();
                }
                for (ProductImageResponse imgRes : productsResponse.getImages()) {
                    ProductImage pi = new ProductImage();
                    pi.setImageUrl(imgRes.getImageUrl());
                    pi.setIsMain(product.getImages().isEmpty());
                    pi.setProduct(product);
                    product.getImages().add(pi);
                }
            }

            // Sync Specifications
            if (productsResponse.getSpecification() != null) {
                ProductSpecification spec = product.getSpecification();
                if (spec == null) {
                    spec = new ProductSpecification();
                    spec.setProduct(product);
                }
                copySpecificationFields(productsResponse.getSpecification(), spec);
                product.setSpecification(spec);
            }

            productRepository.save(product);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private void copySpecificationFields(ProductSpecificationResponse source, ProductSpecification target) {
        target.setSocket(source.getSocket());
        target.setChipset(source.getChipset());
        target.setSupportedSockets(source.getSupportedSockets());
        target.setCoolerHeightMm(source.getCoolerHeightMm());
        target.setRamType(source.getRamType());
        target.setMaxRamCapacity(source.getMaxRamCapacity());
        target.setRamSlots(source.getRamSlots());
        target.setCapacityGb(source.getCapacityGb());
        target.setSpeedMhz(source.getSpeedMhz());
        target.setModulesCount(source.getModulesCount() != null ? source.getModulesCount() : 1);
        target.setFormFactor(source.getFormFactor());
        target.setSupportedFormFactors(source.getSupportedFormFactors());
        target.setGpuLengthMm(source.getGpuLengthMm());
        target.setMaxGpuLengthMm(source.getMaxGpuLengthMm());
        target.setMaxCoolerHeightMm(source.getMaxCoolerHeightMm());
        target.setTdpW(source.getTdpW());
        target.setPowerConsumptionW(source.getPowerConsumptionW());
        target.setRecommendedPsuW(source.getRecommendedPsuW());
        target.setPsuWattage(source.getPsuWattage());
        target.setScreenSize(source.getScreenSize());
        target.setResolution(source.getResolution());
        target.setRefreshRate(source.getRefreshRate());
        target.setPanelType(source.getPanelType());
        target.setResponseTime(source.getResponseTime());
        target.setRawExtraSpecs(source.getRawExtraSpecs());
    }

    // xóa sản phẩm
    public boolean deleteProduct(Integer id) {
        try {
            productRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
