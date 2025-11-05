package org.example.springapp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column(nullable = false)
    private String messageType; // "PUBLIC" or "PRIVATE"
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @ManyToOne
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;
    
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient; // null for public messages, specific user for private messages
}