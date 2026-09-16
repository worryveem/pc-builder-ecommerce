package com.example.fashionshop.controller;


import com.example.fashionshop.dto.request.user.ChangePasswordRequest;
import com.example.fashionshop.dto.request.user.UpdateUserRequest;
import com.example.fashionshop.dto.response.ResponseData;
import com.example.fashionshop.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;
    // câp nhat thong tin ca nhan va dia chi
    @PutMapping("/profile/{id}")
    public ResponseEntity<?> updateUser (@RequestBody UpdateUserRequest updateProfileRequest,
                                         @PathVariable long id)
    {
        ResponseData responseData = new ResponseData();
        responseData.setSuccess(userService.updateUser(id, updateProfileRequest));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // thay doi mat khau
    @PutMapping("{id}/change-password")
    public ResponseEntity<?> changePassword (@RequestBody ChangePasswordRequest changePasswordRequest
                                            ,@PathVariable long id)
    {
        ResponseData responseData = new ResponseData();
        boolean success = userService.changePassword(id, changePasswordRequest);
        if (success) {
            responseData.setSuccess(true);
            responseData.setMessage("thay doi mat khau thanh cong");
        }
        else {
            responseData.setSuccess(false);
            responseData.setMessage("thay doi mat khau that bai");
        }
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // xem discount
    @PostMapping("/discount")
    public ResponseEntity<?> userDiscount(Authentication authentication)
    {
        String userName = authentication.getName();
        ResponseData responseData = new ResponseData();
        responseData.setData(userService.userDiscount(userName));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // Lay thong tin user hien tai
    @GetMapping("/profile")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        String userName = authentication.getName();
        ResponseData responseData = new ResponseData();
        responseData.setData(userService.getUserProfile(userName));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

}
