package com.example.fashionshop.service;

import com.example.fashionshop.dto.CategoryDTO;
import com.example.fashionshop.dto.response.products.CategoryResponse;
import com.example.fashionshop.model.Category;
import com.example.fashionshop.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public CategoryResponse mapToResponse(Category cat) {
        if (cat == null) return null;
        CategoryResponse resp = new CategoryResponse();
        resp.setId(cat.getId());
        resp.setName(cat.getName());
        resp.setSlug(cat.getSlug());
        resp.setDescription(cat.getDescription());
        resp.setBuilderSupported(cat.getBuilderSupported());
        resp.setBuilderComponentType(cat.getBuilderComponentType());
        resp.setDisplayOrder(cat.getDisplayOrder());
        if (cat.getParent() != null) {
            resp.setParentId((long) cat.getParent().getId());
        }
        return resp;
    }

    // thêm category
    public boolean addCategory(CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setSlug(categoryDTO.getSlug());
        category.setDescription(categoryDTO.getDescription());
        category.setBuilderSupported(categoryDTO.getBuilderSupported() != null ? categoryDTO.getBuilderSupported() : false);
        category.setBuilderComponentType(categoryDTO.getBuilderComponentType());
        category.setDisplayOrder(categoryDTO.getDisplayOrder() != null ? categoryDTO.getDisplayOrder() : 0);

        if (categoryDTO.getParentId() != null) {
            Category parent = categoryRepository.findById((long) categoryDTO.getParentId()).orElse(null);
            category.setParent(parent);
        }

        try {
            categoryRepository.save(category);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // xóa category
    public boolean deleteCategory(long id) {
        try {
            categoryRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // sửa category
    public boolean updateCategory(int id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById((long) id).orElse(null);
        if (category == null) {
            category = new Category();
            category.setId(id);
        }

        category.setName(categoryDTO.getName());
        if (categoryDTO.getSlug() != null) category.setSlug(categoryDTO.getSlug());
        category.setDescription(categoryDTO.getDescription());
        if (categoryDTO.getBuilderSupported() != null) category.setBuilderSupported(categoryDTO.getBuilderSupported());
        if (categoryDTO.getBuilderComponentType() != null) category.setBuilderComponentType(categoryDTO.getBuilderComponentType());
        if (categoryDTO.getDisplayOrder() != null) category.setDisplayOrder(categoryDTO.getDisplayOrder());

        if (categoryDTO.getParentId() != null) {
            Category parent = categoryRepository.findById((long) categoryDTO.getParentId()).orElse(null);
            category.setParent(parent);
        }

        try {
            categoryRepository.save(category);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream().map(cat -> {
            CategoryDTO dto = new CategoryDTO();
            dto.setId(cat.getId());
            dto.setName(cat.getName());
            dto.setSlug(cat.getSlug());
            dto.setDescription(cat.getDescription());
            dto.setBuilderSupported(cat.getBuilderSupported());
            dto.setBuilderComponentType(cat.getBuilderComponentType());
            dto.setDisplayOrder(cat.getDisplayOrder());
            if (cat.getParent() != null) {
                dto.setParentId(cat.getParent().getId());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    public List<CategoryResponse> getBuilderCategories() {
        List<Category> list = categoryRepository.findByBuilderSupportedTrueOrderByDisplayOrderAsc();
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }
}
