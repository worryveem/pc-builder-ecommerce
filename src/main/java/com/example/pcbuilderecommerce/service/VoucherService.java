package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.Exception.DuplicateResourceException;
import com.example.pcbuilderecommerce.Exception.ResourceNotFoundException;
import com.example.pcbuilderecommerce.dto.VoucherApplyResponse;
import com.example.pcbuilderecommerce.dto.VoucherDTO;
import com.example.pcbuilderecommerce.model.Voucher;
import com.example.pcbuilderecommerce.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    public List<VoucherDTO> getActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        return voucherRepository.findAllByActiveTrueOrderByCreatedAtDesc().stream()
                .filter(v -> (v.getStartDate() == null || !now.isBefore(v.getStartDate())))
                .filter(v -> (v.getEndDate() == null || !now.isAfter(v.getEndDate())))
                .filter(v -> (v.getUsageLimit() == null || v.getUsedCount() == null || v.getUsedCount() < v.getUsageLimit()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<VoucherDTO> getAllVouchers() {
        return voucherRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public VoucherDTO getVoucherById(Long id) {
        return voucherRepository.findById(id).map(this::mapToDTO).orElse(null);
    }

    public VoucherApplyResponse applyVoucher(String code, Double orderAmount) {
        if (code == null || code.trim().isEmpty()) {
            return VoucherApplyResponse.builder()
                    .valid(false)
                    .message("Mã voucher không được để trống")
                    .originalAmount(orderAmount)
                    .discountAmount(0.0)
                    .finalAmount(orderAmount)
                    .build();
        }

        if (orderAmount == null || orderAmount <= 0) {
            return VoucherApplyResponse.builder()
                    .valid(false)
                    .code(code)
                    .message("Giá trị đơn hàng không hợp lệ")
                    .originalAmount(0.0)
                    .discountAmount(0.0)
                    .finalAmount(0.0)
                    .build();
        }

        Optional<Voucher> opt = voucherRepository.findByCodeIgnoreCase(code.trim());
        if (opt.isEmpty()) {
            return VoucherApplyResponse.builder()
                    .valid(false)
                    .code(code)
                    .message("Mã giảm giá không tồn tại")
                    .originalAmount(orderAmount)
                    .discountAmount(0.0)
                    .finalAmount(orderAmount)
                    .build();
        }

        Voucher voucher = opt.get();
        if (Boolean.FALSE.equals(voucher.getActive())) {
            return VoucherApplyResponse.builder()
                    .valid(false)
                    .code(code)
                    .message("Mã giảm giá hiện đã bị khóa hoặc hết hạn")
                    .originalAmount(orderAmount)
                    .discountAmount(0.0)
                    .finalAmount(orderAmount)
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            return VoucherApplyResponse.builder()
                    .valid(false)
                    .code(code)
                    .message("Chương trình khuyến mãi chưa bắt đầu")
                    .originalAmount(orderAmount)
                    .discountAmount(0.0)
                    .finalAmount(orderAmount)
                    .build();
        }

        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            return VoucherApplyResponse.builder()
                    .valid(false)
                    .code(code)
                    .message("Mã giảm giá đã hết hạn sử dụng")
                    .originalAmount(orderAmount)
                    .discountAmount(0.0)
                    .finalAmount(orderAmount)
                    .build();
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            return VoucherApplyResponse.builder()
                    .valid(false)
                    .code(code)
                    .message("Mã giảm giá đã hết lượt sử dụng")
                    .originalAmount(orderAmount)
                    .discountAmount(0.0)
                    .finalAmount(orderAmount)
                    .build();
        }

        if (voucher.getMinOrderAmount() != null && orderAmount < voucher.getMinOrderAmount()) {
            return VoucherApplyResponse.builder()
                    .valid(false)
                    .code(code)
                    .message(String.format("Đơn hàng tối thiểu phải từ %,.0f đ để áp dụng mã này", voucher.getMinOrderAmount()))
                    .originalAmount(orderAmount)
                    .discountAmount(0.0)
                    .finalAmount(orderAmount)
                    .build();
        }

        // Calculate discount
        double discount = 0.0;
        if ("PERCENTAGE".equalsIgnoreCase(voucher.getDiscountType())) {
            discount = orderAmount * (voucher.getDiscountValue() / 100.0);
            if (voucher.getMaxDiscountAmount() != null && discount > voucher.getMaxDiscountAmount()) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            // FIXED_AMOUNT
            discount = voucher.getDiscountValue();
        }

        if (discount > orderAmount) {
            discount = orderAmount;
        }

        double finalAmount = Math.max(0, orderAmount - discount);

        return VoucherApplyResponse.builder()
                .valid(true)
                .code(voucher.getCode())
                .message("Áp dụng mã giảm giá thành công!")
                .originalAmount(orderAmount)
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .build();
    }

    @Transactional
    public void recordVoucherUsage(String code) {
        if (code == null || code.trim().isEmpty()) return;
        voucherRepository.findByCodeIgnoreCase(code.trim()).ifPresent(voucher -> {
            int used = voucher.getUsedCount() != null ? voucher.getUsedCount() : 0;
            voucher.setUsedCount(used + 1);
            if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
                voucher.setActive(false);
            }
            voucherRepository.save(voucher);
        });
    }

    @Transactional
    public VoucherDTO createVoucher(VoucherDTO dto) {
        if (voucherRepository.existsByCodeIgnoreCase(dto.getCode())) {
            throw new DuplicateResourceException("Mã voucher '" + dto.getCode() + "' đã tồn tại!");
        }

        Voucher v = new Voucher();
        v.setCode(dto.getCode().trim().toUpperCase());
        v.setDescription(dto.getDescription());
        v.setDiscountType(dto.getDiscountType() != null ? dto.getDiscountType() : "PERCENTAGE");
        v.setDiscountValue(dto.getDiscountValue() != null ? dto.getDiscountValue() : 0.0);
        v.setMinOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : 0.0);
        v.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        v.setUsageLimit(dto.getUsageLimit() != null ? dto.getUsageLimit() : 100);
        v.setUsedCount(0);
        v.setStartDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDateTime.now());
        v.setEndDate(dto.getEndDate() != null ? dto.getEndDate() : LocalDateTime.now().plusMonths(3));
        v.setActive(dto.getActive() != null ? dto.getActive() : true);
        v.setCreatedAt(LocalDateTime.now());

        Voucher saved = voucherRepository.save(v);
        return mapToDTO(saved);
    }

    @Transactional
    public VoucherDTO updateVoucher(Long id, VoucherDTO dto) {
        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher với ID: " + id));

        if (dto.getDescription() != null) v.setDescription(dto.getDescription());
        if (dto.getDiscountType() != null) v.setDiscountType(dto.getDiscountType());
        if (dto.getDiscountValue() != null) v.setDiscountValue(dto.getDiscountValue());
        if (dto.getMinOrderAmount() != null) v.setMinOrderAmount(dto.getMinOrderAmount());
        if (dto.getMaxDiscountAmount() != null) v.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        if (dto.getUsageLimit() != null) v.setUsageLimit(dto.getUsageLimit());
        if (dto.getStartDate() != null) v.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) v.setEndDate(dto.getEndDate());
        if (dto.getActive() != null) v.setActive(dto.getActive());

        return mapToDTO(voucherRepository.save(v));
    }

    @Transactional
    public boolean deleteVoucher(Long id) {
        if (voucherRepository.existsById(id)) {
            voucherRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private VoucherDTO mapToDTO(Voucher v) {
        VoucherDTO dto = new VoucherDTO();
        dto.setId(v.getId());
        dto.setCode(v.getCode());
        dto.setDescription(v.getDescription());
        dto.setDiscountType(v.getDiscountType());
        dto.setDiscountValue(v.getDiscountValue());
        dto.setMinOrderAmount(v.getMinOrderAmount());
        dto.setMaxDiscountAmount(v.getMaxDiscountAmount());
        dto.setUsageLimit(v.getUsageLimit());
        dto.setUsedCount(v.getUsedCount());
        dto.setStartDate(v.getStartDate());
        dto.setEndDate(v.getEndDate());
        dto.setActive(v.getActive());
        dto.setCreatedAt(v.getCreatedAt());
        return dto;
    }
}
