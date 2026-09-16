package com.example.fashionshop.controller;

import com.example.fashionshop.dto.response.ResponseData;
import com.example.fashionshop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("")
    public ResponseEntity<ResponseData> getCategories() {
        ResponseData response = new ResponseData();
        response.setData(categoryService.getAllCategories());
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }
}
