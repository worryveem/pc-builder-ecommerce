package com.example.fashionshop.service;

import com.example.fashionshop.Exception.ResourceNotFoundException;
import com.example.fashionshop.dto.RatingDTO;
import com.example.fashionshop.dto.response.RatingResponse;
import com.example.fashionshop.dto.response.RatingSummaryResponse;
import com.example.fashionshop.model.Product;
import com.example.fashionshop.model.Rating;
import com.example.fashionshop.model.User;
import com.example.fashionshop.repository.ProductRepository;
import com.example.fashionshop.repository.RatingRepository;
import com.example.fashionshop.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private RatingService ratingService;

    private User sampleUser;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("mom_lily");
        sampleUser.setFullName("Mẹ Lily");

        sampleProduct = new Product();
        sampleProduct.setId(101);
        sampleProduct.setName("Bộ Đồ Mặc Nhà Bé Gái");
    }

    @Test
    @DisplayName("saveRating throws ResourceNotFoundException when user is not found")
    void testSaveRating_UserNotFound() {
        when(userRepository.findByUsername("ghostUser")).thenReturn(null);
        when(userRepository.findAll()).thenReturn(Collections.emptyList());

        RatingDTO dto = new RatingDTO();
        dto.setProductId(101);
        dto.setStar(5);

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> ratingService.saveRating("ghostUser", dto)
        );

        assertEquals("Không tìm thấy người dùng", ex.getMessage());
    }

    @Test
    @DisplayName("saveRating throws ResourceNotFoundException when product is not found")
    void testSaveRating_ProductNotFound() {
        when(userRepository.findByUsername("mom_lily")).thenReturn(sampleUser);
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        RatingDTO dto = new RatingDTO();
        dto.setProductId(999);
        dto.setStar(5);

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> ratingService.saveRating("mom_lily", dto)
        );

        assertEquals("Không tìm thấy sản phẩm", ex.getMessage());
    }

    @Test
    @DisplayName("saveRating clamps star between 1 and 5 and saves rating")
    void testSaveRating_ClampsStarAndSaves() {
        when(userRepository.findByUsername("mom_lily")).thenReturn(sampleUser);
        when(productRepository.findById(101)).thenReturn(Optional.of(sampleProduct));

        when(ratingRepository.save(any(Rating.class))).thenAnswer(invocation -> {
            Rating r = invocation.getArgument(0);
            r.setId(50);
            return r;
        });

        // Test star > 5 (should clamp to 5)
        RatingDTO dtoOver = new RatingDTO();
        dtoOver.setProductId(101);
        dtoOver.setStar(10);
        dtoOver.setComment("  Vải mềm mát lắm shop ơi!  ");

        RatingResponse resp1 = ratingService.saveRating("mom_lily", dtoOver);

        assertEquals(5, resp1.getStar());
        assertEquals("Vải mềm mát lắm shop ơi!", resp1.getComment());
        assertEquals("mom_lily", resp1.getUsername());
        assertEquals("Mẹ Lily", resp1.getFullName());

        // Test star < 1 (should clamp to 1)
        RatingDTO dtoUnder = new RatingDTO();
        dtoUnder.setProductId(101);
        dtoUnder.setStar(-3);
        dtoUnder.setComment("Bị rộng");

        RatingResponse resp2 = ratingService.saveRating("mom_lily", dtoUnder);
        assertEquals(1, resp2.getStar());
    }

    @Test
    @DisplayName("getRatingsByProductId returns formatted list of reviews")
    void testGetRatingsByProductId() {
        Rating r = new Rating();
        r.setId(1);
        r.setStar(5);
        r.setComment("Rất ưng ý");
        r.setUser(sampleUser);
        r.setProduct(sampleProduct);
        r.setCreated_at(LocalDateTime.now());

        when(ratingRepository.findByProductId(101)).thenReturn(List.of(r));

        List<RatingResponse> list = ratingService.getRatingsByProductId(101);

        assertEquals(1, list.size());
        assertEquals(5, list.get(0).getStar());
        assertEquals("Mẹ Lily", list.get(0).getFullName());
        assertEquals("Rất ưng ý", list.get(0).getComment());
    }

    @Test
    @DisplayName("getRatingSummary calculates rounded average and count correctly")
    void testGetRatingSummary_WithReviews() {
        Rating r1 = new Rating();
        r1.setId(1);
        r1.setStar(5);
        r1.setUser(sampleUser);

        Rating r2 = new Rating();
        r2.setId(2);
        r2.setStar(4);
        r2.setUser(sampleUser);

        when(ratingRepository.findByProductId(101)).thenReturn(List.of(r1, r2));

        RatingSummaryResponse summary = ratingService.getRatingSummary(101);

        assertEquals(2, summary.getTotalRatings());
        assertEquals(4.5, summary.getAverageStar()); // (5 + 4) / 2 = 4.5
        assertEquals(2, summary.getRatings().size());
    }

    @Test
    @DisplayName("getRatingSummary returns default 5.0 and 0 count when no reviews")
    void testGetRatingSummary_EmptyReviews() {
        when(ratingRepository.findByProductId(101)).thenReturn(Collections.emptyList());

        RatingSummaryResponse summary = ratingService.getRatingSummary(101);

        assertEquals(0, summary.getTotalRatings());
        assertEquals(5.0, summary.getAverageStar());
        assertTrue(summary.getRatings().isEmpty());
    }
}
