package com.example.fashionshop.service;

import com.example.fashionshop.Exception.DuplicateResourceException;
import com.example.fashionshop.Exception.ResourceNotFoundException;
import com.example.fashionshop.dto.VoucherApplyResponse;
import com.example.fashionshop.dto.VoucherDTO;
import com.example.fashionshop.model.Voucher;
import com.example.fashionshop.repository.VoucherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VoucherServiceTest {

    @Mock
    private VoucherRepository voucherRepository;

    @InjectMocks
    private VoucherService voucherService;

    private Voucher sampleVoucher;

    @BeforeEach
    void setUp() {
        sampleVoucher = new Voucher();
        sampleVoucher.setId(1L);
        sampleVoucher.setCode("KIDS10");
        sampleVoucher.setDescription("Giảm 10% cho đơn hàng thời trang trẻ em");
        sampleVoucher.setDiscountType("PERCENTAGE");
        sampleVoucher.setDiscountValue(10.0);
        sampleVoucher.setMinOrderAmount(200000.0);
        sampleVoucher.setMaxDiscountAmount(50000.0);
        sampleVoucher.setUsageLimit(100);
        sampleVoucher.setUsedCount(5);
        sampleVoucher.setStartDate(LocalDateTime.now().minusDays(2));
        sampleVoucher.setEndDate(LocalDateTime.now().plusDays(10));
        sampleVoucher.setActive(true);
        sampleVoucher.setCreatedAt(LocalDateTime.now().minusDays(2));
    }

    @Test
    @DisplayName("getActiveVouchers filters out expired and limit-reached vouchers")
    void testGetActiveVouchers() {
        Voucher expired = new Voucher();
        expired.setCode("EXPIRED");
        expired.setActive(true);
        expired.setEndDate(LocalDateTime.now().minusDays(1));

        Voucher limitReached = new Voucher();
        limitReached.setCode("FULL");
        limitReached.setActive(true);
        limitReached.setUsageLimit(10);
        limitReached.setUsedCount(10);

        when(voucherRepository.findAllByActiveTrueOrderByCreatedAtDesc())
                .thenReturn(List.of(sampleVoucher, expired, limitReached));

        List<VoucherDTO> activeList = voucherService.getActiveVouchers();

        assertEquals(1, activeList.size());
        assertEquals("KIDS10", activeList.get(0).getCode());
    }

    @Test
    @DisplayName("applyVoucher returns invalid when code is blank")
    void testApplyVoucher_BlankCode() {
        VoucherApplyResponse resp = voucherService.applyVoucher("   ", 300000.0);

        assertFalse(resp.isValid());
        assertEquals("Mã voucher không được để trống", resp.getMessage());
    }

    @Test
    @DisplayName("applyVoucher returns invalid when order amount is zero or negative")
    void testApplyVoucher_InvalidAmount() {
        VoucherApplyResponse resp = voucherService.applyVoucher("KIDS10", 0.0);

        assertFalse(resp.isValid());
        assertEquals("Giá trị đơn hàng không hợp lệ", resp.getMessage());
    }

    @Test
    @DisplayName("applyVoucher returns invalid when voucher not found")
    void testApplyVoucher_NotFound() {
        when(voucherRepository.findByCodeIgnoreCase("NONEXIST")).thenReturn(Optional.empty());

        VoucherApplyResponse resp = voucherService.applyVoucher("NONEXIST", 300000.0);

        assertFalse(resp.isValid());
        assertEquals("Mã giảm giá không tồn tại", resp.getMessage());
    }

    @Test
    @DisplayName("applyVoucher returns invalid when voucher is inactive")
    void testApplyVoucher_Inactive() {
        sampleVoucher.setActive(false);
        when(voucherRepository.findByCodeIgnoreCase("KIDS10")).thenReturn(Optional.of(sampleVoucher));

        VoucherApplyResponse resp = voucherService.applyVoucher("KIDS10", 300000.0);

        assertFalse(resp.isValid());
        assertEquals("Mã giảm giá hiện đã bị khóa hoặc hết hạn", resp.getMessage());
    }

    @Test
    @DisplayName("applyVoucher returns invalid when start date is in the future")
    void testApplyVoucher_NotStarted() {
        sampleVoucher.setStartDate(LocalDateTime.now().plusDays(2));
        when(voucherRepository.findByCodeIgnoreCase("KIDS10")).thenReturn(Optional.of(sampleVoucher));

        VoucherApplyResponse resp = voucherService.applyVoucher("KIDS10", 300000.0);

        assertFalse(resp.isValid());
        assertEquals("Chương trình khuyến mãi chưa bắt đầu", resp.getMessage());
    }

    @Test
    @DisplayName("applyVoucher returns invalid when end date is past")
    void testApplyVoucher_Expired() {
        sampleVoucher.setEndDate(LocalDateTime.now().minusDays(1));
        when(voucherRepository.findByCodeIgnoreCase("KIDS10")).thenReturn(Optional.of(sampleVoucher));

        VoucherApplyResponse resp = voucherService.applyVoucher("KIDS10", 300000.0);

        assertFalse(resp.isValid());
        assertEquals("Mã giảm giá đã hết hạn sử dụng", resp.getMessage());
    }

    @Test
    @DisplayName("applyVoucher returns invalid when usage limit reached")
    void testApplyVoucher_LimitReached() {
        sampleVoucher.setUsageLimit(50);
        sampleVoucher.setUsedCount(50);
        when(voucherRepository.findByCodeIgnoreCase("KIDS10")).thenReturn(Optional.of(sampleVoucher));

        VoucherApplyResponse resp = voucherService.applyVoucher("KIDS10", 300000.0);

        assertFalse(resp.isValid());
        assertEquals("Mã giảm giá đã hết lượt sử dụng", resp.getMessage());
    }

    @Test
    @DisplayName("applyVoucher returns invalid when minimum order amount not met")
    void testApplyVoucher_MinOrderNotMet() {
        sampleVoucher.setMinOrderAmount(500000.0);
        when(voucherRepository.findByCodeIgnoreCase("KIDS10")).thenReturn(Optional.of(sampleVoucher));

        VoucherApplyResponse resp = voucherService.applyVoucher("KIDS10", 250000.0);

        assertFalse(resp.isValid());
        assertTrue(resp.getMessage().contains("Đơn hàng tối thiểu phải từ"));
    }

    @Test
    @DisplayName("applyVoucher calculates percentage discount capped at maxDiscountAmount")
    void testApplyVoucher_PercentageWithMaxCap() {
        // 10% of 1,000,000 is 100,000, capped at maxDiscountAmount = 50,000
        when(voucherRepository.findByCodeIgnoreCase("KIDS10")).thenReturn(Optional.of(sampleVoucher));

        VoucherApplyResponse resp = voucherService.applyVoucher("KIDS10", 1000000.0);

        assertTrue(resp.isValid());
        assertEquals(50000.0, resp.getDiscountAmount());
        assertEquals(950000.0, resp.getFinalAmount());
        assertEquals("Áp dụng mã giảm giá thành công!", resp.getMessage());
    }

    @Test
    @DisplayName("applyVoucher calculates fixed amount discount")
    void testApplyVoucher_FixedAmount() {
        sampleVoucher.setDiscountType("FIXED_AMOUNT");
        sampleVoucher.setDiscountValue(30000.0);
        sampleVoucher.setMinOrderAmount(100000.0);
        when(voucherRepository.findByCodeIgnoreCase("KIDS10")).thenReturn(Optional.of(sampleVoucher));

        VoucherApplyResponse resp = voucherService.applyVoucher("KIDS10", 200000.0);

        assertTrue(resp.isValid());
        assertEquals(30000.0, resp.getDiscountAmount());
        assertEquals(170000.0, resp.getFinalAmount());
    }

    @Test
    @DisplayName("recordVoucherUsage increments usedCount and deactivates when reaching limit")
    void testRecordVoucherUsage_DeactivatesWhenLimitReached() {
        sampleVoucher.setUsageLimit(10);
        sampleVoucher.setUsedCount(9);
        when(voucherRepository.findByCodeIgnoreCase("KIDS10")).thenReturn(Optional.of(sampleVoucher));

        voucherService.recordVoucherUsage("KIDS10");

        assertEquals(10, sampleVoucher.getUsedCount());
        assertFalse(sampleVoucher.getActive());
        verify(voucherRepository, times(1)).save(sampleVoucher);
    }

    @Test
    @DisplayName("createVoucher throws DuplicateResourceException when code already exists")
    void testCreateVoucher_DuplicateCode() {
        VoucherDTO dto = new VoucherDTO();
        dto.setCode("KIDS10");

        when(voucherRepository.existsByCodeIgnoreCase("KIDS10")).thenReturn(true);

        assertThrows(
                DuplicateResourceException.class,
                () -> voucherService.createVoucher(dto)
        );
        verify(voucherRepository, never()).save(any());
    }

    @Test
    @DisplayName("createVoucher saves and returns new voucher")
    void testCreateVoucher_Success() {
        VoucherDTO dto = new VoucherDTO();
        dto.setCode("BABY20");
        dto.setDescription("Giảm 20% đồ sơ sinh");
        dto.setDiscountValue(20.0);

        when(voucherRepository.existsByCodeIgnoreCase("BABY20")).thenReturn(false);
        when(voucherRepository.save(any(Voucher.class))).thenAnswer(invocation -> {
            Voucher v = invocation.getArgument(0);
            v.setId(2L);
            return v;
        });

        VoucherDTO created = voucherService.createVoucher(dto);

        assertNotNull(created);
        assertEquals("BABY20", created.getCode());
        verify(voucherRepository, times(1)).save(any(Voucher.class));
    }

    @Test
    @DisplayName("updateVoucher throws ResourceNotFoundException when id does not exist")
    void testUpdateVoucher_NotFound() {
        when(voucherRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> voucherService.updateVoucher(999L, new VoucherDTO())
        );
    }

    @Test
    @DisplayName("updateVoucher updates existing voucher fields")
    void testUpdateVoucher_Success() {
        VoucherDTO dto = new VoucherDTO();
        dto.setDescription("Cập nhật mô tả mới");
        dto.setDiscountValue(15.0);

        when(voucherRepository.findById(1L)).thenReturn(Optional.of(sampleVoucher));
        when(voucherRepository.save(sampleVoucher)).thenReturn(sampleVoucher);

        VoucherDTO updated = voucherService.updateVoucher(1L, dto);

        assertEquals("Cập nhật mô tả mới", updated.getDescription());
        assertEquals(15.0, updated.getDiscountValue());
        verify(voucherRepository, times(1)).save(sampleVoucher);
    }

    @Test
    @DisplayName("deleteVoucher deletes when exists, returns false when not exists")
    void testDeleteVoucher() {
        when(voucherRepository.existsById(1L)).thenReturn(true);
        doNothing().when(voucherRepository).deleteById(1L);
        assertTrue(voucherService.deleteVoucher(1L));

        when(voucherRepository.existsById(999L)).thenReturn(false);
        assertFalse(voucherService.deleteVoucher(999L));
    }
}
