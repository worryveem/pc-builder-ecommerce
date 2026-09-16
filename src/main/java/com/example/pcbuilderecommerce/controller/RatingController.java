package com.example.pcbuilderecommerce.controller;

import com.example.pcbuilderecommerce.dto.RatingDTO;
import com.example.pcbuilderecommerce.dto.response.RatingResponse;
import com.example.pcbuilderecommerce.dto.response.RatingSummaryResponse;
import com.example.pcbuilderecommerce.dto.response.ResponseData;
import com.example.pcbuilderecommerce.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductRatings(@PathVariable Integer productId) {
        ResponseData response = new ResponseData();
        RatingSummaryResponse summary = ratingService.getRatingSummary(productId);
        response.setSuccess(true);
        response.setData(summary);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/product/{productId}/summary")
    public ResponseEntity<?> getProductRatingSummary(@PathVariable Integer productId) {
        ResponseData response = new ResponseData();
        RatingSummaryResponse summary = ratingService.getRatingSummary(productId);
        response.setSuccess(true);
        response.setData(summary);
        return ResponseEntity.ok(response);
    }

    @PostMapping("")
    public ResponseEntity<?> addRating(@RequestBody RatingDTO ratingDTO, Authentication authentication) {
        ResponseData response = new ResponseData();

        String username = null;
        if (authentication != null && authentication.isAuthenticated()) {
            username = authentication.getName();
        }

        if (username == null || username.equals("anonymousUser")) {
            username = "guest";
        }

        try {
            RatingResponse created = ratingService.saveRating(username, ratingDTO);
            response.setSuccess(true);
            response.setMessage("Cảm ơn bạn đã đánh giá sản phẩm!");
            response.setData(created);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage(e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
}
