package com.elibrary.service;

import com.elibrary.model.ReadingProgress;
import com.elibrary.repository.ReadingProgressRepository;
import com.elibrary.repository.BookRepository;
import com.elibrary.model.Book;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ProgressService {
    private static final Logger logger = LoggerFactory.getLogger(ProgressService.class);

    @Autowired
    private ReadingProgressRepository progressRepository;
    @Autowired
    private BookRepository bookRepository;

    // UPDATE - Update reading progress with optimistic locking and concurrency handling
    @Transactional
    public ReadingProgress updateProgress(Long userId, Long bookId, Integer currentPage, Integer totalPages) {
        logger.debug("Updating progress for userId={}, bookId={}, currentPage={}, totalPages={}", userId, bookId, currentPage, totalPages);
        
        try {
            Optional<ReadingProgress> existing = progressRepository.findByUserIdAndBookIdAndIsDeletedFalse(userId, bookId);
            
            ReadingProgress progress;
            if (existing.isPresent()) {
                progress = existing.get();
                Integer prevPage = progress.getCurrentPage();
                logger.debug("Found existing progress record with version={}, currentPage={}", progress.getVersion(), prevPage);
                
                // Only update if new page is greater than current (prevent overwriting with older data)
                // If current page is null (shouldn't happen), treat as 0 for comparison
                int existingPage = (prevPage != null) ? prevPage : 0;
                if (currentPage != null && currentPage >= existingPage) {  // >= to allow same page updates
                    progress.setCurrentPage(currentPage);
                    logger.debug("Updating currentPage from {} to {}", prevPage, currentPage);
                } else if (currentPage != null) {
                    logger.debug("Skipping update: new page {} not greater than current {}", currentPage, existingPage);
                    return progress; // Return existing without updating
                }
                
                // update totalPages if a meaningful value was provided
                if (totalPages != null && totalPages > 0 && (progress.getTotalPages() == null || progress.getTotalPages() <= 0)) {
                    progress.setTotalPages(totalPages);
                    logger.debug("Setting totalPages to {}", totalPages);
                }
            } else {
                logger.debug("Creating new progress record");
                progress = new ReadingProgress();
                progress.setUserId(userId);
                progress.setBookId(bookId);
                // Start new books at page 1 if currentPage is 0 or null
                int startPage = (currentPage == null || currentPage <= 0) ? 1 : currentPage;
                progress.setCurrentPage(startPage);
                progress.setTotalPages(totalPages);
                progress.setVersion(0L);
                logger.debug("Created new progress: currentPage={}, totalPages={}", startPage, totalPages);
            }
            
            progress.setLastReadAt(LocalDateTime.now());
            // Ensure we have a sensible totalPages value: fall back to book metadata when needed
            Integer effectiveTotal = progress.getTotalPages();
            if (effectiveTotal == null || effectiveTotal <= 0) {
                try {
                    Book book = bookRepository.findById(bookId).orElse(null);
                    if (book != null && book.getTotalPages() != null && book.getTotalPages() > 0) {
                        effectiveTotal = book.getTotalPages();
                        progress.setTotalPages(effectiveTotal);
                        logger.debug("Using book totalPages: {}", effectiveTotal);
                    }
                } catch (Exception e) {
                    logger.warn("Could not fetch book metadata", e);
                }
            }

            if (effectiveTotal != null && effectiveTotal > 0) {
                progress.setPercentageComplete((currentPage * 100.0) / effectiveTotal);
                if (currentPage != null && currentPage.equals(effectiveTotal)) {
                    progress.setCompletedAt(LocalDateTime.now());
                }
            } else {
                progress.setPercentageComplete(0.0);
            }
            
            logger.debug("Saving progress: percentageComplete={}, lastReadAt={}", progress.getPercentageComplete(), progress.getLastReadAt());
            ReadingProgress saved = progressRepository.save(progress);
            logger.info("Successfully saved progress for userId={}, bookId={}, currentPage={}", userId, bookId, currentPage);
            return saved;
        } catch (Exception e) {
            logger.error("Error updating progress for userId={}, bookId={}", userId, bookId, e);
            throw new RuntimeException("Failed to update progress: " + e.getMessage(), e);
        }
    }

    // READ - Get reading progress
    public ReadingProgress getProgress(Long userId, Long bookId) {
        return progressRepository.findByUserIdAndBookIdAndIsDeletedFalse(userId, bookId).orElse(null);
    }
}
