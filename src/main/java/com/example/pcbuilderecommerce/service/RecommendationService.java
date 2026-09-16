package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.dto.request.RecommendationRequest;
import com.example.pcbuilderecommerce.dto.response.RecommendationResponse;
import com.example.pcbuilderecommerce.dto.response.products.ProductsResponse;
import com.example.pcbuilderecommerce.model.Product;
import com.example.pcbuilderecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RecommendationService.class);

    @Value("${openai.api.key:dummy-key}")
    private String apiKey;

    @Value("${openai.api.model:gpt-3.5-turbo}")
    private String modelName;

    @Autowired(required = false)
    private WebClient webClient;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductService productService;

    public RecommendationResponse getRecommendations(RecommendationRequest request) {
        String query = (request != null && request.getQuery() != null) ? request.getQuery().trim() : "";
        if (query.length() > 300) {
            query = query.substring(0, 300);
        }
        List<Product> allProducts = productRepository.findAll();

        if (allProducts.isEmpty()) {
            return new RecommendationResponse(
                    "Hiện tại chưa có sản phẩm nào trong cửa hàng.",
                    Collections.emptyList(),
                    false
            );
        }

        // Try AI generation if API key is configured and not placeholder
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.equals("dummy-key") && !apiKey.contains("placeholder") && webClient != null) {
            try {
                RecommendationResponse aiResult = queryOpenAiForRecommendations(query, allProducts);
                if (aiResult != null && aiResult.getRecommendedProducts() != null && !aiResult.getRecommendedProducts().isEmpty()) {
                    return aiResult;
                }
            } catch (Exception e) {
                // Log and gracefully fall back to database retrieval engine
                log.warn("OpenAI recommendation failed ({}), falling back to local search engine", e.getMessage());
            }
        }

        // Graceful Fallback: Local semantic & rule-based recommendation directly from database
        return fallbackLocalRecommendation(query, allProducts);
    }

    private List<Product> selectTopCandidates(String userQuery, List<Product> products, int limit) {
        String lowerQuery = (userQuery != null) ? userQuery.toLowerCase() : "";
        List<Product> scored = new ArrayList<>(products);

        scored.sort((p1, p2) -> {
            int s1 = calculateRelevanceScore(p1, lowerQuery);
            int s2 = calculateRelevanceScore(p2, lowerQuery);
            return Integer.compare(s2, s1);
        });

        return scored.stream().limit(limit).collect(Collectors.toList());
    }

    private int calculateRelevanceScore(Product p, String lowerQuery) {
        if (lowerQuery.isEmpty()) return 0;
        int score = 0;
        String name = (p.getName() != null) ? p.getName().toLowerCase() : "";
        String brand = (p.getBrand() != null) ? p.getBrand().toLowerCase() : "";
        String desc = (p.getDescription() != null) ? p.getDescription().toLowerCase() : "";
        String cat = (p.getCategory() != null && p.getCategory().getName() != null) ? p.getCategory().getName().toLowerCase() : "";
        String compType = (p.getCategory() != null && p.getCategory().getBuilderComponentType() != null) ? p.getCategory().getBuilderComponentType().toLowerCase() : "";

        if (name.contains(lowerQuery)) score += 20;
        for (String word : lowerQuery.split("\\s+")) {
            if (word.length() < 2) continue;
            if (name.contains(word)) score += 5;
            if (brand.contains(word)) score += 4;
            if (cat.contains(word) || compType.contains(word)) score += 5;
            if (desc.contains(word)) score += 2;
        }
        return score;
    }

    private RecommendationResponse queryOpenAiForRecommendations(String userQuery, List<Product> products) {
        // Smart candidates selection: top relevant products for user query
        List<Product> candidates = selectTopCandidates(userQuery, products, 20);

        StringBuilder catalogPrompt = new StringBuilder();
        for (Product p : candidates) {
            catalogPrompt.append(String.format("ID: %d | Tên: %s | Giá: %.0f VND | Hãng: %s\n",
                    p.getId(), p.getName(), (p.getPrice() != null ? p.getPrice() : 0.0), p.getBrand()));
        }

        String systemPrompt = "Bạn là chuyên gia tư vấn phần cứng và PC. Dưới đây là danh sách sản phẩm THỰC TẾ có sẵn:\n"
                + catalogPrompt
                + "\nKhách hàng hỏi: \"" + userQuery + "\".\n"
                + "Hãy chọn tối đa 4 ID sản phẩm phù hợp nhất. Trả về đúng định dạng sau:\n"
                + "LỜI_KHUYÊN: <lời khuyên ngắn gọn 1-2 câu tiếng Việt>\n"
                + "DANH_SÁCH_ID: <các id phân cách bằng dấu phẩy, ví dụ: 1, 3, 5>";

        Map<String, Object> body = Map.of(
                "model", modelName,
                "messages", List.of(Map.of("role", "user", "content", systemPrompt)),
                "temperature", 0.5
        );

        Map response = webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response != null && response.containsKey("choices")) {
            List choices = (List) response.get("choices");
            if (!choices.isEmpty()) {
                Map firstChoice = (Map) choices.get(0);
                Map messageObj = (Map) firstChoice.get("message");
                String content = messageObj != null ? messageObj.get("content").toString() : "";

                return parseAiContent(content, products);
            }
        }

        return null;
    }

    private RecommendationResponse parseAiContent(String content, List<Product> allProducts) {
        String advice = "Dưới đây là các sản phẩm AI đề xuất phù hợp nhất với yêu cầu của bạn:";
        List<Integer> extractedIds = new ArrayList<>();

        String[] lines = content.split("\n");
        for (String line : lines) {
            if (line.toUpperCase().contains("LỜI_KHUYÊN:") || line.toUpperCase().contains("LOI_KHUYEN:")) {
                advice = line.substring(line.indexOf(":") + 1).trim();
            } else if (line.toUpperCase().contains("DANH_SÁCH_ID:") || line.toUpperCase().contains("DANH_SACH_ID:")) {
                String idPart = line.substring(line.indexOf(":") + 1);
                Matcher matcher = Pattern.compile("\\d+").matcher(idPart);
                while (matcher.find()) {
                    try {
                        extractedIds.add(Integer.parseInt(matcher.group()));
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        // Strict validation: Only return products that actually exist in DB
        Map<Integer, Product> productMap = allProducts.stream().collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));
        List<ProductsResponse> verifiedResponses = new ArrayList<>();
        boolean hasBuilder = false;

        for (Integer id : extractedIds) {
            Product p = productMap.get(id);
            if (p != null) {
                verifiedResponses.add(productService.mapToProductResponse(p));
                if (p.getCategory() != null && Boolean.TRUE.equals(p.getCategory().getBuilderSupported())) {
                    hasBuilder = true;
                }
            }
        }

        if (verifiedResponses.isEmpty()) {
            return null; // Triggers fallback
        }

        return new RecommendationResponse(advice, verifiedResponses, hasBuilder);
    }

    private RecommendationResponse fallbackLocalRecommendation(String query, List<Product> products) {
        String lowerQuery = query.toLowerCase();

        // Detect keywords
        boolean isGaming = lowerQuery.contains("gaming") || lowerQuery.contains("chơi game") || lowerQuery.contains("game");
        boolean isOffice = lowerQuery.contains("văn phòng") || lowerQuery.contains("office") || lowerQuery.contains("học tập");
        boolean isGpu = lowerQuery.contains("gpu") || lowerQuery.contains("card") || lowerQuery.contains("vga");
        boolean isCpu = lowerQuery.contains("cpu") || lowerQuery.contains("chip") || lowerQuery.contains("vi xử lý");
        boolean isRam = lowerQuery.contains("ram") || lowerQuery.contains("bộ nhớ");
        boolean isPsu = lowerQuery.contains("nguồn") || lowerQuery.contains("psu");
        boolean isLaptop = lowerQuery.contains("laptop") || lowerQuery.contains("máy tính xách tay");

        List<Product> matched = new ArrayList<>();

        for (Product p : products) {
            String pName = (p.getName() != null) ? p.getName().toLowerCase() : "";
            String pDesc = (p.getDescription() != null) ? p.getDescription().toLowerCase() : "";
            String catType = (p.getCategory() != null && p.getCategory().getBuilderComponentType() != null)
                    ? p.getCategory().getBuilderComponentType().toUpperCase() : "";

            int score = 0;
            if (isGpu && catType.equals("GPU")) score += 10;
            if (isCpu && catType.equals("CPU")) score += 10;
            if (isRam && catType.equals("RAM")) score += 10;
            if (isPsu && catType.equals("PSU")) score += 10;
            if (isGaming && (pName.contains("gaming") || pDesc.contains("gaming") || catType.equals("GPU"))) score += 5;
            if (isOffice && (pName.contains("office") || pDesc.contains("văn phòng"))) score += 5;
            if (isLaptop && p.getProductType() != null && p.getProductType().name().contains("LAPTOP")) score += 10;

            // Name exact keyword match
            if (!query.isEmpty() && pName.contains(lowerQuery)) score += 8;

            if (score > 0) {
                matched.add(p);
            }
        }

        // If no specific match, pick top 4 products
        if (matched.isEmpty()) {
            matched = products.stream().limit(4).collect(Collectors.toList());
        } else {
            matched = matched.stream().limit(4).collect(Collectors.toList());
        }

        List<ProductsResponse> dtos = matched.stream()
                .map(productService::mapToProductResponse)
                .collect(Collectors.toList());

        boolean hasBuilder = matched.stream().anyMatch(p -> p.getCategory() != null && Boolean.TRUE.equals(p.getCategory().getBuilderSupported()));

        String advice;
        if (isGaming) {
            advice = "Dựa trên nhu cầu Gaming, hệ thống gợi ý các linh kiện hiệu năng cao tối ưu cho trải nghiệm chơi game mượt mà:";
        } else if (isOffice) {
            advice = "Dựa trên nhu cầu làm việc văn phòng, đây là các sản phẩm bền bỉ, tiết kiệm điện và giá thành hợp lý nhất:";
        } else if (isGpu) {
            advice = "Dưới đây là các mẫu Card đồ họa (VGA) nổi bật đang sẵn hàng với hiệu năng trên giá thành tốt nhất:";
        } else if (isCpu) {
            advice = "Dưới đây là các dòng vi xử lý (CPU) hiệu năng cao phù hợp cho dàn máy của bạn:";
        } else if (!query.isEmpty()) {
            advice = "Dựa trên tìm kiếm \"" + query + "\", chúng tôi đề xuất các sản phẩm hàng đầu phù hợp trong kho:";
        } else {
            advice = "Chào bạn! Đây là các sản phẩm và linh kiện máy tính bán chạy nhất được đề xuất cho bạn:";
        }

        return new RecommendationResponse(advice, dtos, hasBuilder);
    }
}
