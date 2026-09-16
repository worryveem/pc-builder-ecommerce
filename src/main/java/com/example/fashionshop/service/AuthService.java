package com.example.fashionshop.service;

import com.example.fashionshop.Exception.AccountLockedException;
import com.example.fashionshop.common.Role;
import com.example.fashionshop.common.Status;
import com.example.fashionshop.config.jwt.JwtTokenProvider;
import com.example.fashionshop.dto.request.auth.LoginRequest;
import com.example.fashionshop.dto.request.auth.RegisterRequest;
import com.example.fashionshop.dto.response.auth.AuthResponse;
import com.example.fashionshop.model.Address;
import com.example.fashionshop.model.User;
import com.example.fashionshop.repository.AddressRepository;
import com.example.fashionshop.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // Đăng ký tài khoản mới với mật khẩu mã hóa BCrypt
    @Transactional
    public boolean register(RegisterRequest registerRequest) {
        if (userRepository.findByUsername(registerRequest.getUsername()) != null) {
            return false;
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        // Mã hóa mật khẩu bằng BCrypt
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());
        user.setFullName(registerRequest.getFullName());
        user.setPhone(registerRequest.getPhone());
        user.setRole(Role.CUSTOMER);
        user.setStatus(Status.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setDiscount_percent(0.0);

        Address address = new Address();
        address.setAddressLine(registerRequest.getAddressLine());
        address.setCity(registerRequest.getCity());
        address.setWard(registerRequest.getWard());
        address.setDistrict(registerRequest.getDistrict());

        address.setUser(user);
        user.setAddress(address);

        userRepository.save(user);
        addressRepository.save(address);

        return true;
    }

    // Đăng nhập và cấp phát JWT token
    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername());
        if (user == null) {
            return null;
        }

        if (user.getStatus() == Status.LOCKED) {
            throw new AccountLockedException("Tài khoản của bạn đã bị khóa!");
        }

        boolean passwordMatches = false;

        // Kiểm tra khớp mật khẩu với hash BCrypt
        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            passwordMatches = true;
        } else if (user.getPassword() != null && user.getPassword().equals(loginRequest.getPassword())) {
            // Hỗ trợ chuyển đổi tự động cho mật khẩu plaintext cũ sang BCrypt
            user.setPassword(passwordEncoder.encode(loginRequest.getPassword()));
            userRepository.save(user);
            passwordMatches = true;
        }

        if (!passwordMatches) {
            return null;
        }

        // Sinh JWT token
        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
