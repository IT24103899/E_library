package com.elibrary.repository;

import com.elibrary.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByIsDeletedFalse();
    Book findByIdAndIsDeletedFalse(Long id);
    List<Book> findByCategoryAndIsDeletedFalse(String category);
}
