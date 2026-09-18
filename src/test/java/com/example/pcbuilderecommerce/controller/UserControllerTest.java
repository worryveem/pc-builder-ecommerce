package com.example.pcbuilderecommerce.controller;

import com.example.pcbuilderecommerce.Exception.GlobalExceptionHandler;
import com.example.pcbuilderecommerce.dto.UserDTO;
import com.example.pcbuilderecommerce.dto.request.user.ChangePasswordRequest;
import com.example.pcbuilderecommerce.dto.request.user.UpdateUserRequest;
import com.example.pcbuilderecommerce.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("PUT /api/user/profile/{id} updates user successfully")
    void testUpdateUser() throws Exception {
        UpdateUserRequest req = new UpdateUserRequest();
        req.setFullName("Nguyen Van B");

        when(userService.updateUser(eq(1L), any(UpdateUserRequest.class))).thenReturn(true);

        mockMvc.perform(put("/api/user/profile/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("PUT /api/user/{id}/change-password returns success message when password changed")
    void testChangePassword_Success() throws Exception {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("oldPass");
        req.setNewPassword("newPass");
        req.setConfirmPassword("newPass");

        when(userService.changePassword(eq(1L), any(ChangePasswordRequest.class))).thenReturn(true);

        mockMvc.perform(put("/api/user/1/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("thay doi mat khau thanh cong"));
    }

    @Test
    @DisplayName("GET /api/user/profile returns user profile for authenticated user")
    void testGetMyProfile() throws Exception {
        Authentication auth = new UsernamePasswordAuthenticationToken("user1", "password", Collections.emptyList());

        UserDTO dto = new UserDTO();
        dto.setUsername("user1");
        dto.setEmail("user1@example.com");

        when(userService.getUserProfile("user1")).thenReturn(dto);

        mockMvc.perform(get("/api/user/profile").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("user1"))
                .andExpect(jsonPath("$.data.email").value("user1@example.com"));
    }
}
