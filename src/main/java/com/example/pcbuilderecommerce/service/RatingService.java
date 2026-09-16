package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.Exception.ResourceNotFoundException;
import com.example.pcbuilderecommerce.dto.RatingDTO;
import com.example.pcbuilderecommerce.dto.response.RatingResponse;
import com.example.pcbuilderecommerce.dto.response.RatingSummaryResponse;
import com.example.pcbuilderecommerce.model.Product;
import com.example.pcbuilderecommerce.model.Rating;
import com.example.pcbuilderecommerce.model.User;
import com.example.pcbuilderecommerce.repository.ProductRepository;
import com.example.pcbuilderecommerce.repository.RatingRepository;
import com.example.pcbuilderecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public RatingResponse saveRating(String username, RatingDTO dto) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            user = userRepository.findAll().stream().findFirst().orElse(null);
        }
        if (user == null) {
            throw new ResourceNotFoundException("Không tìm thấy người dùng");
        }

        Integer pId = dto.getProductId() != null ? dto.getProductId() : dto.getProduct_id();
        Product product = (pId != null) ? productRepository.findById(pId).orElse(null) : null;
        if (product == null) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm");
        }

        int star = dto.getStar() != null ? Math.max(1, Math.min(5, dto.getStar())) : 
                  (dto.getScore() != null ? Math.max(1, Math.min(5, dto.getScore())) : 5);

        Rating rating = new Rating();
        rating.setUser(user);
        rating.setProduct(product);
        rating.setStar(star);
        rating.setComment(dto.getComment() != null ? dto.getComment().trim() : "");
        rating.setCreated_at(LocalDateTime.now());

        Rating saved = ratingRepository.save(rating);

        return new RatingResponse(
            saved.getId(),
            saved.getStar(),
            saved.getComment(),
            user.getUsername(),
            user.getFullName() != null ? user.getFullName() : user.getUsername(),
            saved.getCreated_at()
        );
    }

    @Transactional(readOnly = true)
    public List<RatingResponse> getRatingsByProductId(Integer productId) {
        List<Rating> ratings = ratingRepository.findByProductId(productId);
        List<RatingResponse> responses = new ArrayList<>();

        for (Rating r : ratings) {
            String uname = r.getUser() != null ? r.getUser().getUsername() : "Phụ huynh";
            String fname = (r.getUser() != null && r.getUser().getFullName() != null) ? r.getUser().getFullName() : uname;

            responses.add(new RatingResponse(
                r.getId(),
                r.getStar(),
                r.getComment(),
                uname,
                fname,
                r.getCreated_at()
            ));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public RatingSummaryResponse getRatingSummary(Integer productId) {
        List<RatingResponse> ratings = getRatingsByProductId(productId);
        int count = ratings.size();
        double avg = 5.0;

        if (count > 0) {
            double totalStars = 0;
            for (RatingResponse r : ratings) {
                totalStars += r.getStar();
            }
            avg = Math.round((totalStars / count) * 10.0) / 10.0;
        }

        return new RatingSummaryResponse(avg, count, ratings);
    }
}
