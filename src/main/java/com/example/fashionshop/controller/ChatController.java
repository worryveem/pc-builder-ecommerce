package com.example.fashionshop.controller;

import com.example.fashionshop.dto.request.ChatRequest;
import com.example.fashionshop.dto.response.ChatResponse;
import com.example.fashionshop.service.ChatService;
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
