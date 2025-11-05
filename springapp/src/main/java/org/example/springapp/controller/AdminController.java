package org.example.springapp.controller;

import org.example.springapp.entity.Complaint;
import org.example.springapp.entity.User;
import org.example.springapp.repository.ComplaintRepository;
import org.example.springapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/complaints")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        List<Complaint> complaints = complaintRepository.findAll();
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/officers")
    public ResponseEntity<List<User>> getOfficers() {
        List<User> officers = userRepository.findByRole("officer");
        return ResponseEntity.ok(officers);
    }

    @GetMapping("/complaints/stats")
    public ResponseEntity<Map<String, Long>> getComplaintStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", complaintRepository.count());
        stats.put("new", complaintRepository.countByStatus("New"));
        stats.put("assigned", complaintRepository.countByStatus("IN PROGRESS"));
        stats.put("resolved", complaintRepository.countByStatus("Resolved"));
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<String> assignComplaint(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        Long officerId = request.get("officerId");
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        User officer = userRepository.findById(officerId).orElse(null);
        
        if (complaint != null && officer != null) {
            complaint.setAssignedTo(officer);
            complaint.setStatus("IN PROGRESS");
            complaintRepository.save(complaint);
            return ResponseEntity.ok("Complaint assigned successfully");
        }
        return ResponseEntity.badRequest().body("Invalid complaint or officer ID");
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<String> updateComplaintStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        
        if (complaint != null) {
            complaint.setStatus(status);
            complaintRepository.save(complaint);
            return ResponseEntity.ok("Status updated successfully");
        }
        return ResponseEntity.badRequest().body("Invalid complaint ID");
    }

    @GetMapping("/complaints/{id}/notes")
    public ResponseEntity<List<String>> getComplaintNotes(@PathVariable Long id) {
        // Return empty list for now - can be implemented later
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/complaints/{id}/replies")
    public ResponseEntity<List<String>> getComplaintReplies(@PathVariable Long id) {
        // Return empty list for now - can be implemented later
        return ResponseEntity.ok(List.of());
    }
}