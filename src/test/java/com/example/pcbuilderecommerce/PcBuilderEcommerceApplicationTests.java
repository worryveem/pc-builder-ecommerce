package com.example.pcbuilderecommerce;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import com.example.pcbuilderecommerce.repository.CategoryRepository;
import com.example.pcbuilderecommerce.repository.ProductRepository;
import com.example.pcbuilderecommerce.model.Category;
import com.example.pcbuilderecommerce.model.Product;
import java.util.List;

@SpringBootTest
class PcBuilderEcommerceApplicationTests {

    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ProductRepository productRepository;

	@Test
    @Transactional
	void contextLoads() {
        List<Category> categories = categoryRepository.findAll();
        System.out.println("=== CATEGORIES COUNT: " + categories.size() + " ===");
        for (Category c : categories) {
            System.out.println("Cat ID: " + c.getId() + ", Name: " + c.getName());
        }
        List<Product> products = productRepository.findAll();
        System.out.println("=== PRODUCTS COUNT: " + products.size() + " ===");
        int withCat = 0;
        for (Product p : products) {
            if (p.getCategory() != null) {
                withCat++;
                if (withCat <= 5) {
                    System.out.println("Prod #" + p.getId() + " (" + p.getName() + ") -> Cat #" + p.getCategory().getId() + " (" + p.getCategory().getName() + ")");
                }
            }
        }
        System.out.println("=== PRODUCTS WITH CATEGORY: " + withCat + " / " + products.size() + " ===");
	}

}
