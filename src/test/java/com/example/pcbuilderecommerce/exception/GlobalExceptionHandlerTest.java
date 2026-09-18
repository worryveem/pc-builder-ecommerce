package com.example.pcbuilderecommerce.exception;

import com.example.pcbuilderecommerce.Exception.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.WebRequest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler globalExceptionHandler;

    @Mock
    private WebRequest webRequest;

    @BeforeEach
    void setUp() {
        when(webRequest.getDescription(false)).thenReturn("uri=/api/test");
    }

    @Test
    @DisplayName("Handle ResourceNotFoundException returns 404 NOT_FOUND")
    void testHandleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Không tìm thấy sản phẩm");

        ErrorResponse response = globalExceptionHandler.handleResourceNotFoundException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertEquals("Not Found", response.getError());
        assertEquals("Không tìm thấy sản phẩm", response.getMessage());
        assertEquals("/api/test", response.getPath());
        assertNotNull(response.getTimestamp());
    }

    @Test
    @DisplayName("Handle BadRequestException returns 400 BAD_REQUEST")
    void testHandleBadRequestException() {
        BadRequestException ex = new BadRequestException("Dữ liệu không hợp lệ");

        ErrorResponse response = globalExceptionHandler.handleBadRequestException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Bad Request", response.getError());
        assertEquals("Dữ liệu không hợp lệ", response.getMessage());
        assertEquals("/api/test", response.getPath());
    }

    @Test
    @DisplayName("Handle DuplicateResourceException returns 409 CONFLICT")
    void testHandleDuplicateResourceException() {
        DuplicateResourceException ex = new DuplicateResourceException("Mã voucher đã tồn tại");

        ErrorResponse response = globalExceptionHandler.handleDuplicateResourceException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT.value(), response.getStatus());
        assertEquals("Conflict", response.getError());
        assertEquals("Mã voucher đã tồn tại", response.getMessage());
    }

    @Test
    @DisplayName("Handle UnauthorizedException returns 401 UNAUTHORIZED")
    void testHandleUnauthorizedException() {
        UnauthorizedException ex = new UnauthorizedException("Vui lòng đăng nhập");

        ErrorResponse response = globalExceptionHandler.handleUnauthorizedException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatus());
        assertEquals("Unauthorized", response.getError());
        assertEquals("Vui lòng đăng nhập", response.getMessage());
    }

    @Test
    @DisplayName("Handle AccountLockedException returns 403 FORBIDDEN")
    void testHandleAccountLockedException() {
        AccountLockedException ex = new AccountLockedException("Tài khoản của bạn đã bị khóa!");

        ErrorResponse response = globalExceptionHandler.handleAccountLockedException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.FORBIDDEN.value(), response.getStatus());
        assertEquals("Forbidden", response.getError());
        assertEquals("Tài khoản của bạn đã bị khóa!", response.getMessage());
    }

    @Test
    @DisplayName("Handle IllegalArgumentException returns 400 BAD_REQUEST")
    void testHandleIllegalArgumentException() {
        IllegalArgumentException ex = new IllegalArgumentException("Tham số không hợp lệ");

        ErrorResponse response = globalExceptionHandler.handleIllegalArgumentException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Bad Request", response.getError());
        assertEquals("Tham số không hợp lệ", response.getMessage());
    }

    @Test
    @DisplayName("Handle MethodArgumentNotValidException returns 400 BAD_REQUEST")
    void testHandleValidationException() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getMessage()).thenReturn("Validation failed: [Tên sản phẩm không được để trống]");

        ErrorResponse response = globalExceptionHandler.handleValidationException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Tên sản phẩm không được để trống", response.getMessage());
    }

    @Test
    @DisplayName("Handle general Exception returns 500 INTERNAL_SERVER_ERROR")
    void testHandleGlobalException() {
        Exception ex = new Exception("Lỗi hệ thống bất ngờ");

        ErrorResponse response = globalExceptionHandler.handleGlobalException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), response.getStatus());
        assertEquals("Internal Server Error", response.getError());
        assertEquals("Lỗi hệ thống bất ngờ", response.getMessage());
    }

    @Test
    @DisplayName("Handle UsernameNotFoundException returns 404 NOT_FOUND")
    void testHandleUsernameNotFoundException() {
        org.springframework.security.core.userdetails.UsernameNotFoundException ex = 
                new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: testuser");

        ErrorResponse response = globalExceptionHandler.handleUsernameNotFoundException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertEquals("Not Found", response.getError());
        assertEquals("User not found: testuser", response.getMessage());
    }

    @Test
    @DisplayName("Handle BadCredentialsException returns 401 UNAUTHORIZED")
    void testHandleBadCredentialsException() {
        org.springframework.security.authentication.BadCredentialsException ex = 
                new org.springframework.security.authentication.BadCredentialsException("Bad credentials");

        ErrorResponse response = globalExceptionHandler.handleBadCredentialsException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatus());
        assertEquals("Unauthorized", response.getError());
        assertEquals("Tên đăng nhập hoặc mật khẩu không chính xác!", response.getMessage());
    }

    @Test
    @DisplayName("Handle ForbiddenException returns 403 FORBIDDEN")
    void testHandleForbiddenException() {
        ForbiddenException ex = new ForbiddenException("Bạn không có quyền truy cập");

        ErrorResponse response = globalExceptionHandler.handleForbiddenException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.FORBIDDEN.value(), response.getStatus());
        assertEquals("Forbidden", response.getError());
        assertEquals("Bạn không có quyền truy cập", response.getMessage());
    }

    @Test
    @DisplayName("Handle AccessDeniedException returns 403 FORBIDDEN")
    void testHandleAccessDeniedException() {
        org.springframework.security.access.AccessDeniedException ex = 
                new org.springframework.security.access.AccessDeniedException("Access is denied");

        ErrorResponse response = globalExceptionHandler.handleAccessDeniedException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.FORBIDDEN.value(), response.getStatus());
        assertEquals("Forbidden", response.getError());
        assertEquals("Bạn không có quyền thực hiện thao tác này!", response.getMessage());
    }

    @Test
    @DisplayName("Handle MethodArgumentTypeMismatchException returns 400 BAD_REQUEST")
    void testHandleMethodArgumentTypeMismatchException() {
        org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex = 
                mock(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class);
        when(ex.getName()).thenReturn("id");

        ErrorResponse response = globalExceptionHandler.handleMethodArgumentTypeMismatchException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Bad Request", response.getError());
        assertEquals("Tham số 'id' có giá trị không hợp lệ!", response.getMessage());
    }

    @Test
    @DisplayName("Handle HttpMessageNotReadableException returns 400 BAD_REQUEST")
    void testHandleHttpMessageNotReadableException() {
        org.springframework.http.converter.HttpMessageNotReadableException ex = 
                mock(org.springframework.http.converter.HttpMessageNotReadableException.class);

        ErrorResponse response = globalExceptionHandler.handleHttpMessageNotReadableException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Bad Request", response.getError());
        assertEquals("Dữ liệu yêu cầu gửi lên không đúng định dạng JSON!", response.getMessage());
    }

    @Test
    @DisplayName("Handle DataIntegrityViolationException returns 409 CONFLICT")
    void testHandleDataIntegrityViolationException() {
        org.springframework.dao.DataIntegrityViolationException ex = 
                new org.springframework.dao.DataIntegrityViolationException("FK constraint fail");

        ErrorResponse response = globalExceptionHandler.handleDataIntegrityViolationException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT.value(), response.getStatus());
        assertEquals("Conflict", response.getError());
        assertEquals("Dữ liệu bị trùng lặp hoặc vi phạm ràng buộc toàn vẹn hệ thống!", response.getMessage());
    }

    @Test
    @DisplayName("Handle HttpRequestMethodNotSupportedException returns 405 METHOD_NOT_ALLOWED")
    void testHandleHttpRequestMethodNotSupportedException() {
        org.springframework.web.HttpRequestMethodNotSupportedException ex = 
                new org.springframework.web.HttpRequestMethodNotSupportedException("POST");

        ErrorResponse response = globalExceptionHandler.handleHttpRequestMethodNotSupportedException(ex, webRequest);

        assertNotNull(response);
        assertEquals(HttpStatus.METHOD_NOT_ALLOWED.value(), response.getStatus());
        assertEquals("Method Not Allowed", response.getError());
        assertEquals("Phương thức HTTP 'POST' không được hỗ trợ cho đường dẫn này!", response.getMessage());
    }
}
