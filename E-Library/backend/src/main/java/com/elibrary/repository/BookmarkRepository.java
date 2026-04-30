package com.elibrary.repository;

import com.elibrary.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUserIdAndBookId(Long userId, Long bookId);
    List<Bookmark> findByUserId(Long userId);
    List<Bookmark> findByUserIdAndIsDeletedFalse(Long userId);
}
