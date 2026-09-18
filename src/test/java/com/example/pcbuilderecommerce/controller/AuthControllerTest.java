package com.example.pcbuilderecommerce.controller;

import com.example.pcbuilderecommerce.Exception.GlobalExceptionHandler;
import com.example.pcbuilderecommerce.dto.request.auth.LoginRequest;
import com.example.pcbuilderecommerce.dto.request.auth.RegisterRequest;
import com.example.pcbuilderecommerce.dto.response.auth.AuthResponse;
import com.example.pcbuilderecommerce.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/auth/register returns 200 when registration succeeds")
    void testRegister_Success() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setPassword("password123");
        req.setFullName("Nguyen Van A");
        req.setEmail("newuser@example.com");

        when(authService.register(any(RegisterRequest.class))).thenReturn(true);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đăng ký tài khoản thành công!"));
    }

    @Test
    @DisplayName("POST /api/auth/register returns 400 when username already exists")
    void testRegister_UsernameExists() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("existinguser");
        req.setPassword("password123");
        req.setEmail("existing@example.com");

        when(authService.register(any(RegisterRequest.class))).thenReturn(false);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!"));
    }

    @Test
    @DisplayName("POST /api/auth/register returns 400 validation error when required fields are missing")
    void testRegister_ValidationFailed() throws Exception {
        RegisterRequest req = new RegisterRequest();
        // email, username, password left empty

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("POST /api/auth/login returns 200 with token when login succeeds")
    void testLogin_Success() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setUsername("validuser");
        req.setPassword("password123");

        AuthResponse authResp = new AuthResponse();
        authResp.setToken("mock-jwt-token");
        authResp.setUsername("validuser");
        authResp.setRole("CUSTOMER");

        when(authService.login(any(LoginRequest.class))).thenReturn(authResp);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.data.username").value("validuser"));
    }

    @Test
    @DisplayName("POST /api/auth/login returns 401 when credentials invalid")
    void testLogin_InvalidCredentials() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setUsername("wronguser");
        req.setPassword("wrongpass");

        when(authService.login(any(LoginRequest.class))).thenReturn(null);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Tên đăng nhập hoặc mật khẩu không chính xác!"));
    }
}
