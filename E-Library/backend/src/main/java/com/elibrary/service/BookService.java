package com.elibrary.service;

import com.elibrary.model.Book;
import com.elibrary.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // READ - Get all books
    public List<Book> getAllBooks() {
        return bookRepository.findByIsDeletedFalse();
    }

    // READ - Get single book
    public Book getBook(Long id) {
        return bookRepository.findByIdAndIsDeletedFalse(id);
    }

    // READ - Get books by category
    public List<Book> getBooksByCategory(String category) {
        return bookRepository.findByCategoryAndIsDeletedFalse(category);
    }

    // CREATE - Add a new book
    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    // UPDATE - Update book info
    public Book updateBook(Long id, Book bookDetails) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book != null && !book.getIsDeleted()) {
            if (bookDetails.getTitle() != null) book.setTitle(bookDetails.getTitle());
            if (bookDetails.getAuthor() != null) book.setAuthor(bookDetails.getAuthor());
            if (bookDetails.getDescription() != null) book.setDescription(bookDetails.getDescription());
            if (bookDetails.getTotalPages() != null) book.setTotalPages(bookDetails.getTotalPages());
            if (bookDetails.getCategory() != null) book.setCategory(bookDetails.getCategory());
            return bookRepository.save(book);
        }
        return null;
    }

    // DELETE - Soft delete a book
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id).orElse(null);
        if (book != null) {
            book.setIsDeleted(true);
            bookRepository.save(book);
        }
    }
}
