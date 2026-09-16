package com.example.pcbuilderecommerce.controller;

import com.example.pcbuilderecommerce.dto.request.builder.BuilderSaveConfigurationRequest;
import com.example.pcbuilderecommerce.dto.request.builder.BuilderValidateRequest;
import com.example.pcbuilderecommerce.dto.response.ResponseData;
import com.example.pcbuilderecommerce.service.CompatibilityService;
import com.example.pcbuilderecommerce.service.PCBuilderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/builder")
public class PCBuilderController {

    @Autowired
    private PCBuilderService pcBuilderService;

    @Autowired
    private CompatibilityService compatibilityService;

    // 1. Kiểm tra tính tương thích của cấu hình linh kiện
    @PostMapping("/validate")
    public ResponseEntity<ResponseData> validateConfiguration(@RequestBody BuilderValidateRequest request) {
        ResponseData res = new ResponseData();
        res.setData(compatibilityService.validateItemRequests(request.getItems()));
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // 2. Lấy danh sách các danh mục hỗ trợ Builder (phân nhóm Core Components và Optional Setup Gear)
    @GetMapping("/categories")
    public ResponseEntity<ResponseData> getBuilderCategories() {
        ResponseData res = new ResponseData();
        res.setData(pcBuilderService.getBuilderCategories());
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // 3. Lọc danh sách linh kiện tương thích theo từng slot
    @GetMapping("/filter-products")
    public ResponseEntity<ResponseData> filterProducts(
            @RequestParam String categorySlug,
            @RequestParam(required = false) Integer selectedCpuId,
            @RequestParam(required = false) Integer selectedCaseId,
            @RequestParam(required = false) Integer selectedMainboardId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String sort
    ) {
        ResponseData res = new ResponseData();
        res.setData(pcBuilderService.filterProducts(
                categorySlug,
                selectedCpuId,
                selectedCaseId,
                selectedMainboardId,
                brand,
                minPrice,
                maxPrice,
                sort
        ));
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // 4. Lưu cấu hình PC mới
    @PostMapping("/configurations")
    public ResponseEntity<ResponseData> saveConfiguration(
            @RequestBody BuilderSaveConfigurationRequest request,
            Authentication authentication
    ) {
        String username = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : null;
        ResponseData res = new ResponseData();
        res.setData(pcBuilderService.saveConfiguration(username, request));
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // 5. Tải lại cấu hình đã lưu (bằng ID hoặc shareToken)
    @GetMapping("/configurations/{idOrToken}")
    public ResponseEntity<ResponseData> getConfiguration(@PathVariable String idOrToken) {
        ResponseData res = new ResponseData();
        res.setData(pcBuilderService.getConfiguration(idOrToken));
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // 6. Cập nhật cấu hình đã lưu
    @PutMapping("/configurations/{id}")
    public ResponseEntity<ResponseData> updateConfiguration(
            @PathVariable Integer id,
            @RequestBody BuilderSaveConfigurationRequest request,
            Authentication authentication
    ) {
        String username = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : null;
        ResponseData res = new ResponseData();
        res.setData(pcBuilderService.updateConfiguration(id, username, request));
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // 7. Thêm toàn bộ cấu hình vào giỏ hàng (Transaction an toàn)
    @PostMapping("/configurations/{id}/add-to-cart")
    public ResponseEntity<ResponseData> addConfigurationToCart(
            @PathVariable Integer id,
            Authentication authentication
    ) {
        String username = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : null;
        pcBuilderService.addConfigurationToCart(id, username);
        ResponseData res = new ResponseData();
        res.setMessage("Đã thêm toàn bộ linh kiện trong cấu hình vào giỏ hàng thành công");
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}
