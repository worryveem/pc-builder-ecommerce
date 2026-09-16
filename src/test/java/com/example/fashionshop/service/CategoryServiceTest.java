package com.example.fashionshop.service;

import com.example.fashionshop.dto.CategoryDTO;
import com.example.fashionshop.model.Category;
import com.example.fashionshop.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category();
        sampleCategory.setId(1);
        sampleCategory.setName("Thời Trang Bé Trai");
        sampleCategory.setDescription("Quần áo phong cách năng động cho bé trai");
    }

    @Test
    @DisplayName("getAllCategories returns mapped category DTOs")
    void testGetAllCategories() {
        when(categoryRepository.findAll()).thenReturn(List.of(sampleCategory));

        List<CategoryDTO> list = categoryService.getAllCategories();

        assertEquals(1, list.size());
        assertEquals(1, list.get(0).getId());
        assertEquals("Thời Trang Bé Trai", list.get(0).getName());
        assertEquals("Quần áo phong cách năng động cho bé trai", list.get(0).getDescription());
    }

    @Test
    @DisplayName("addCategory successfully saves category")
    void testAddCategory_Success() {
        CategoryDTO dto = new CategoryDTO();
        dto.setName("Thời Trang Sơ Sinh");
        dto.setDescription("Chất vải mềm mại");

        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        boolean result = categoryService.addCategory(dto);

        assertTrue(result);
        verify(categoryRepository, times(1)).save(any(Category.class));
    }

    @Test
    @DisplayName("addCategory returns false when save throws exception")
    void testAddCategory_Exception() {
        CategoryDTO dto = new CategoryDTO();
        dto.setName("Lỗi");

        when(categoryRepository.save(any(Category.class))).thenThrow(new RuntimeException("DB error"));

        boolean result = categoryService.addCategory(dto);

        assertFalse(result);
    }

    @Test
    @DisplayName("updateCategory updates category with ID successfully")
    void testUpdateCategory_Success() {
        CategoryDTO dto = new CategoryDTO();
        dto.setName("Thời Trang Bé Gái");
        dto.setDescription("Váy đầm đáng yêu");

        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        boolean result = categoryService.updateCategory(1, dto);

        assertTrue(result);
        verify(categoryRepository, times(1)).save(any(Category.class));
    }

    @Test
    @DisplayName("updateCategory returns false on exception")
    void testUpdateCategory_Exception() {
        CategoryDTO dto = new CategoryDTO();
        dto.setName("Lỗi");

        when(categoryRepository.save(any(Category.class))).thenThrow(new RuntimeException("DB error"));

        boolean result = categoryService.updateCategory(1, dto);

        assertFalse(result);
    }

    @Test
    @DisplayName("deleteCategory deletes by id and returns true")
    void testDeleteCategory_Success() {
        doNothing().when(categoryRepository).deleteById(1L);

        boolean result = categoryService.deleteCategory(1L);

        assertTrue(result);
        verify(categoryRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("deleteCategory returns false on exception")
    void testDeleteCategory_Exception() {
        doThrow(new RuntimeException("Data integrity violation")).when(categoryRepository).deleteById(1L);

        boolean result = categoryService.deleteCategory(1L);

        assertFalse(result);
    }
}
