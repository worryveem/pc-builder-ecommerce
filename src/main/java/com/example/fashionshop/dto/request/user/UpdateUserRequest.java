package com.example.fashionshop.dto.request.user;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {


    private String email;
    private String fullName;
    private String phone;
    private String addressLine;
    private String city;
    private String district;
    private String ward;
}
