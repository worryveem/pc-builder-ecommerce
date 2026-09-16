package com.example.pcbuilderecommerce.controller;


import com.example.pcbuilderecommerce.dto.RatingDTO;
import com.example.pcbuilderecommerce.dto.response.ResponseData;
import com.example.pcbuilderecommerce.service.ProductService;
import com.example.pcbuilderecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductService productService;
    @Autowired
    private UserService userService;

    // hiển thi toàn bộ sản phẩm
    @GetMapping("")
    public ResponseEntity<?> getAllProducts() {
        ResponseData responseData = new ResponseData();
        responseData.setData(productService.getAllProducts());
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // hiển thị chi tiết san pham
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductDetail (@PathVariable long id)
    {
        ResponseData responseData = new ResponseData();
        responseData.setData(productService.getProductDetail(id));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // loc san pham theo danh muc
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getProductsByCategory(@PathVariable int categoryId) {
        ResponseData responseData = new ResponseData();
        responseData.setData(productService.getProductsByCategory(categoryId));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }


    // loc san pham theo muc gia
    @GetMapping("/filter")
    public ResponseEntity<?> filterPrice (@RequestParam Double minPrice,
                                          @RequestParam Double maxPrice)
    {

        ResponseData responseData = new ResponseData();
        responseData.setData(productService.filterPrice(minPrice,maxPrice));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // tim kiem san pham theo ten
    @GetMapping("/search")
    public ResponseEntity<?> filterName (@RequestParam String name )
    {

        ResponseData responseData = new ResponseData();
        responseData.setData(productService.filterName(name));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // danh gia san pham
    @PostMapping("/review")
    public ResponseEntity<?> reviewProduct(@RequestBody RatingDTO ratingDTO , Authentication authentication) {
            String userName = authentication.getName();
            ResponseData responseData = new ResponseData();
            responseData.setData(userService.reviewProduct(userName,ratingDTO));
            return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

}
