package com.example.fashionshop.controller;

import com.example.fashionshop.dto.request.RecommendationRequest;
import com.example.fashionshop.dto.response.RecommendationResponse;
import com.example.fashionshop.dto.response.ResponseData;
import com.example.fashionshop.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @PostMapping("")
    public ResponseEntity<ResponseData> getRecommendations(@RequestBody(required = false) RecommendationRequest request) {
        if (request == null) {
            request = new RecommendationRequest();
        }
        RecommendationResponse response = recommendationService.getRecommendations(request);
        ResponseData res = new ResponseData();
        res.setSuccess(true);
        res.setData(response);
        return ResponseEntity.ok(res);
    }
}
