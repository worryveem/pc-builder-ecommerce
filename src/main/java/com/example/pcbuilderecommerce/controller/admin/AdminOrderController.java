package com.example.pcbuilderecommerce.controller.admin;


import com.example.pcbuilderecommerce.dto.response.ResponseData;
import com.example.pcbuilderecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//
@RestController
@RequestMapping("/api/admin")
//@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    @Autowired
    private OrderService orderService;
    // xem tat ca don hang
    @GetMapping ("/orders")
    public ResponseEntity<?> getAllOrders(@RequestParam(required = false) String status) {
        ResponseData responseData = new ResponseData();
        java.util.List<com.example.pcbuilderecommerce.dto.OrderDTO> orders = orderService.getAllOrders();
        if (status != null && !status.trim().isEmpty()) {
            try {
                com.example.pcbuilderecommerce.common.OrderStatus orderStatus = com.example.pcbuilderecommerce.common.OrderStatus.valueOf(status.trim());
                orders = orders.stream()
                        .filter(o -> o.getStatus() == orderStatus)
                        .toList();
            } catch (Exception ignored) {}
        }
        responseData.setData(orders);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // xem chi tiet don hang theo id
    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable long id) {

        ResponseData responseData = new ResponseData();
        responseData.setData(orderService.getOrderById(id));
        return new ResponseEntity<>(responseData, HttpStatus.OK) ;
    }

    // huy don hang

    @PatchMapping("/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable long id) {

        ResponseData responseData = new ResponseData();
        responseData.setSuccess(orderService.cancelOrder(id));
        return new ResponseEntity<>(responseData, HttpStatus.OK) ;
    }



    // cap nhat trang thai don
    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateStatusOrder(@PathVariable long id,
                                               @RequestParam String status) {

        ResponseData responseData = new ResponseData();
        responseData.setSuccess(orderService.updateStatusOrder(id, status));

        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

}
