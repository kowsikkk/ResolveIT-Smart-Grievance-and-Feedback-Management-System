package org.example.springapp.repository;

import org.example.springapp.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE m.complaint.id = :complaintId AND m.messageType = 'PUBLIC' ORDER BY m.createdAt ASC")
    List<Message> findPublicMessagesByComplaintId(@Param("complaintId") Long complaintId);
    
    @Query("SELECT m FROM Message m WHERE m.complaint.id = :complaintId AND m.messageType = 'PRIVATE' ORDER BY m.createdAt ASC")
    List<Message> findPrivateMessagesByComplaintId(@Param("complaintId") Long complaintId);
    
    @Query("SELECT m FROM Message m WHERE m.complaint.id = :complaintId AND (m.messageType = 'PUBLIC' OR (m.recipient.id = :userId OR m.sender.id = :userId)) ORDER BY m.createdAt ASC")
    List<Message> findMessagesByComplaintIdAndUserId(@Param("complaintId") Long complaintId, @Param("userId") Long userId);
}