package com.example.pcbuilderecommerce.controller.admin;

import com.example.pcbuilderecommerce.dto.CategoryDTO;
import com.example.pcbuilderecommerce.dto.response.ResponseData;
import com.example.pcbuilderecommerce.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping("/category")
    public ResponseEntity<ResponseData> addCategory(
            @RequestBody CategoryDTO categoryDTO) {

        boolean success = categoryService.addCategory(categoryDTO);

        ResponseData response = new ResponseData();
        response.setSuccess(success);
        response.setMessage(success
                ? "Category created successfully"
                : "Failed to create category");

        return ResponseEntity
                .status(success ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @DeleteMapping("/category/{id}")
    public ResponseEntity<ResponseData> deleteCategory(
            @PathVariable Integer id) {

        boolean success = categoryService.deleteCategory(id);

        ResponseData response = new ResponseData();
        response.setSuccess(success);
        response.setMessage(success
                ? "Category deleted successfully"
                : "Category not found");

        return ResponseEntity
                .status(success ? HttpStatus.OK : HttpStatus.NOT_FOUND)
                .body(response);
    }

    @PutMapping("/category/{id}")
    public ResponseEntity<ResponseData> updateCategory(
            @PathVariable Integer id,
            @RequestBody CategoryDTO categoryDTO) {

        boolean success = categoryService.updateCategory(id, categoryDTO);

        ResponseData response = new ResponseData();
        response.setSuccess(success);
        response.setMessage(success
                ? "Category updated successfully"
                : "Category not found");

        return ResponseEntity
                .status(success ? HttpStatus.OK : HttpStatus.NOT_FOUND)
                .body(response);
    }

    @GetMapping("/categories")
    public ResponseEntity<ResponseData> getAllCategories() {
        ResponseData response = new ResponseData();
        response.setData(categoryService.getAllCategories());
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }
}
