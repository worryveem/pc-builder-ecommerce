package com.example.pcbuilderecommerce.service;

import com.example.pcbuilderecommerce.common.Role;
import com.example.pcbuilderecommerce.model.User;
import com.example.pcbuilderecommerce.repository.UserRepository;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private SendGrid sendGrid;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EmailService emailService;

    @Test
    @DisplayName("sendEmail does not call SendGrid api when no customers found")
    void testSendEmail_NoCustomers() throws IOException {
        when(userRepository.findByRole(Role.CUSTOMER)).thenReturn(Collections.emptyList());

        boolean result = emailService.sendEmail();

        assertTrue(result);
        verify(sendGrid, never()).api(any(Request.class));
    }

    @Test
    @DisplayName("sendEmail sends discount email to all customers successfully")
    void testSendEmail_Success() throws IOException {
        User u1 = new User();
        u1.setEmail("customer1@example.com");
        u1.setDiscount_percent(10.0);

        User u2 = new User();
        u2.setEmail("customer2@example.com");
        u2.setDiscount_percent(5.0);

        when(userRepository.findByRole(Role.CUSTOMER)).thenReturn(List.of(u1, u2));

        Response okResponse = new Response();
        okResponse.setStatusCode(202);
        when(sendGrid.api(any(Request.class))).thenReturn(okResponse);

        boolean result = emailService.sendEmail();

        assertTrue(result);
        verify(sendGrid, times(2)).api(any(Request.class));
    }

    @Test
    @DisplayName("sendEmail handles exception from SendGrid api without crashing")
    void testSendEmail_HandleException() throws IOException {
        User u1 = new User();
        u1.setEmail("customer1@example.com");
        u1.setDiscount_percent(10.0);

        when(userRepository.findByRole(Role.CUSTOMER)).thenReturn(List.of(u1));
        when(sendGrid.api(any(Request.class))).thenThrow(new IOException("Network error"));

        boolean result = emailService.sendEmail();

        assertTrue(result);
    }
}
