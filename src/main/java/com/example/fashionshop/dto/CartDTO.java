package com.example.fashionshop.dto;

import com.example.fashionshop.model.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter

public class CartDTO {
    private Integer id;

    private Double totalPrice;

    private LocalDateTime createdAt;

    private User user;

    private List<CartItemDTO> items;
}
