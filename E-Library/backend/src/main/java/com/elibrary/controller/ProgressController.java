package com.elibrary.controller;

import com.elibrary.model.ReadingProgress;
import com.elibrary.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/progress")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ProgressController {
    private static final Logger logger = LoggerFactory.getLogger(ProgressController.class);
    private static final int MAX_RETRIES = 3;

    @Autowired
    private ProgressService progressService;

    // PUT - Update reading progress with retry logic for concurrent updates
    @PutMapping
    public ResponseEntity<ReadingProgress> updateProgress(
            @RequestParam Long userId,
            @RequestParam Long bookId,
            @RequestParam Integer currentPage,
            @RequestParam(required = false) Integer totalPages
    ) {
        String separator = "================================================================================";
        logger.info(separator);
        logger.info("PUT /progress API CALLED");
        logger.info("  userId={}, bookId={}, currentPage={}, totalPages={}", userId, bookId, currentPage, totalPages);
        logger.info(separator);
        
        int attempt = 0;
        while (attempt < MAX_RETRIES) {
            try {
                logger.info("[Attempt {}] Calling progressService.updateProgress()", attempt + 1);
                ReadingProgress progress = progressService.updateProgress(userId, bookId, currentPage, totalPages != null ? totalPages : 300);
                
                logger.info(separator);
                logger.info("SUCCESS - Progress saved to database");
                logger.info("  Response - id={}, currentPage={}, totalPages={}, version={}", 
                    progress.getId(), progress.getCurrentPage(), progress.getTotalPages(), progress.getVersion());
                logger.info(separator);
                return ResponseEntity.ok(progress);
            } catch (ObjectOptimisticLockingFailureException e) {
                attempt++;
                logger.warn("[Attempt {}] Optimistic locking conflict for userId={}, bookId={}: {}", 
                    attempt, userId, bookId, e.getMessage());
                if (attempt >= MAX_RETRIES) {
                    logger.error("Max retries reached - returning 409 Conflict");
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(null);
                }
                try {
                    Thread.sleep(50 * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            } catch (Exception e) {
                logger.error("ERROR updating progress - userId={}, bookId={}, Exception={}", userId, bookId, e.getClass().getName());
                logger.error("Exception message: {}", e.getMessage());
                logger.error("Exception details: ", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(null);
            }
        }
        
        logger.error("Failed after {} retries", MAX_RETRIES);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }

    // GET - Retrieve reading progress
    @GetMapping
    public ResponseEntity<ReadingProgress> getProgress(
            @RequestParam Long userId,
            @RequestParam Long bookId
    ) {
        logger.info("GET /progress - userId={}, bookId={}", userId, bookId);
        try {
            ReadingProgress progress = progressService.getProgress(userId, bookId);
            if (progress != null) {
                logger.info("Found progress: currentPage={}, totalPages={}", progress.getCurrentPage(), progress.getTotalPages());
                return ResponseEntity.ok(progress);
            } else {
                logger.warn("No progress found for userId={}, bookId={}", userId, bookId);
                return ResponseEntity.ok(new ReadingProgress(userId, bookId));
            }
        } catch (Exception e) {
            logger.error("Error retrieving progress - userId={}, bookId={}", userId, bookId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
