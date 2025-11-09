package org.example.springapp.repository;

import org.example.springapp.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Complaint> findByAssignedToId(Long assignedToId);
    long countByStatus(String status);
    
    @Query("SELECT c FROM Complaint c WHERE c.status = 'IN PROGRESS' AND c.createdAt < DATEADD(DAY, -2, CURRENT_TIMESTAMP) ORDER BY c.createdAt ASC")
    List<Complaint> findEscalatedComplaints();
}