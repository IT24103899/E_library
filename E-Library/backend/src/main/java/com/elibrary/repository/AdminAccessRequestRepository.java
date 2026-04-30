package com.elibrary.repository;

import com.elibrary.model.AdminAccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminAccessRequestRepository extends JpaRepository<AdminAccessRequest, Long> {
    Optional<AdminAccessRequest> findByUserIdAndStatus(Long userId, String status);
    List<AdminAccessRequest> findByStatus(String status);
    List<AdminAccessRequest> findByUserId(Long userId);
    List<AdminAccessRequest> findAllByOrderByCreatedAtDesc();
    Optional<AdminAccessRequest> findByUserIdAndAdminCode(Long userId, String adminCode);
    Optional<AdminAccessRequest> findByUserEmailAndAdminCode(String userEmail, String adminCode);
}
