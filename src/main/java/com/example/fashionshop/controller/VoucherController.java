package com.example.fashionshop.controller;

import com.example.fashionshop.dto.VoucherApplyRequest;
import com.example.fashionshop.dto.VoucherApplyResponse;
import com.example.fashionshop.dto.VoucherDTO;
import com.example.fashionshop.dto.response.ResponseData;
import com.example.fashionshop.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    // Lấy danh sách voucher hợp lệ đang áp dụng
    @GetMapping("")
    public ResponseEntity<?> getActiveVouchers() {
        ResponseData responseData = new ResponseData();
        List<VoucherDTO> vouchers = voucherService.getActiveVouchers();
        responseData.setData(vouchers);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // Áp dụng voucher và tính toán giảm giá
    @PostMapping("/apply")
    public ResponseEntity<?> applyVoucher(@RequestBody VoucherApplyRequest request) {
        ResponseData responseData = new ResponseData();
        VoucherApplyResponse result = voucherService.applyVoucher(request.getCode(), request.getOrderAmount());
        responseData.setSuccess(result.isValid());
        responseData.setMessage(result.getMessage());
        responseData.setData(result);
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
