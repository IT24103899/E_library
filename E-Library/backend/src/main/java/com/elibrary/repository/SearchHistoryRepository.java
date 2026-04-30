package com.elibrary.repository;

import com.elibrary.model.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {
    List<SearchHistory> findTop5ByUserIdOrderByTimestampDesc(Long userId);
    void deleteByUserId(Long userId);
    void deleteByUserIdAndSearchQuery(Long userId, String searchQuery);
    List<SearchHistory> findByUserIdAndIsDeletedFalse(Long userId);
}
