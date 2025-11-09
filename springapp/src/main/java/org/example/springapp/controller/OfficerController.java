package org.example.springapp.controller;

import org.example.springapp.entity.Complaint;
import org.example.springapp.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/officer")
@CrossOrigin(origins = "http://localhost:3000")
public class OfficerController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @GetMapping("/complaints/{officerId}")
    public ResponseEntity<List<Complaint>> getAssignedComplaints(@PathVariable Long officerId) {
        List<Complaint> complaints = complaintRepository.findByAssignedToId(officerId);
        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/stats/{officerId}")
    public ResponseEntity<Map<String, Integer>> getOfficerStats(@PathVariable Long officerId) {
        List<Complaint> complaints = complaintRepository.findByAssignedToId(officerId);
        
        Map<String, Integer> stats = new HashMap<>();
        stats.put("assigned", complaints.size());
        stats.put("inProgress", (int) complaints.stream().filter(c -> "IN PROGRESS".equals(c.getStatus())).count());
        stats.put("resolved", (int) complaints.stream().filter(c -> "Resolved".equals(c.getStatus())).count());
        
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<Map<String, String>> updateComplaintStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request) {
        
        Optional<Complaint> complaintOpt = complaintRepository.findById(id);
        if (complaintOpt.isPresent()) {
            Complaint complaint = complaintOpt.get();
            complaint.setStatus(request.get("status"));
            complaintRepository.save(complaint);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Status updated successfully");
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.notFound().build();
    }
}