package com.elibrary.controller;

import com.elibrary.model.Feedback;
import com.elibrary.repository.FeedbackRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/feedback")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    // Use standard POST without wildcard for better tracking mapping
    @PostMapping
    public ResponseEntity<?> submitFeedback(@Valid @RequestBody Feedback feedbackRequest) {
        try {
            // Validate required fields
            if (feedbackRequest.getUserId() == null || feedbackRequest.getUserId() <= 0) {
                return ResponseEntity.badRequest().body("Error: userId is required and must be valid");
            }
            if (feedbackRequest.getType() == null || feedbackRequest.getType().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Error: feedback type is required");
            }
            if (feedbackRequest.getMessage() == null || feedbackRequest.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Error: feedback message is required");
            }
            
            // Default values and security check
            feedbackRequest.setStatus("PENDING");
            Feedback savedFeedback = feedbackRepository.save(feedbackRequest);
            return ResponseEntity.ok(savedFeedback);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving feedback: " + e.getMessage());
        }
    }

    // Get all feedbacks for admin
    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        try {
            List<Feedback> feedbacks = feedbackRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }

    // Update feedback status for admin
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateFeedbackStatus(@PathVariable Long id, @RequestBody Feedback statusUpdateRequest) {
        try {
            return feedbackRepository.findById(id).map(feedback -> {
                feedback.setStatus(statusUpdateRequest.getStatus());
                feedbackRepository.save(feedback);
                return ResponseEntity.ok(feedback);
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error updating status: " + e.getMessage());
        }
    }
}
