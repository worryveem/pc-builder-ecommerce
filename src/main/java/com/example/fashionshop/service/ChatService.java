package com.example.fashionshop.service;

import com.example.fashionshop.dto.request.ChatRequest;
import com.example.fashionshop.dto.response.ChatResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.model}")
    private String modelName;

    @Autowired
    private WebClient webClient;

    public ChatResponse handleChat(ChatRequest request) {
        try {
            
            Map<String, Object> body = Map.of(
                    "model", modelName,
                    "messages", List.of(Map.of("role", "user", "content", request.getMessage()))
            );

            
            Map response = webClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            
            List choices = (List) response.get("choices");
            Map firstChoice = (Map) choices.get(0);
            Map messageObj = (Map) firstChoice.get("message");

            return new ChatResponse(messageObj.get("content").toString());

        } catch (Exception e) {
            return new ChatResponse("Lỗi kết nối AI: " + e.getMessage());
        }
    }
}