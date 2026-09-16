package com.example.pcbuilderecommerce.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressDTO {
    private Integer id;
    private String addressLine;
    private String city;
    private String district;
    private String ward;
}
