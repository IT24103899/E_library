package com.elibrary.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendAdminCodeEmail(String toEmail, String userName, String adminCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Your E-Library Admin Access Code");
            message.setText("Hello " + userName + ",\n\n"
                    + "Your request for Admin access has been approved!\n\n"
                    + "Here is your Admin Code: " + adminCode + "\n\n"
                    + "Please log in to your dashboard and enter this code to activate your admin privileges.\n\n"
                    + "Regards,\nThe E-Library Team");

            mailSender.send(message);
            logger.info("Admin code email successfully sent to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send admin code email to: {}. Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Email sending failed", e);
        }
    }
}
