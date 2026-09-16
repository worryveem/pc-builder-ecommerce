package com.example.pcbuilderecommerce.controller;

import com.example.pcbuilderecommerce.dto.request.ChatRequest;
import com.example.pcbuilderecommerce.dto.response.ChatResponse;
import com.example.pcbuilderecommerce.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin // cho frontend gọi
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {
        return chatService.handleChat(request);
    }
}
