package org.example.springapp.repository;

import org.example.springapp.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByStatus(String status);
}