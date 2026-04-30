package com.elibrary.repository;

import com.elibrary.model.BookshelfItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookshelfRepository extends JpaRepository<BookshelfItem, Long> {
    
    // Fetch all items for a specific user
    List<BookshelfItem> findByUserId(Long userId);
    
    // Fetch items for a specific user by list name
    List<BookshelfItem> findByUserIdAndListName(Long userId, String listName);
    
    // Delete all items in a specific list for a specific user
    void deleteByUserIdAndListName(Long userId, String listName);
}
