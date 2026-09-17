package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.Exception.BadRequestException;
import com.example.pcbuilderecommerce.Exception.ResourceNotFoundException;
import com.example.pcbuilderecommerce.Exception.UnauthorizedException;
import com.example.pcbuilderecommerce.common.ProductType;
import com.example.pcbuilderecommerce.dto.PCConfigurationDTO;
import com.example.pcbuilderecommerce.dto.PCConfigurationItemDTO;
import com.example.pcbuilderecommerce.dto.request.builder.BuilderItemRequest;
import com.example.pcbuilderecommerce.dto.request.builder.BuilderSaveConfigurationRequest;
import com.example.pcbuilderecommerce.dto.response.builder.BuilderCategoriesResponse;
import com.example.pcbuilderecommerce.dto.response.builder.CompatibilityIssue;
import com.example.pcbuilderecommerce.dto.response.builder.CompatibilityResponse;
import com.example.pcbuilderecommerce.dto.response.products.CategoryResponse;
import com.example.pcbuilderecommerce.dto.response.products.ProductsResponse;
import com.example.pcbuilderecommerce.model.*;
import com.example.pcbuilderecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PCBuilderService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PCConfigurationRepository pcConfigurationRepository;

    @Autowired
    private PCConfigurationItemRepository pcConfigurationItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompatibilityService compatibilityService;

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryService categoryService;

    private static final Set<String> CORE_COMPONENT_TYPES = Set.of(
            "CPU", "MAINBOARD", "GPU", "RAM", "SSD", "HDD", "PSU", "COOLER", "CPU_COOLER", "CASE", "FAN", "CASE_FAN"
    );

    private static final Set<String> MANDATORY_BUILDER_TYPES = Set.of(
            "CPU", "MAINBOARD", "GPU", "RAM", "SSD", "PSU"
    );

    private static final Set<String> OPTIONAL_SETUP_GEAR_TYPES = Set.of(
            "MONITOR", "KEYBOARD", "MOUSE", "HEADSET", "WEBCAM"
    );

    private void validateMandatoryComponents(List<PCConfigurationItem> items) {
        Set<String> presentTypes = new HashSet<>();
        for (PCConfigurationItem item : items) {
            Product product = item.getProduct();
            if (product != null && product.getCategory() != null) {
                String type = product.getCategory().getBuilderComponentType();
                if (type == null || type.trim().isEmpty()) {
                    type = product.getCategory().getSlug();
                }
                if (type != null) {
                    type = type.trim().toUpperCase();
                    if ("MOTHERBOARD".equals(type)) {
                        type = "MAINBOARD";
                    }
                    presentTypes.add(type);
                }
            }
        }

        List<String> missing = new ArrayList<>();
        for (String req : MANDATORY_BUILDER_TYPES) {
            if (!presentTypes.contains(req)) {
                missing.add(req);
            }
        }

        if (!missing.isEmpty()) {
            throw new BadRequestException("Cấu hình PC bắt buộc phải có đủ: CPU, Mainboard, GPU, RAM, SSD, Nguồn (PSU). Đang thiếu: " + String.join(", ", missing));
        }
    }

    /**
     * Get builder categories divided into core components and optional setup gear.
     */
    public BuilderCategoriesResponse getBuilderCategories() {
        List<Category> categories = categoryRepository.findByBuilderSupportedTrueOrderByDisplayOrderAsc();

        BuilderCategoriesResponse response = new BuilderCategoriesResponse();

        for (Category cat : categories) {
            CategoryResponse catResp = categoryService.mapToResponse(cat);
            String type = cat.getBuilderComponentType() != null ? cat.getBuilderComponentType().trim().toUpperCase() : "";

            if (CORE_COMPONENT_TYPES.contains(type)) {
                response.getCoreComponents().add(catResp);
            } else if (OPTIONAL_SETUP_GEAR_TYPES.contains(type) || cat.getParent() != null) {
                response.getOptionalSetupGear().add(catResp);
            } else {
                response.getCoreComponents().add(catResp);
            }
        }

        return response;
    }

    /**
     * Filter products compatible with selected components for the builder slot.
     */
    public List<ProductsResponse> filterProducts(
            String categorySlug,
            Integer selectedCpuId,
            Integer selectedCaseId,
            Integer selectedMainboardId,
            String brand,
            Double minPrice,
            Double maxPrice,
            String sort
    ) {
        Category category = categoryRepository.findBySlug(categorySlug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categorySlug));

        List<Product> products = productRepository.findByCategoryId(category.getId());

        // Check if category is accessory / optional gear
        String compType = category.getBuilderComponentType() != null ? category.getBuilderComponentType().trim().toUpperCase() : "";
        boolean isAccessory = OPTIONAL_SETUP_GEAR_TYPES.contains(compType) || category.getParent() != null;

        // Apply hardware compatibility filters only to core components
        if (!isAccessory) {
            Product selectedCpu = selectedCpuId != null ? productRepository.findById(selectedCpuId).orElse(null) : null;
            Product selectedCase = selectedCaseId != null ? productRepository.findById(selectedCaseId).orElse(null) : null;
            Product selectedMb = selectedMainboardId != null ? productRepository.findById(selectedMainboardId).orElse(null) : null;

            products = products.stream().filter(p -> {
                ProductSpecification spec = p.getSpecification();
                if (spec == null) return true;

                // Mainboard filtering
                if ("MAINBOARD".equals(compType)) {
                    if (selectedCpu != null && selectedCpu.getSpecification() != null) {
                        String cpuSocket = selectedCpu.getSpecification().getSocket();
                        if (cpuSocket != null && spec.getSocket() != null) {
                            if (!cpuSocket.trim().equalsIgnoreCase(spec.getSocket().trim())) {
                                return false;
                            }
                        }
                    }
                    if (selectedCase != null && selectedCase.getSpecification() != null) {
                        Set<String> supportedFormFactors = selectedCase.getSpecification().getSupportedFormFactorsSet();
                        if (!supportedFormFactors.isEmpty() && spec.getFormFactor() != null) {
                            if (!supportedFormFactors.contains(spec.getFormFactor().trim().toUpperCase())) {
                                return false;
                            }
                        }
                    }
                }

                // CPU filtering (if mainboard is selected)
                if ("CPU".equals(compType) && selectedMb != null && selectedMb.getSpecification() != null) {
                    String mbSocket = selectedMb.getSpecification().getSocket();
                    if (mbSocket != null && spec.getSocket() != null) {
                        if (!mbSocket.trim().equalsIgnoreCase(spec.getSocket().trim())) {
                            return false;
                        }
                    }
                }

                // RAM filtering (if mainboard is selected)
                if ("RAM".equals(compType) && selectedMb != null && selectedMb.getSpecification() != null) {
                    String mbRamType = selectedMb.getSpecification().getRamType();
                    if (mbRamType != null && spec.getRamType() != null) {
                        if (!mbRamType.trim().equalsIgnoreCase(spec.getRamType().trim())) {
                            return false;
                        }
                    }
                }

                // Cooler filtering
                if ("COOLER".equals(compType) || "CPU_COOLER".equals(compType)) {
                    if (selectedCpu != null && selectedCpu.getSpecification() != null) {
                        String cpuSocket = selectedCpu.getSpecification().getSocket();
                        Set<String> supportedSockets = spec.getSupportedSocketsSet();
                        if (cpuSocket != null && !supportedSockets.isEmpty()) {
                            if (!supportedSockets.contains(cpuSocket.trim().toUpperCase())) {
                                return false;
                            }
                        }
                    }
                    if (selectedCase != null && selectedCase.getSpecification() != null) {
                        Integer maxCoolerHeight = selectedCase.getSpecification().getMaxCoolerHeightMm();
                        if (maxCoolerHeight != null && spec.getCoolerHeightMm() != null) {
                            if (spec.getCoolerHeightMm() > maxCoolerHeight) {
                                return false;
                            }
                        }
                    }
                }

                // GPU filtering
                if ("GPU".equals(compType) && selectedCase != null && selectedCase.getSpecification() != null) {
                    Integer maxGpuLength = selectedCase.getSpecification().getMaxGpuLengthMm();
                    if (maxGpuLength != null && spec.getGpuLengthMm() != null) {
                        if (spec.getGpuLengthMm() > maxGpuLength) {
                            return false;
                        }
                    }
                }

                // Case filtering
                if ("CASE".equals(compType)) {
                    Set<String> supportedFormFactors = spec.getSupportedFormFactorsSet();
                    if (selectedMb != null && selectedMb.getSpecification() != null && !supportedFormFactors.isEmpty()) {
                        String mbFormFactor = selectedMb.getSpecification().getFormFactor();
                        if (mbFormFactor != null && !supportedFormFactors.contains(mbFormFactor.trim().toUpperCase())) {
                            return false;
                        }
                    }
                }

                return true;
            }).collect(Collectors.toList());
        }

        // Apply commercial filters: brand, price
        if (brand != null && !brand.trim().isEmpty()) {
            products = products.stream()
                    .filter(p -> p.getBrand() != null && p.getBrand().equalsIgnoreCase(brand.trim()))
                    .collect(Collectors.toList());
        }

        if (minPrice != null) {
            products = products.stream()
                    .filter(p -> p.getPrice() != null && p.getPrice() >= minPrice)
                    .collect(Collectors.toList());
        }

        if (maxPrice != null) {
            products = products.stream()
                    .filter(p -> p.getPrice() != null && p.getPrice() <= maxPrice)
                    .collect(Collectors.toList());
        }

        // Apply sort
        if ("price_asc".equalsIgnoreCase(sort)) {
            products.sort(Comparator.comparingDouble(p -> p.getPrice() != null ? p.getPrice() : 0.0));
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            products.sort((p1, p2) -> Double.compare(p2.getPrice() != null ? p2.getPrice() : 0.0, p1.getPrice() != null ? p1.getPrice() : 0.0));
        }

        return products.stream().map(productService::mapToProductResponse).collect(Collectors.toList());
    }

    /**
     * Save configuration for user or guest (with shareToken).
     */
    @Transactional
    public PCConfigurationDTO saveConfiguration(String username, BuilderSaveConfigurationRequest req) {
        User user = (username != null) ? userRepository.findByUsername(username) : null;

        PCConfiguration config = new PCConfiguration();
        config.setUser(user);
        config.setName(req.getName() != null && !req.getName().trim().isEmpty() ? req.getName().trim() : "Cấu hình PC của tôi");
        config.setShareToken(UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        config.setCreatedAt(LocalDateTime.now());
        config.setUpdatedAt(LocalDateTime.now());

        double totalPrice = 0.0;
        List<PCConfigurationItem> items = new ArrayList<>();

        if (req.getItems() != null) {
            for (BuilderItemRequest itemReq : req.getItems()) {
                if (itemReq.getProductId() != null) {
                    Product product = productRepository.findById(itemReq.getProductId()).orElse(null);
                    if (product != null) {
                        int qty = (itemReq.getQuantity() != null && itemReq.getQuantity() > 0) ? itemReq.getQuantity() : 1;
                        double price = product.getPrice() != null ? product.getPrice() : 0.0;

                        PCConfigurationItem item = new PCConfigurationItem();
                        item.setConfiguration(config);
                        item.setProduct(product);
                        item.setQuantity(qty);
                        item.setPriceAtSelection(price);

                        totalPrice += price * qty;
                        items.add(item);
                    }
                }
            }
        }

        // Validate mandatory components (CPU, MAINBOARD, GPU, RAM, SSD, PSU)
        validateMandatoryComponents(items);

        config.setTotalPrice(totalPrice);
        config.setItems(items);

        PCConfiguration saved = pcConfigurationRepository.save(config);
        return mapToDTO(saved);
    }

    /**
     * Get configuration by ID or share token.
     */
    public PCConfigurationDTO getConfiguration(String idOrToken) {
        PCConfiguration config = null;

        try {
            int id = Integer.parseInt(idOrToken);
            config = pcConfigurationRepository.findById(id).orElse(null);
        } catch (NumberFormatException ignored) {
        }

        if (config == null) {
            config = pcConfigurationRepository.findByShareToken(idOrToken)
                    .orElseThrow(() -> new ResourceNotFoundException("Configuration not found: " + idOrToken));
        }

        return mapToDTO(config);
    }

    /**
     * Update configuration. User can only edit own configuration.
     */
    @Transactional
    public PCConfigurationDTO updateConfiguration(Integer id, String username, BuilderSaveConfigurationRequest req) {
        PCConfiguration config = pcConfigurationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration not found: " + id));

        // Ownership validation
        if (config.getUser() != null) {
            if (username == null || !config.getUser().getUsername().equals(username)) {
                throw new UnauthorizedException("Bạn không có quyền chỉnh sửa cấu hình này");
            }
        }

        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            config.setName(req.getName().trim());
        }

        // Clear existing items and recalculate totalPrice
        config.getItems().clear();
        double totalPrice = 0.0;

        if (req.getItems() != null) {
            for (BuilderItemRequest itemReq : req.getItems()) {
                if (itemReq.getProductId() != null) {
                    Product product = productRepository.findById(itemReq.getProductId()).orElse(null);
                    if (product != null) {
                        int qty = (itemReq.getQuantity() != null && itemReq.getQuantity() > 0) ? itemReq.getQuantity() : 1;
                        double price = product.getPrice() != null ? product.getPrice() : 0.0;

                        PCConfigurationItem item = new PCConfigurationItem();
                        item.setConfiguration(config);
                        item.setProduct(product);
                        item.setQuantity(qty);
                        item.setPriceAtSelection(price);

                        totalPrice += price * qty;
                        config.getItems().add(item);
                    }
                }
            }
        }

        // Validate mandatory components (CPU, MAINBOARD, GPU, RAM, SSD, PSU)
        validateMandatoryComponents(config.getItems());

        config.setTotalPrice(totalPrice);
        config.setUpdatedAt(LocalDateTime.now());

        PCConfiguration updated = pcConfigurationRepository.save(config);
        return mapToDTO(updated);
    }

    /**
     * Get all saved PC configurations belonging to user
     */
    public List<PCConfigurationDTO> getUserConfigurations(String username) {
        if (username == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập để xem danh sách cấu hình đã lưu");
        }
        List<PCConfiguration> configs = pcConfigurationRepository.findByUserUsernameOrderByUpdatedAtDesc(username);
        return configs.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    /**
     * Delete saved PC configuration with ownership check
     */
    @Transactional
    public void deleteConfiguration(Integer id, String username) {
        if (username == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập để thực hiện thao tác này");
        }
        PCConfiguration config = pcConfigurationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy cấu hình với ID: " + id));

        if (config.getUser() != null && !config.getUser().getUsername().equals(username)) {
            throw new UnauthorizedException("Bạn không có quyền xóa cấu hình này");
        }

        pcConfigurationRepository.delete(config);
    }

    /**
     * Add entire PCConfiguration to Cart with transactional safety.
     * Validates compatibility, stock, and ownership. Rollback completely on any failure.
     */
    @Transactional
    public void addConfigurationToCart(Integer configurationId, String username) {
        if (username == null) {
            throw new UnauthorizedException("Vui lòng đăng nhập để thêm cấu hình vào giỏ hàng");
        }

        User user = userRepository.findByUsername(username);
        if (user == null) throw new ResourceNotFoundException("User not found: " + username);

        PCConfiguration config = pcConfigurationRepository.findById(configurationId)
                .orElseThrow(() -> new ResourceNotFoundException("Configuration not found: " + configurationId));

        // 1. Validate ownership if user is attached
        if (config.getUser() != null && !config.getUser().getUsername().equals(username)) {
            throw new UnauthorizedException("Bạn không sở hữu cấu hình này");
        }

        if (config.getItems() == null || config.getItems().isEmpty()) {
            throw new BadRequestException("Cấu hình chưa có linh kiện nào");
        }

        // 2. Validate compatibility (Hard check: no ERRORs allowed)
        CompatibilityResponse compatibilityResponse = compatibilityService.validateConfiguration(config);
        if (!compatibilityResponse.isCompatible()) {
            String errorMsg = compatibilityResponse.getErrors().stream()
                    .map(CompatibilityIssue::getMessage)
                    .collect(Collectors.joining("; "));
            throw new BadRequestException("Cấu hình không tương thích phần cứng: " + errorMsg);
        }

        // 3. Validate stock availability for each item
        for (PCConfigurationItem item : config.getItems()) {
            Product p = item.getProduct();
            if (p == null) {
                throw new BadRequestException("Sản phẩm trong cấu hình không tồn tại");
            }
            int stock = p.getStockQuantity() != null ? p.getStockQuantity() : 0;
            if (stock < item.getQuantity()) {
                throw new BadRequestException("Sản phẩm '" + p.getName() + "' không đủ số lượng trong kho (Còn: " + stock + ", Yêu cầu: " + item.getQuantity() + ")");
            }
        }

        // 4. Find or create Cart for user
        Cart cart = cartRepository.findByUserId(user.getId());
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart = cartRepository.save(cart);
        }

        // 5. Batch insert cart items with configuration_id
        for (PCConfigurationItem item : config.getItems()) {
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(item.getProduct());
            cartItem.setConfiguration(config);
            cartItem.setQuantity(item.getQuantity());
            cartItemRepository.save(cartItem);
        }
    }

    public PCConfigurationDTO mapToDTO(PCConfiguration config) {
        if (config == null) return null;
        PCConfigurationDTO dto = new PCConfigurationDTO();
        dto.setId(config.getId());
        if (config.getUser() != null) {
            dto.setUserId((int) (long) config.getUser().getId());
        }
        dto.setName(config.getName());
        dto.setShareToken(config.getShareToken());
        dto.setTotalPrice(config.getTotalPrice());
        dto.setCreatedAt(config.getCreatedAt());
        dto.setUpdatedAt(config.getUpdatedAt());

        List<PCConfigurationItemDTO> itemDTOs = new ArrayList<>();
        if (config.getItems() != null) {
            for (PCConfigurationItem item : config.getItems()) {
                PCConfigurationItemDTO itemDTO = new PCConfigurationItemDTO();
                itemDTO.setId(item.getId());
                if (item.getProduct() != null) {
                    itemDTO.setProductId(item.getProduct().getId());
                    itemDTO.setProduct(productService.mapToProductResponse(item.getProduct()));
                }
                itemDTO.setComponentType(item.getComponentType());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPriceAtSelection(item.getPriceAtSelection());
                itemDTOs.add(itemDTO);
            }
        }
        dto.setItems(itemDTOs);
        return dto;
    }
}
