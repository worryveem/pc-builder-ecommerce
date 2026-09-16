package com.example.fashionshop.controller.admin;

import com.example.fashionshop.dto.VoucherDTO;
import com.example.fashionshop.dto.response.ResponseData;
import com.example.fashionshop.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/vouchers")
public class AdminVoucherController {

    @Autowired
    private VoucherService voucherService;

    // Xem tất cả voucher
    @GetMapping("")
    public ResponseEntity<?> getAllVouchers() {
        ResponseData responseData = new ResponseData();
        responseData.setData(voucherService.getAllVouchers());
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // Xem chi tiết voucher theo id
    @GetMapping("/{id}")
    public ResponseEntity<?> getVoucherById(@PathVariable Long id) {
        ResponseData responseData = new ResponseData();
        responseData.setData(voucherService.getVoucherById(id));
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }

    // Thêm mới voucher
    @PostMapping("")
    public ResponseEntity<?> createVoucher(@RequestBody VoucherDTO voucherDTO) {
        ResponseData responseData = new ResponseData();
        try {
            VoucherDTO created = voucherService.createVoucher(voucherDTO);
            responseData.setSuccess(true);
            responseData.setMessage("Tạo voucher thành công!");
            responseData.setData(created);
            return new ResponseEntity<>(responseData, HttpStatus.CREATED);
        } catch (Exception e) {
            responseData.setSuccess(false);
            responseData.setMessage(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        }
    }

    // Cập nhật voucher
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVoucher(@PathVariable Long id, @RequestBody VoucherDTO voucherDTO) {
        ResponseData responseData = new ResponseData();
        try {
            VoucherDTO updated = voucherService.updateVoucher(id, voucherDTO);
            responseData.setSuccess(true);
            responseData.setMessage("Cập nhật voucher thành công!");
            responseData.setData(updated);
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } catch (Exception e) {
            responseData.setSuccess(false);
            responseData.setMessage(e.getMessage());
            return new ResponseEntity<>(responseData, HttpStatus.BAD_REQUEST);
        }
    }

    // Xóa voucher
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
        ResponseData responseData = new ResponseData();
        boolean deleted = voucherService.deleteVoucher(id);
        responseData.setSuccess(deleted);
        responseData.setMessage(deleted ? "Đã xóa voucher thành công!" : "Không tìm thấy voucher");
        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
