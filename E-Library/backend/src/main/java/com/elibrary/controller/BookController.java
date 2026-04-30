package com.elibrary.controller;

import com.elibrary.model.Book;
import com.elibrary.service.BookService;
import com.elibrary.repository.UserRepository;
import com.elibrary.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/books")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private UserRepository userRepository;

    // GET - Retrieve all books
    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        try {
            List<Book> books = bookService.getAllBooks();
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // GET - Retrieve single book
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        try {
            Book book = bookService.getBook(id);
            if (book != null) {
                return ResponseEntity.ok(book);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // GET - Retrieve book content
    @GetMapping("/{id}/content")
    public ResponseEntity<String> getBookContent(@PathVariable Long id) {
        try {
            Book book = bookService.getBook(id);
            if (book != null && book.getContent() != null) {
                return ResponseEntity.ok(book.getContent());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // GET - Retrieve books by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable String category) {
        try {
            List<Book> books = bookService.getBooksByCategory(category);
            return ResponseEntity.ok(books);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // POST - Create new book (admin only)
    @PostMapping
    public ResponseEntity<?> createBook(@RequestParam(required = false) Long userId, @RequestBody Book book) {
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Missing userId"));
            }
            var optUser = userRepository.findByIdAndIsDeletedFalse(userId);
            if (optUser.isEmpty() || !"ADMIN".equalsIgnoreCase(optUser.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can add books"));
            }

            Book created = bookService.createBook(book);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error details: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create book: " + e.getMessage()));
        }
    }

    // PUT - Update book
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        try {
            Book updated = bookService.updateBook(id, bookDetails);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // DELETE - Delete book
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable Long id) {
        try {
            bookService.deleteBook(id);
            return ResponseEntity.ok("{\"message\": \"Book deleted successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to delete book\"}");
        }
    }
}
