package com.example.fashionshop.dto.response;


import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ResponseData {

    private Boolean success = true;
    private Object data;
    private LocalDateTime timestamp;
    private String message;
    private Object errors;



}
