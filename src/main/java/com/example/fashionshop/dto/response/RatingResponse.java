package com.example.fashionshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RatingResponse {
    private Integer id;
    private Integer star;
    private String comment;
    private String username;
    private String fullName;
    private LocalDateTime createdAt;
}
