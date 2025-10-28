package org.example.springapp.controller;

import org.example.springapp.entity.Complaint;
import org.example.springapp.entity.User;
import org.example.springapp.repository.ComplaintRepository;
import org.example.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:3000")
public class ComplaintController {
    
    @Autowired
    private ComplaintRepository complaintRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitComplaint(
            @RequestParam("subject") String subject,
            @RequestParam("description") String description,
            @RequestParam("submissionType") String submissionType,
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "files", required = false) MultipartFile[] files) {
        
        Complaint complaint = new Complaint();
        complaint.setSubject(subject);
        complaint.setDescription(description);
        complaint.setSubmissionType(submissionType);
        
        if ("Public".equals(submissionType) && userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            complaint.setUser(user);
        }

        if (files != null && files.length > 0) {
            StringBuilder filePaths = new StringBuilder();
            String uploadDir = "uploads/";

            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    try {
                        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                        Path filePath = Paths.get(uploadDir + fileName);
                        Files.write(filePath, file.getBytes());
                        
                        if (!filePaths.isEmpty()) {
                            filePaths.append(",");
                        }
                        filePaths.append(fileName);
                    } catch (IOException e) {
                        return ResponseEntity.badRequest().body(new ComplaintResponse("File upload failed", null));
                    }
                }
            }
            
            if (!filePaths.isEmpty()) {
                complaint.setAttachmentPath(filePaths.toString());
            }
        }
        
        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.ok(new ComplaintResponse("Complaint submitted successfully", saved.getId()));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Complaint>> getUserComplaints(@PathVariable Long userId) {
        List<Complaint> complaints = complaintRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(complaints);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable Long id) {
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(complaint);
    }

    
    static class ComplaintResponse {
        public String message;
        public Long complaintId;
        
        public ComplaintResponse(String message, Long complaintId) {
            this.message = message;
            this.complaintId = complaintId;
        }
    }
}