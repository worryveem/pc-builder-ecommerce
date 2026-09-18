package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.dto.request.ChatRequest;
import com.example.pcbuilderecommerce.dto.response.ChatResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private WebClient webClient;

    @InjectMocks
    private ChatService chatService;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(chatService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(chatService, "modelName", "gpt-3.5-turbo");
    }

    @Test
    @DisplayName("handleChat returns AI message content on successful response")
    @SuppressWarnings("unchecked")
    void testHandleChat_Success() {

        WebClient.RequestBodyUriSpec uriSpec = mock(WebClient.RequestBodyUriSpec.class);
        WebClient.RequestBodySpec bodySpec = mock(WebClient.RequestBodySpec.class);
        WebClient.RequestHeadersSpec headersSpec = mock(WebClient.RequestHeadersSpec.class);
        WebClient.ResponseSpec responseSpec = mock(WebClient.ResponseSpec.class);

        when(webClient.post()).thenReturn(uriSpec);
        when(uriSpec.uri("/chat/completions")).thenReturn(bodySpec);
        when(bodySpec.header(anyString(), anyString())).thenReturn(bodySpec);
        when(bodySpec.bodyValue(any())).thenReturn(headersSpec);
        when(headersSpec.retrieve()).thenReturn(responseSpec);

        Map<String, Object> fakeResponse = Map.of(
                "choices", List.of(
                        Map.of("message", Map.of("content", "Xin chào! Tôi là trợ lý AI PC Builder."))
                )
        );
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(fakeResponse));

        ChatRequest req = new ChatRequest();
        req.setMessage("Tư vấn build PC 15 triệu");

        ChatResponse response = chatService.handleChat(req);

        assertNotNull(response);
        assertEquals("Xin chào! Tôi là trợ lý AI PC Builder.", response.getReply());
    }

    @Test
    @DisplayName("handleChat handles exception gracefully and returns fallback error message")
    void testHandleChat_ErrorFallback() {
        when(webClient.post()).thenThrow(new RuntimeException("Connection refused"));

        ChatRequest req = new ChatRequest();
        req.setMessage("Hello");

        ChatResponse response = chatService.handleChat(req);

        assertNotNull(response);
        assertTrue(response.getReply().contains("Lỗi kết nối AI"));
    }
}
