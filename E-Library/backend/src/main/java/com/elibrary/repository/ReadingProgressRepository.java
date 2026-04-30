package com.elibrary.repository;

import com.elibrary.model.ReadingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, Long> {
    Optional<ReadingProgress> findByUserIdAndBookIdAndIsDeletedFalse(Long userId, Long bookId);
    List<ReadingProgress> findByUserId(Long userId);
    List<ReadingProgress> findByUserIdAndIsDeletedFalse(Long userId);
}
