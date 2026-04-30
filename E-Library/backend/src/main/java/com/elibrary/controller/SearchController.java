package com.elibrary.controller;

import com.elibrary.model.SearchHistory;
import com.elibrary.repository.SearchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search-history")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    @PostMapping
    public ResponseEntity<?> createSearchHistory(@RequestBody Map<String, Object> payload) {
        try {
            if (payload == null || !payload.containsKey("userId") || !payload.containsKey("searchQuery")) {
                return ResponseEntity.badRequest().body(Map.of("error", "userId and searchQuery are required"));
            }

            Long userId = Long.valueOf(payload.get("userId").toString());
            String searchQuery = payload.get("searchQuery").toString().trim();
            
            if (searchQuery.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "searchQuery cannot be empty"));
            }
            
            System.out.println("Saving search history - userId: " + userId + ", query: " + searchQuery);
            
            SearchHistory history = new SearchHistory(userId, searchQuery);
            SearchHistory saved = searchHistoryRepository.save(history);
            System.out.println("Search history saved successfully: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (NumberFormatException e) {
            System.err.println("NumberFormatException: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid userId format"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.err.println("DataIntegrityViolationException: " + e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", "Database constraint violation - user may not exist: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to save search history: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getSearchHistory(@PathVariable Long userId) {
        try {
            List<SearchHistory> history = searchHistoryRepository.findTop5ByUserIdOrderByTimestampDesc(userId);
            // Filter out soft-deleted records
            if (history == null) {
                history = new java.util.ArrayList<>();
            }
            history = history.stream()
                    .filter(h -> h.getIsDeleted() == null || !h.getIsDeleted())
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch search history: " + e.getMessage()));
        }
    }

    @DeleteMapping("/item/{id}")
    @Transactional
    public ResponseEntity<?> deleteSearchHistoryItem(@PathVariable Long id) {
        try {
            searchHistoryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete search history: " + e.getMessage()));
        }
    }

    @DeleteMapping("/user/{userId}")
    @Transactional
    public ResponseEntity<?> clearSearchHistory(@PathVariable Long userId) {
        try {
            searchHistoryRepository.deleteByUserId(userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to clear search history: " + e.getMessage()));
        }
    }

    @DeleteMapping("/query")
    @Transactional
    public ResponseEntity<?> deleteByUserIdAndQuery(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            String searchQuery = payload.get("searchQuery").toString();
            searchHistoryRepository.deleteByUserIdAndSearchQuery(userId, searchQuery);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete: " + e.getMessage()));
        }
    }
}
