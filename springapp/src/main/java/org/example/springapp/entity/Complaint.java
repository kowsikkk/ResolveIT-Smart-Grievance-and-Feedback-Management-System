package org.example.springapp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Data
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String submissionType;
    
    @Column
    private String attachmentPath;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    private String status = "Complaint Submitted";
    
    @Column
    private String priority = "Medium";
    
    @Column
    private String category = "General";
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}