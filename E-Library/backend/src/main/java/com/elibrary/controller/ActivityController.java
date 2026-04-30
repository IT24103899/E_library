package com.elibrary.controller;

import com.elibrary.model.ActivityLog;
import com.elibrary.model.Book;
import com.elibrary.service.ActivityService;
import com.elibrary.service.ProgressService;
import com.elibrary.repository.BookRepository;
import com.elibrary.model.ReadingProgress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private BookRepository bookRepository;

    // GET - Retrieve user's activity history with real book details
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(@RequestParam Long userId) {
        try {
            List<ActivityLog> activities = activityService.getUserHistory(userId);
            
            // Transform activities to include real book details
            List<Map<String, Object>> response = activities.stream()
                    .map(activity -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", activity.getId());
                        map.put("bookId", activity.getBookId());
                        
                        // Fetch real book details from database
                        Book book = bookRepository.findById(activity.getBookId()).orElse(null);
                        if (book != null) {
                            map.put("title", book.getTitle());
                            map.put("author", book.getAuthor());
                            map.put("totalPages", book.getTotalPages());
                            map.put("coverUrl", book.getCoverUrl());
                            map.put("category", book.getCategory());
                            map.put("description", book.getDescription());
                        } else {
                            map.put("title", "Unknown Book");
                            map.put("author", "Unknown Author");
                            map.put("totalPages", 300);
                            map.put("coverUrl", null);
                            map.put("category", "Unknown");
                            map.put("description", "");
                        }
                        
                        // Prefer the authoritative ReadingProgress if available
                        ReadingProgress progress = progressService.getProgress(activity.getUserId(), activity.getBookId());
                        if (progress != null) {
                            map.put("currentPage", progress.getCurrentPage() != null ? progress.getCurrentPage() : 0);
                        } else {
                            map.put("currentPage", activity.getCurrentPage() != null ? activity.getCurrentPage() : 0);
                        }
                        map.put("lastRead", activity.getTimestamp());
                        map.put("action", activity.getAction());
                        map.put("timeSpent", activity.getTimeSpentMinutes() != null ? activity.getTimeSpentMinutes() : 0);
                        return map;
                    })
                    .collect(Collectors.toList());

            // Deduplicate by bookId — keep only the most recent activity per book
            List<Map<String, Object>> deduplicated = response.stream()
                    .sorted((a, b) -> {
                        java.time.LocalDateTime ta = (java.time.LocalDateTime) a.get("lastRead");
                        java.time.LocalDateTime tb = (java.time.LocalDateTime) b.get("lastRead");
                        if (ta == null && tb == null) return 0;
                        if (ta == null) return 1;
                        if (tb == null) return -1;
                        return tb.compareTo(ta);
                    })
                    .collect(java.util.stream.Collectors.toMap(
                            m -> (Long) m.get("bookId"),
                            m -> m,
                            (existing, replacement) -> existing,
                            java.util.LinkedHashMap::new
                    ))
                    .values()
                    .stream()
                    .collect(Collectors.toList());

            return ResponseEntity.ok(deduplicated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // POST - Create new activity
    @PostMapping("/activity")
    public ResponseEntity<Map<String, Object>> createActivity(@RequestBody Map<String, Object> request) {
        try {
            // Parse request parameters with null checks
            if (request.get("userId") == null || request.get("bookId") == null || request.get("action") == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Missing required fields: userId, bookId, action");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            Long userId = ((Number) request.get("userId")).longValue();
            Long bookId = ((Number) request.get("bookId")).longValue();
            String action = (String) request.get("action");
            Integer currentPage = request.get("currentPage") != null ? ((Number) request.get("currentPage")).intValue() : null;
            Integer timeSpentMinutes = request.get("timeSpentMinutes") != null ? ((Number) request.get("timeSpentMinutes")).intValue() : null;
            
            ActivityLog activity = activityService.createActivity(userId, bookId, action, currentPage, timeSpentMinutes);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", activity.getId());
            response.put("bookId", activity.getBookId());
            response.put("userId", activity.getUserId());
            response.put("action", action);
            response.put("timestamp", activity.getTimestamp());
            response.put("message", "Activity created successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            // Limit exceeded or validation error
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            e.printStackTrace(); // Log for debugging
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create activity: " + e.getMessage());
            error.put("details", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // DELETE - Remove activity from history
    @DeleteMapping("/history/{activityId}")
    public ResponseEntity<String> deleteActivity(@PathVariable Long activityId) {
        try {
            activityService.deleteActivity(activityId);
            return ResponseEntity.ok("{\"message\": \"Activity deleted successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to delete activity\"}");
        }
    }
}
