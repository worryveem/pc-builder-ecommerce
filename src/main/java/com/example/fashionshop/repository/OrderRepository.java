package com.example.fashionshop.repository;

import com.example.fashionshop.model.Order;
import com.example.fashionshop.common.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
//
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long id);

    List<Order> findByEmail(String email);

    List<Order> findByUserIdAndStatus(Long id, OrderStatus status);
}
