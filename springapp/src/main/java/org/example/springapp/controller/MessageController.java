package org.example.springapp.controller;

import org.example.springapp.entity.Message;
import org.example.springapp.entity.Complaint;
import org.example.springapp.entity.User;
import org.example.springapp.repository.MessageRepository;
import org.example.springapp.repository.ComplaintRepository;
import org.example.springapp.repository.UserRepository;
import org.example.springapp.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    @GetMapping("/complaint/{complaintId}/public")
    public ResponseEntity<List<Message>> getPublicMessages(@PathVariable Long complaintId) {
        List<Message> messages = messageRepository.findPublicMessagesByComplaintId(complaintId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/complaint/{complaintId}/private")
    public ResponseEntity<List<Message>> getPrivateMessages(@PathVariable Long complaintId) {
        List<Message> messages = messageRepository.findPrivateMessagesByComplaintId(complaintId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/complaint/{complaintId}/user/{userId}")
    public ResponseEntity<List<Message>> getMessagesForUser(@PathVariable Long complaintId, @PathVariable Long userId) {
        List<Message> messages = messageRepository.findMessagesByComplaintIdAndUserId(complaintId, userId);
        return ResponseEntity.ok(messages);
    }
    
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, Object> request) {
        try {
            Long complaintId = Long.valueOf(request.get("complaintId").toString());
            Long senderId = Long.valueOf(request.get("senderId").toString());
            String content = request.get("content").toString();
            String messageType = request.get("messageType").toString();
            Long recipientId = request.get("recipientId") != null ? 
                Long.valueOf(request.get("recipientId").toString()) : null;
            Boolean notifyUser = request.get("notifyUser") != null ? 
                Boolean.valueOf(request.get("notifyUser").toString()) : false;
            Boolean notifyOfficer = request.get("notifyOfficer") != null ? 
                Boolean.valueOf(request.get("notifyOfficer").toString()) : false;
            
            Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
            User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
            
            Message message = new Message();
            message.setComplaint(complaint);
            message.setSender(sender);
            message.setContent(content);
            message.setMessageType(messageType);
            
            if (recipientId != null) {
                User recipient = userRepository.findById(recipientId)
                    .orElseThrow(() -> new RuntimeException("Recipient not found"));
                message.setRecipient(recipient);
            }
            
            Message savedMessage = messageRepository.save(message);
            
            // Send email notifications based on sender role and message type
            String senderRole = sender.getRole().toUpperCase();
            System.out.println("Processing email - Sender: " + senderRole + ", Type: " + messageType + ", NotifyUser: " + notifyUser + ", NotifyOfficer: " + notifyOfficer);
            
            if ("USER".equals(senderRole)) {
                List<User> admins = userRepository.findByRole("admin");
                for (User admin : admins) {
                    if (admin.getEmail() != null && !admin.getEmail().isEmpty()) {
                        emailService.sendMessageNotification(admin.getEmail(), "User", content, 
                            complaint.getSubject(), complaintId, messageType);
                    }
                }
                if (complaint.getAssignedTo() != null && complaint.getAssignedTo().getEmail() != null && !complaint.getAssignedTo().getEmail().isEmpty()) {
                    emailService.sendMessageNotification(complaint.getAssignedTo().getEmail(), "User", content, 
                        complaint.getSubject(), complaintId, messageType);
                }
            } else if ("ADMIN".equals(senderRole)) {
                if ("PUBLIC".equals(messageType)) {
                    if (notifyUser) {
                        System.out.println("User email: " + (complaint.getUser() != null ? complaint.getUser().getEmail() : "null"));
                        if (complaint.getUser() != null && complaint.getUser().getEmail() != null && !complaint.getUser().getEmail().isEmpty()) {
                            emailService.sendMessageNotification(complaint.getUser().getEmail(), "Admin", content, 
                                complaint.getSubject(), complaintId, messageType);
                        }
                    }
                    if (notifyOfficer && complaint.getAssignedTo() != null && complaint.getAssignedTo().getEmail() != null && !complaint.getAssignedTo().getEmail().isEmpty()) {
                        emailService.sendMessageNotification(complaint.getAssignedTo().getEmail(), "Admin", content, 
                            complaint.getSubject(), complaintId, messageType);
                    }
                } else if ("PRIVATE".equals(messageType)) {
                    if (notifyOfficer && complaint.getAssignedTo() != null && complaint.getAssignedTo().getEmail() != null && !complaint.getAssignedTo().getEmail().isEmpty()) {
                        emailService.sendMessageNotification(complaint.getAssignedTo().getEmail(), "Admin", content, 
                            complaint.getSubject(), complaintId, messageType);
                    }
                }
            } else if ("OFFICER".equals(senderRole)) {
                if ("PUBLIC".equals(messageType)) {
                    List<User> admins = userRepository.findByRole("admin");
                    for (User admin : admins) {
                        if (admin.getEmail() != null && !admin.getEmail().isEmpty()) {
                            emailService.sendMessageNotification(admin.getEmail(), "Officer", content, 
                                complaint.getSubject(), complaintId, messageType);
                        }
                    }
                    if (notifyUser && complaint.getUser() != null && complaint.getUser().getEmail() != null && !complaint.getUser().getEmail().isEmpty()) {
                        emailService.sendMessageNotification(complaint.getUser().getEmail(), "Officer", content, 
                            complaint.getSubject(), complaintId, messageType);
                    }
                } else if ("PRIVATE".equals(messageType)) {
                    List<User> admins = userRepository.findByRole("admin");
                    for (User admin : admins) {
                        if (admin.getEmail() != null && !admin.getEmail().isEmpty()) {
                            emailService.sendMessageNotification(admin.getEmail(), "Officer", content, 
                                complaint.getSubject(), complaintId, messageType);
                        }
                    }
                }
            }
            
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}