package com.example.fashionshop.dto.request.auth;


import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank (message = "email khong duoc de trong")
    private String email;
    @NotBlank (message = "username khong duoc de trong")
    private String username;
    @NotBlank (message = "password khong duoc de trong")
    private String password;
    private String fullName;
    private String phone;
    private String addressLine;
    private String city;
    private String district;
    private String ward;
}
