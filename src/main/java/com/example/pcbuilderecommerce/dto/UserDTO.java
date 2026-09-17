package com.example.pcbuilderecommerce.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private Integer id;
    private String username;
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private String status;
    private Boolean active;
    private String role;
    private AddressDTO address;
}
