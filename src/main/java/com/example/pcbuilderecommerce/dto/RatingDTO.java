package com.example.pcbuilderecommerce.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class RatingDTO {
    private Integer id;
    private Integer star;
    private String comment;
    private LocalDateTime created_at;
    private Integer product_id;

    public Integer getProductId() {
        return product_id;
    }
    public void setProductId(Integer productId) {
        this.product_id = productId;
    }
    public Integer getScore() {
        return star;
    }
    public void setScore(Integer score) {
        this.star = score;
    }
}
