package com.example.fashionshop.controller;


import com.example.fashionshop.dto.response.ResponseData;
import com.example.fashionshop.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class EmailController {

    @Autowired
    private EmailService emailService;
    @PostMapping("/send/mail")
    public ResponseEntity<?> send()
    {
        ResponseData responseData = new ResponseData();
        responseData.setSuccess(emailService.sendEmail());

        return new ResponseEntity<>(responseData, HttpStatus.OK);
    }
}
