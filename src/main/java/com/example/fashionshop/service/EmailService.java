package com.example.fashionshop.service;


import com.example.fashionshop.common.Role;
import com.example.fashionshop.model.User;
import com.example.fashionshop.repository.UserRepository;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

import static com.sendgrid.Method.POST;

@Service
public class EmailService {

    @Autowired
    private SendGrid sendGrid;
    @Autowired
    private UserRepository userRepository;

    public boolean sendEmail() {
        Email fromEmail = new Email("hoangcoihd6@gmail.com");
        List<User> users = userRepository.findByRole(Role.CUSTOMER);
        for (User user : users) {
            Email toEmail = new Email(user.getEmail());
            String text  = "Bạn đang có mã giảm giá " + user.getDiscount_percent() + "% cho toàn bộ đơn hàng!";
            Content content = new Content("text/plain", text);
            String subject = "THÔNG BÁO ƯU ĐÃI" ;
            Mail mail = new Mail(fromEmail, subject, toEmail, content);
            Request request = new Request();
            try
            {
                request.setMethod(POST);
                request.setEndpoint("mail/send");
                request.setBody(mail.build());


                Response response = sendGrid.api(request);

                if (response.getStatusCode() == 202) {
                    System.out.println("Email sent successfully");
                } else {
                    System.out.println("Failed: " + response.getStatusCode());
                    System.out.println(response.getBody());
                }
            }
            catch (Exception e)

            {
                e.printStackTrace();
            }

        }
        return true;





    }
}
