package com.elibrary.repository;

import com.elibrary.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    // Query methods with isDeleted check (kept for backward compatibility)
    List<ActivityLog> findByUserIdAndIsDeletedFalse(Long userId);
    List<ActivityLog> findByBookIdAndUserIdAndIsDeletedFalse(Long bookId, Long userId);
    long countByUserIdAndActionAndTimestampAfterAndIsDeletedFalse(Long userId, String action, LocalDateTime timestamp);
    
    // Query methods without isDeleted check (for hard delete approach)
    List<ActivityLog> findByUserId(Long userId);
    List<ActivityLog> findByBookIdAndUserId(Long bookId, Long userId);
    long countByUserIdAndActionAndTimestampAfter(Long userId, String action, LocalDateTime timestamp);
    boolean existsByUserIdAndBookIdAndAction(Long userId, Long bookId, String action);
}
