package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.Exception.AccountLockedException;
import com.example.pcbuilderecommerce.common.Role;
import com.example.pcbuilderecommerce.common.Status;
import com.example.pcbuilderecommerce.config.jwt.JwtTokenProvider;
import com.example.pcbuilderecommerce.dto.request.auth.LoginRequest;
import com.example.pcbuilderecommerce.dto.request.auth.RegisterRequest;
import com.example.pcbuilderecommerce.dto.response.auth.AuthResponse;
import com.example.pcbuilderecommerce.model.Address;
import com.example.pcbuilderecommerce.model.User;
import com.example.pcbuilderecommerce.repository.AddressRepository;
import com.example.pcbuilderecommerce.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("kid_parent");
        sampleUser.setPassword("$2a$10$hashedPasswordHere");
        sampleUser.setFullName("Nguyễn Văn A");
        sampleUser.setRole(Role.CUSTOMER);
        sampleUser.setStatus(Status.ACTIVE);

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("new_user");
        registerRequest.setPassword("password123");
        registerRequest.setFullName("Trần Thị B");
        registerRequest.setEmail("parent@example.com");
        registerRequest.setPhone("0901234567");
        registerRequest.setAddressLine("123 Phố Cổ");
        registerRequest.setCity("Hà Nội");
        registerRequest.setDistrict("Hoàn Kiếm");
        registerRequest.setWard("Hàng Trống");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("kid_parent");
        loginRequest.setPassword("password123");
    }

    @Test
    @DisplayName("register returns false when username already exists")
    void testRegister_UsernameAlreadyExists() {
        when(userRepository.findByUsername("new_user")).thenReturn(sampleUser);

        boolean result = authService.register(registerRequest);

        assertFalse(result);
        verify(userRepository, never()).save(any());
        verify(addressRepository, never()).save(any());
    }

    @Test
    @DisplayName("register hashes password and saves user and address successfully")
    void testRegister_Success() {
        when(userRepository.findByUsername("new_user")).thenReturn(null);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$encodedPassword");

        boolean result = authService.register(registerRequest);

        assertTrue(result);
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
        verify(addressRepository, times(1)).save(any(Address.class));
    }

    @Test
    @DisplayName("login returns null when user does not exist")
    void testLogin_UserNotFound() {
        when(userRepository.findByUsername("kid_parent")).thenReturn(null);

        AuthResponse resp = authService.login(loginRequest);

        assertNull(resp);
    }

    @Test
    @DisplayName("login throws AccountLockedException when account is LOCKED")
    void testLogin_AccountLocked() {
        sampleUser.setStatus(Status.LOCKED);
        when(userRepository.findByUsername("kid_parent")).thenReturn(sampleUser);

        AccountLockedException ex = assertThrows(
                AccountLockedException.class,
                () -> authService.login(loginRequest)
        );

        assertEquals("Tài khoản của bạn đã bị khóa!", ex.getMessage());
    }

    @Test
    @DisplayName("login returns null when password does not match")
    void testLogin_WrongPassword() {
        when(userRepository.findByUsername("kid_parent")).thenReturn(sampleUser);
        when(passwordEncoder.matches("password123", sampleUser.getPassword())).thenReturn(false);

        AuthResponse resp = authService.login(loginRequest);

        assertNull(resp);
    }

    @Test
    @DisplayName("login returns AuthResponse with token when BCrypt password matches")
    void testLogin_SuccessWithBCrypt() {
        when(userRepository.findByUsername("kid_parent")).thenReturn(sampleUser);
        when(passwordEncoder.matches("password123", sampleUser.getPassword())).thenReturn(true);
        when(jwtTokenProvider.generateToken(eq("kid_parent"), eq("CUSTOMER"))).thenReturn("jwt.fake.token");

        AuthResponse resp = authService.login(loginRequest);

        assertNotNull(resp);
        assertEquals("jwt.fake.token", resp.getToken());
        assertEquals("Bearer", resp.getTokenType());
        assertEquals(1L, resp.getUserId());
        assertEquals("kid_parent", resp.getUsername());
        assertEquals("Nguyễn Văn A", resp.getFullName());
        assertEquals("CUSTOMER", resp.getRole());
    }

    @Test
    @DisplayName("login supports upgrading legacy plaintext password to BCrypt")
    void testLogin_SuccessWithLegacyPlaintextPassword() {
        sampleUser.setPassword("plainPassword123");
        loginRequest.setPassword("plainPassword123");

        when(userRepository.findByUsername("kid_parent")).thenReturn(sampleUser);
        when(passwordEncoder.matches("plainPassword123", "plainPassword123")).thenReturn(false);
        when(passwordEncoder.encode("plainPassword123")).thenReturn("$2a$10$upgradedHash");
        when(jwtTokenProvider.generateToken(eq("kid_parent"), eq("CUSTOMER"))).thenReturn("jwt.fake.token");

        AuthResponse resp = authService.login(loginRequest);

        assertNotNull(resp);
        assertEquals("jwt.fake.token", resp.getToken());
        assertEquals("$2a$10$upgradedHash", sampleUser.getPassword());
        verify(userRepository, times(1)).save(sampleUser);
    }
}
