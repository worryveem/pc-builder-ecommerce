package com.example.fashionshop.controller.admin;


import com.example.fashionshop.dto.response.ResponseData;
import com.example.fashionshop.service.UserService;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
//@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserService userService;
    // lay full du lieu user
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {

        ResponseData responseData = new ResponseData();
        responseData.setData(userService.getAllUsers());
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // xoa user

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable long id) {
        ResponseData responseData = new ResponseData();
        responseData.setSuccess(userService.deleteUser(id));
        return new ResponseEntity<>(responseData, HttpStatus.OK);

    }

    // khoa tai khoan
    @PatchMapping("/users/{id}/ban")
    public ResponseEntity<?> banUser(@PathVariable long id) {

        ResponseData responseData = new ResponseData();
        responseData.setSuccess(userService.banUser(id));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // mo khoa tai khoan
    @PatchMapping("/users/{id}/unban")
    public ResponseEntity<?> unBanUser(@PathVariable long id) {

        ResponseData responseData = new ResponseData();
        responseData.setSuccess(userService.unBanUser(id));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

}
