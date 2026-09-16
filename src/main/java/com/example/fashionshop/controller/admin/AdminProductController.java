package com.example.fashionshop.controller.admin;


import com.example.fashionshop.dto.response.ResponseData;
import com.example.fashionshop.dto.response.products.ProductsResponse;
import com.example.fashionshop.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminProductController {
    @Autowired
    private ProductService productService;

    // them san pham
    @PostMapping("/products")
    public ResponseEntity<?> addProduct(@RequestBody ProductsResponse productsResponse) {
        ResponseData responseData = new ResponseData();
        responseData.setSuccess(productService.addProduct(productsResponse));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
    // sua san pham

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Integer id,
                                        @RequestBody ProductsResponse productsResponse) {
        ResponseData responseData = new ResponseData();
        responseData.setSuccess(productService.updateProduct(id,productsResponse));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        ResponseData responseData = new ResponseData();
        responseData.setSuccess(productService.deleteProduct(id));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

}
