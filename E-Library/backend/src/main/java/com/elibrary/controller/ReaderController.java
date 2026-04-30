package com.elibrary.controller;

import com.elibrary.model.Bookmark;
import com.elibrary.model.Highlight;
import com.elibrary.repository.BookmarkRepository;
import com.elibrary.repository.HighlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reader")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ReaderController {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private HighlightRepository highlightRepository;

    // --- Bookmarks ---

    @GetMapping("/bookmarks")
    public ResponseEntity<List<Bookmark>> getBookmarks(@RequestParam Long userId, @RequestParam(required = false) Long bookId) {
        try {
            List<Bookmark> bookmarks;
            if (bookId != null) {
                bookmarks = bookmarkRepository.findByUserIdAndBookId(userId, bookId);
            } else {
                bookmarks = bookmarkRepository.findByUserId(userId);
            }
            return ResponseEntity.ok(bookmarks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/bookmarks")
    public ResponseEntity<?> addBookmark(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            Long bookId = Long.parseLong(request.get("bookId").toString());
            Integer pageNumber = Integer.parseInt(request.get("pageNumber").toString());

            Bookmark bookmark = new Bookmark(userId, bookId, pageNumber);
            Bookmark saved = bookmarkRepository.save(bookmark);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to add bookmark: " + e.getMessage()));
        }
    }

    @PutMapping("/bookmarks/{id}")
    public ResponseEntity<?> updateBookmark(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            var bookmark = bookmarkRepository.findById(id);
            if (bookmark.isPresent()) {
                Bookmark b = bookmark.get();
                if (request.containsKey("pageNumber")) b.setPageNumber(Integer.parseInt(request.get("pageNumber").toString()));
                Bookmark updated = bookmarkRepository.save(b);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Bookmark not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to update bookmark: " + e.getMessage()));
        }
    }

    @DeleteMapping("/bookmarks/{id}")
    public ResponseEntity<Void> deleteBookmark(@PathVariable Long id) {
        try {
            bookmarkRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // --- Highlights ---

    @GetMapping("/highlights")
    public ResponseEntity<List<Highlight>> getHighlights(@RequestParam Long userId, @RequestParam(required = false) Long bookId) {
        try {
            List<Highlight> highlights;
            if (bookId != null) {
                highlights = highlightRepository.findByUserIdAndBookId(userId, bookId);
            } else {
                highlights = highlightRepository.findByUserId(userId);
            }
            return ResponseEntity.ok(highlights);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/highlights")
    public ResponseEntity<?> addHighlight(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            Long bookId = Long.parseLong(request.get("bookId").toString());
            Integer pageNumber = Integer.parseInt(request.get("pageNumber").toString());
            String content = request.get("content").toString();
            String color = request.getOrDefault("color", "yellow").toString();

            Highlight highlight = new Highlight(userId, bookId, pageNumber, content, color);
            Highlight saved = highlightRepository.save(highlight);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to add highlight: " + e.getMessage()));
        }
    }

    @PutMapping("/highlights/{id}")
    public ResponseEntity<?> updateHighlight(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            var highlight = highlightRepository.findById(id);
            if (highlight.isPresent()) {
                Highlight h = highlight.get();
                if (request.containsKey("pageNumber")) h.setPageNumber(Integer.parseInt(request.get("pageNumber").toString()));
                if (request.containsKey("content")) h.setContent(request.get("content").toString());
                if (request.containsKey("color")) h.setColor(request.get("color").toString());
                Highlight updated = highlightRepository.save(h);
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Highlight not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to update highlight: " + e.getMessage()));
        }
    }

    @DeleteMapping("/highlights/{id}")
    public ResponseEntity<Void> deleteHighlight(@PathVariable Long id) {
        try {
            highlightRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
