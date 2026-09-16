package com.example.pcbuilderecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RatingSummaryResponse {
    private Double averageStar;
    private Integer totalRatings;
    private List<RatingResponse> ratings;

    public Double getAverageRating() {
        return averageStar;
    }
}
