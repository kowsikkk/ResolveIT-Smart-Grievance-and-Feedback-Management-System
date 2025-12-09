package org.example.springapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail) {
        String token = java.util.UUID.randomUUID().toString();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Email Verification - ResolveIT");
        message.setText("Please verify your email by clicking the link below:\n\n" +
                "http://localhost:3000/verify-email?token=" + token + "&email=" + toEmail + "\n\n" +
                "Click 'Accept & Verify' to complete your registration.\n\n" +
                "Thank you,\nResolveIT Team");
        message.setFrom("noreply@resolveit.com");
        
        mailSender.send(message);
    }

    public void sendMessageNotification(String toEmail, String senderRole, String messageContent, String complaintSubject, Long complaintId, String messageType) {
        System.out.println("Sending email to: " + toEmail + " from " + senderRole);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("New " + messageType + " Message - Complaint #" + complaintId);
            message.setText("You have received a new " + messageType.toLowerCase() + " message from " + senderRole + "\n\n" +
                    "Complaint: " + complaintSubject + "\n" +
                    "Complaint ID: #" + complaintId + "\n\n" +
                    "Message: " + messageContent + "\n\n" +
                    "Please login to ResolveIT to view and respond.\n\n" +
                    "Thank you,\nResolveIT Team");
            
            mailSender.send(message);
            System.out.println("SUCCESS: Email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("FAILED: Email to " + toEmail + " - " + e.getMessage());
            e.printStackTrace();
        }
    }
}