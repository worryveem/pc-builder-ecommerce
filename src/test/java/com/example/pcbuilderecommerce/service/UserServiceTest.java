package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.common.Role;
import com.example.pcbuilderecommerce.common.Status;
import com.example.pcbuilderecommerce.dto.RatingDTO;
import com.example.pcbuilderecommerce.dto.UserDTO;
import com.example.pcbuilderecommerce.dto.request.user.ChangePasswordRequest;
import com.example.pcbuilderecommerce.dto.request.user.UpdateUserRequest;
import com.example.pcbuilderecommerce.model.*;
import com.example.pcbuilderecommerce.repository.AddressRepository;
import com.example.pcbuilderecommerce.repository.ProductRepository;
import com.example.pcbuilderecommerce.repository.RatingRepository;
import com.example.pcbuilderecommerce.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RatingRepository ratingRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User sampleUser;
    private User adminUser;
    private Address sampleAddress;

    @BeforeEach
    void setUp() {
        sampleAddress = new Address();
        sampleAddress.setId(1);
        sampleAddress.setCity("Hà Nội");
        sampleAddress.setDistrict("Cầu Giấy");
        sampleAddress.setWard("Dịch Vọng");
        sampleAddress.setAddressLine("123 Xuân Thủy");

        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("user1");
        sampleUser.setEmail("user1@example.com");
        sampleUser.setFullName("Nguyen Van A");
        sampleUser.setPhone("0987654321");
        sampleUser.setPassword("$2a$10$encodedOldPassword");
        sampleUser.setRole(Role.CUSTOMER);
        sampleUser.setStatus(Status.ACTIVE);
        sampleUser.setAddress(sampleAddress);
        sampleUser.setOrders(new ArrayList<>());

        adminUser = new User();
        adminUser.setId(2L);
        adminUser.setUsername("admin");
        adminUser.setRole(Role.ADMIN);
        adminUser.setStatus(Status.ACTIVE);
    }

    @Test
    @DisplayName("updateUser returns false when user not found")
    void testUpdateUser_UserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        UpdateUserRequest req = new UpdateUserRequest();
        boolean result = userService.updateUser(99L, req);

        assertFalse(result);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateUser updates user information and address successfully")
    void testUpdateUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        UpdateUserRequest req = new UpdateUserRequest();
        req.setEmail("newemail@example.com");
        req.setFullName("Nguyen Van B");
        req.setPhone("0123456789");
        req.setCity("TP HCM");
        req.setDistrict("Quận 1");
        req.setWard("Bến Nghé");
        req.setAddressLine("456 Lê Lợi");

        boolean result = userService.updateUser(1L, req);

        assertTrue(result);
        assertEquals("newemail@example.com", sampleUser.getEmail());
        assertEquals("Nguyen Van B", sampleUser.getFullName());
        assertEquals("TP HCM", sampleUser.getAddress().getCity());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    @DisplayName("changePassword returns false when user not found")
    void testChangePassword_UserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ChangePasswordRequest req = new ChangePasswordRequest();
        boolean result = userService.changePassword(99L, req);

        assertFalse(result);
    }

    @Test
    @DisplayName("changePassword returns false when current password does not match")
    void testChangePassword_WrongCurrentPassword() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPass", sampleUser.getPassword())).thenReturn(false);

        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("wrongPass");
        req.setNewPassword("newPass123");
        req.setConfirmPassword("newPass123");

        boolean result = userService.changePassword(1L, req);

        assertFalse(result);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword returns false when confirm password does not match new password")
    void testChangePassword_ConfirmPasswordMismatch() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("oldPass", sampleUser.getPassword())).thenReturn(true);

        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("oldPass");
        req.setNewPassword("newPass123");
        req.setConfirmPassword("mismatchPass");

        boolean result = userService.changePassword(1L, req);

        assertFalse(result);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword encodes and updates password successfully")
    void testChangePassword_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("oldPass", sampleUser.getPassword())).thenReturn(true);
        when(passwordEncoder.encode("newPass123")).thenReturn("$2a$10$newEncodedPassword");

        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("oldPass");
        req.setNewPassword("newPass123");
        req.setConfirmPassword("newPass123");

        boolean result = userService.changePassword(1L, req);

        assertTrue(result);
        assertEquals("$2a$10$newEncodedPassword", sampleUser.getPassword());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    @DisplayName("getAllUsers returns list of UserDTO with address")
    void testGetAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(sampleUser, adminUser));

        List<UserDTO> result = userService.getAllUsers();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("user1", result.get(0).getUsername());
        assertNotNull(result.get(0).getAddress());
        assertEquals("Hà Nội", result.get(0).getAddress().getCity());
        assertEquals("admin", result.get(1).getUsername());
    }

    @Test
    @DisplayName("getUserProfile returns null when username not found")
    void testGetUserProfile_NotFound() {
        when(userRepository.findByUsername("notfound")).thenReturn(null);

        UserDTO result = userService.getUserProfile("notfound");

        assertNull(result);
    }

    @Test
    @DisplayName("getUserProfile returns UserDTO when found")
    void testGetUserProfile_Success() {
        when(userRepository.findByUsername("user1")).thenReturn(sampleUser);

        UserDTO result = userService.getUserProfile("user1");

        assertNotNull(result);
        assertEquals("user1", result.getUsername());
        assertEquals("user1@example.com", result.getEmail());
    }

    @Test
    @DisplayName("deleteUser returns false when user not found or user is ADMIN")
    void testDeleteUser_NotFoundOrAdmin() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertFalse(userService.deleteUser(99L));

        when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));
        assertFalse(userService.deleteUser(2L));
        verify(userRepository, never()).delete(adminUser);
    }

    @Test
    @DisplayName("deleteUser deletes customer user successfully")
    void testDeleteUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        boolean result = userService.deleteUser(1L);

        assertTrue(result);
        verify(userRepository, times(1)).delete(sampleUser);
    }

    @Test
    @DisplayName("banUser locks user status, protects admin from being banned")
    void testBanUser() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertFalse(userService.banUser(99L));

        when(userRepository.findById(2L)).thenReturn(Optional.of(adminUser));
        assertFalse(userService.banUser(2L));

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        boolean result = userService.banUser(1L);

        assertTrue(result);
        assertEquals(Status.LOCKED, sampleUser.getStatus());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    @DisplayName("unBanUser activates user status")
    void testUnBanUser() {
        sampleUser.setStatus(Status.LOCKED);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        boolean result = userService.unBanUser(1L);

        assertTrue(result);
        assertEquals(Status.ACTIVE, sampleUser.getStatus());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    @DisplayName("reviewProduct creates and saves rating")
    void testReviewProduct() {
        when(userRepository.findByUsername("user1")).thenReturn(sampleUser);
        Product product = new Product();
        product.setId(10);
        when(productRepository.findById(10)).thenReturn(Optional.of(product));

        RatingDTO ratingDTO = new RatingDTO();
        ratingDTO.setProduct_id(10);
        ratingDTO.setStar(5);
        ratingDTO.setComment("Sản phẩm rất tốt");

        boolean result = userService.reviewProduct("user1", ratingDTO);

        assertTrue(result);
        verify(ratingRepository, times(1)).save(any(Rating.class));
    }

    @Test
    @DisplayName("userDiscount calculates correct discount tiers according to total orders spend")
    void testUserDiscount_Tiers() {
        when(userRepository.findByUsername("user1")).thenReturn(sampleUser);

        // Tier 0: < 500k
        Order o1 = new Order();
        o1.setTotalPrice(300000.0);
        sampleUser.setOrders(List.of(o1));
        assertEquals(0, userService.userDiscount("user1"));

        // Tier 1: 500k - 1M -> 5%
        o1.setTotalPrice(600000.0);
        assertEquals(5.0, userService.userDiscount("user1"));
        assertEquals(5.0, sampleUser.getDiscount_percent());

        // Tier 2: 1M - 2M -> 8%
        o1.setTotalPrice(1500000.0);
        assertEquals(8.0, userService.userDiscount("user1"));
        assertEquals(8.0, sampleUser.getDiscount_percent());

        // Tier 3: 2M - 5M -> 10%
        o1.setTotalPrice(3000000.0);
        assertEquals(10.0, userService.userDiscount("user1"));
        assertEquals(10.0, sampleUser.getDiscount_percent());

        // Tier 4: >= 5M -> 15%
        o1.setTotalPrice(6000000.0);
        assertEquals(15.0, userService.userDiscount("user1"));
        assertEquals(15.0, sampleUser.getDiscount_percent());
    }
}
