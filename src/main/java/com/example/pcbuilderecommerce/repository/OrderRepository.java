package com.example.pcbuilderecommerce.repository;

import com.example.pcbuilderecommerce.model.Order;
import com.example.pcbuilderecommerce.common.OrderStatus;
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
