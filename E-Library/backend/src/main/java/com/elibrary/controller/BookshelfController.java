package com.elibrary.controller;

import com.elibrary.model.BookshelfItem;
import com.elibrary.service.BookshelfService;
import com.elibrary.dto.ErrorResponse;
import com.elibrary.dto.SuccessResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookshelf")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class BookshelfController {

    private static final Logger logger = LoggerFactory.getLogger(BookshelfController.class);

    @Autowired
    private BookshelfService bookshelfService;

    // GET all items for the user
    @GetMapping("/all")
    public ResponseEntity<?> getAllBooks(@RequestParam(required = false) Long userId) {
        logger.info("================================================================================");
        logger.info("GET /api/bookshelf/all - Request received with userId={}", userId);
        
        if (userId == null) {
            logger.warn("userId is null in request");
            return ResponseEntity.badRequest().body("userId is required to view bookshelf");
        }
        try {
            logger.info("Fetching bookshelf items for userId={}", userId);
            List<BookshelfItem> items = bookshelfService.getUserBookshelf(userId);
            logger.info("Successfully retrieved {} items", items.size());
            logger.info("================================================================================");
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            logger.error("Error fetching bookshelf items for userId={}", userId, e);
            logger.info("================================================================================");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching bookshelf items: " + e.getMessage());
        }
    }

    // POST a new item to the shelf
    @PostMapping("/add")
    public ResponseEntity<?> addBookToShelf(@RequestBody BookshelfItem item) {
        logger.info("================================================================================");
        logger.info("POST /api/bookshelf/add - Request received");
        logger.info("Item: userId={}, title={}, author={}, emoji={}, genre={}, rating={}, status={}, progress={}, listName={}", 
                   item.getUserId(), item.getTitle(), item.getAuthor(), item.getEmoji(), item.getGenre(), 
                   item.getRating(), item.getStatus(), item.getProgress(), item.getListName());
        
        if (item.getUserId() == null) {
            logger.warn("userId is null in request");
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed", "userId is required to add an item", null));
        }
        
        if (item.getTitle() == null || item.getTitle().trim().isEmpty()) {
            logger.warn("title is null or empty in request");
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed", "title is required", null));
        }
        
        try {
            logger.info("Calling bookshelfService.addToBookshelf()");
            BookshelfItem saved = bookshelfService.addToBookshelf(item.getUserId(), item);
            logger.info("Successfully saved item with id={}", saved.getId());
            logger.info("Response: {}", saved);
            logger.info("================================================================================");
            return ResponseEntity.status(HttpStatus.CREATED).body(new SuccessResponse("Success", "Book added to bookshelf successfully", saved));
        } catch (IllegalArgumentException e) {
            logger.error("Validation error: {}", e.getMessage());
            logger.info("================================================================================");
            return ResponseEntity.badRequest().body(new ErrorResponse("Failed", e.getMessage(), null));
        } catch (Exception e) {
            logger.error("Error adding book to bookshelf", e);
            logger.error("Exception class: {}", e.getClass().getName());
            logger.error("Exception message: {}", e.getMessage());
            logger.info("================================================================================");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed", "Failed to add book to bookshelf: " + e.getMessage(), null));
        }
    }

    // DELETE a single item by id
    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeBookFromShelf(@PathVariable Long id) {
        try {
            bookshelfService.removeFromBookshelf(id);
            return ResponseEntity.ok("{\"message\": \"Book removed\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to remove book\"}");
        }
    }

    // DELETE all items in a specific list for a specific user
    @DeleteMapping("/clear/{listName}")
    public ResponseEntity<?> clearList(@PathVariable String listName, @RequestParam(required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.badRequest().body("userId is required to clear a list");
        }
        try {
            bookshelfService.clearList(userId, listName);
            return ResponseEntity.ok("{\"message\": \"List cleared\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to clear list\"}");
        }
    }

    // PUT move an item to another list
    @PutMapping("/move/{id}")
    public ResponseEntity<?> moveToList(@PathVariable Long id, @RequestParam String targetList) {
        try {
            BookshelfItem updated = bookshelfService.moveToList(id, targetList);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
