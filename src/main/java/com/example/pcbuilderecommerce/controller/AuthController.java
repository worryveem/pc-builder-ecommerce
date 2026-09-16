package com.example.pcbuilderecommerce.controller;

import com.example.pcbuilderecommerce.dto.request.auth.LoginRequest;
import com.example.pcbuilderecommerce.dto.request.auth.RegisterRequest;
import com.example.pcbuilderecommerce.dto.response.ResponseData;
import com.example.pcbuilderecommerce.dto.response.auth.AuthResponse;
import com.example.pcbuilderecommerce.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Đăng ký
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        ResponseData responseData = new ResponseData();
        boolean success = authService.register(registerRequest);
        responseData.setSuccess(success);
        if (success) {
            responseData.setMessage("Đăng ký tài khoản thành công!");
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } else {
            responseData.setMessage("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        }
    }

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        ResponseData responseData = new ResponseData();
        try {
            AuthResponse authResponse = authService.login(loginRequest);
            if (authResponse != null) {
                responseData.setSuccess(true);
                responseData.setData(authResponse);
                responseData.setMessage("Đăng nhập thành công!");
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            } else {
                responseData.setSuccess(false);
                responseData.setMessage("Tên đăng nhập hoặc mật khẩu không chính xác!");
                return new ResponseEntity<>(responseData, HttpStatus.UNAUTHORIZED);
            }
        } catch (Exception e) {
            responseData.setSuccess(false);
            responseData.setMessage(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        }
    }
}
