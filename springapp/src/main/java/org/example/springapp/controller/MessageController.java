package org.example.springapp.controller;

import org.example.springapp.entity.Message;
import org.example.springapp.entity.Complaint;
import org.example.springapp.entity.User;
import org.example.springapp.repository.MessageRepository;
import org.example.springapp.repository.ComplaintRepository;
import org.example.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

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
            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}