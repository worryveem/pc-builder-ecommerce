package com.example.fashionshop.service;


import com.example.fashionshop.dto.AddressDTO;
import com.example.fashionshop.dto.RatingDTO;
import com.example.fashionshop.dto.UserDTO;
import com.example.fashionshop.dto.request.user.ChangePasswordRequest;
import com.example.fashionshop.dto.request.user.UpdateUserRequest;
import com.example.fashionshop.model.*;
import com.example.fashionshop.common.Status;
import com.example.fashionshop.repository.AddressRepository;
import com.example.fashionshop.repository.ProductRepository;
import com.example.fashionshop.repository.RatingRepository;
import com.example.fashionshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AddressRepository addressRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private RatingRepository ratingRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    // câp nhat thong tin ca nhan va dia chi
    public boolean updateUser(long id , UpdateUserRequest request) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return false;
        }
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        Address address = user.getAddress();

        address.setDistrict(request.getDistrict());
        address.setCity(request.getCity());
        address.setWard(request.getWard());
        address.setAddressLine(request.getAddressLine());
        user.setAddress(address);

        userRepository.save(user);

        return true;
    }

    // thay doi mat khau
    public boolean changePassword(long id, ChangePasswordRequest request) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return false;
        }

        boolean matches = passwordEncoder.matches(request.getCurrentPassword(), user.getPassword());
        if (!matches && user.getPassword() != null && user.getPassword().equals(request.getCurrentPassword())) {
            matches = true;
        }

        if (!matches) {
            return false;
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return false;
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return true;
    }


    // lay full thong tin user
    public List<UserDTO> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDTO> userDTOs = new ArrayList<>();
        for (User user : users) {
            UserDTO userDTO = new UserDTO();
            userDTO.setId(Math.toIntExact(user.getId()));
            userDTO.setUsername(user.getUsername());
            userDTO.setEmail(user.getEmail());
            userDTO.setFullName(user.getFullName());
            userDTO.setPhone(user.getPhone());
            userDTO.setRole(user.getRole() != null ? user.getRole().name() : "USER");
            userDTO.setStatus(user.getStatus() != null ? user.getStatus().name() : "ACTIVE");
            Address address = user.getAddress();
            if (address != null) {
                AddressDTO addressDTO = new AddressDTO();
                addressDTO.setId(address.getId());
                addressDTO.setDistrict(address.getDistrict());
                addressDTO.setCity(address.getCity());
                addressDTO.setWard(address.getWard());
                addressDTO.setAddressLine(address.getAddressLine());
                userDTO.setAddress(addressDTO);
            }
            userDTOs.add(userDTO);

        }
        return userDTOs;
    }

    public UserDTO getUserProfile(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) return null;
        UserDTO userDTO = new UserDTO();
        userDTO.setId(Math.toIntExact(user.getId()));
        userDTO.setUsername(user.getUsername());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullName(user.getFullName());
        userDTO.setPhone(user.getPhone());
        userDTO.setRole(user.getRole() != null ? user.getRole().name() : "USER");
        userDTO.setStatus(user.getStatus() != null ? user.getStatus().name() : "ACTIVE");
        Address address = user.getAddress();
        if (address != null) {
            AddressDTO addressDTO = new AddressDTO();
            addressDTO.setId(address.getId());
            addressDTO.setDistrict(address.getDistrict());
            addressDTO.setCity(address.getCity());
            addressDTO.setWard(address.getWard());
            addressDTO.setAddressLine(address.getAddressLine());
            userDTO.setAddress(addressDTO);
        }
        return userDTO;
    }

    // xoa user
    public boolean deleteUser(long id) {
        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return false;
        }

        if (user.getRole().name().equals("ADMIN")) {
            return false;
        }

        userRepository.delete(user);

        return true;

    }

    // khoa tai khoan
    public boolean banUser(long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user.getRole().name().equals("ADMIN")) {
            return false;
        }
        user.setStatus(Status.LOCKED);
        try
        {
            userRepository.save(user);
            return true;
        }
        catch (EmptyResultDataAccessException e)
        {
            return false;
        }
    }
    // mo khoa tai khoan
    public boolean unBanUser(long id) {
        User user = userRepository.findById(id).orElse(null);
        user.setStatus(Status.ACTIVE);
        try
        {
            userRepository.save(user);
            return true;
        }
        catch (EmptyResultDataAccessException e)
        {
            return false;
        }
    }
    // danh gia san pham
    public boolean reviewProduct(String userName,RatingDTO ratingDTO) {
        User user = userRepository.findByUsername(userName);
        Product product = productRepository.findById(ratingDTO.getProduct_id()).orElse(null);
        Rating rating = new Rating();

        rating.setStar(ratingDTO.getStar());
        rating.setCreated_at(LocalDateTime.now());
        rating.setComment(ratingDTO.getComment());
        rating.setUser(user);
        rating.setProduct(product);
        try
        {
            ratingRepository.save(rating);
            return true;
        }
        catch (Exception e)
        {
            return false;
        }
    }


    // user discount
    public double userDiscount (String userName)
    {
        User user = userRepository.findByUsername(userName);
        double total = 0 ;
        List<Order> orders = user.getOrders();
        for (Order order : orders)
        {
            total = total + order.getTotalPrice();
        }

        if (total >=500000 && total <=1000000)
        {
            user.setDiscount_percent(5.0);
            userRepository.save(user);
            return 5;
        }
        else if (total >=1000000 && total <=2000000)
        {
            user.setDiscount_percent(8.0);
            userRepository.save(user);
            return 8;
        }
        else if (total >=2000000 && total <=5000000)
        {
            user.setDiscount_percent(10.0);
            userRepository.save(user);
            return 10;
        }
        else if (total >=5000000)
        {
            user.setDiscount_percent(15.0);
            userRepository.save(user);
            return 15;
        }
        return 0;




    }
}
