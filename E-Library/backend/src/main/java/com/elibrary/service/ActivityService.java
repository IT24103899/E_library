package com.elibrary.service;

import com.elibrary.model.ActivityLog;
import com.elibrary.model.Book;
import com.elibrary.model.ReadingProgress;
import com.elibrary.model.User;
import com.elibrary.repository.ActivityLogRepository;
import com.elibrary.repository.BookRepository;
import com.elibrary.repository.ReadingProgressRepository;
import com.elibrary.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.Comparator;

@Service
public class ActivityService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReadingProgressRepository progressRepository;

    // CREATE - Log a new activity
    public ActivityLog createActivity(Long userId, Long bookId, String action) {
        if ("BORROW".equalsIgnoreCase(action)) {
            // Prevent borrowing the same book twice
            if (activityLogRepository.existsByUserIdAndBookIdAndAction(userId, bookId, "BORROW")) {
                throw new IllegalArgumentException("You have already borrowed this book.");
            }

            // Check limits before saving
            Optional<User> userOpt = userRepository.findById(userId);
            boolean isPremium = userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getIsPremium());
            
            int dailyLimit = isPremium ? 10 : 2;
            
            // Start of today (midnight)
            LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
            
            long borrowedToday = activityLogRepository.countByUserIdAndActionAndTimestampAfter(
                userId, "BORROW", startOfToday
            );
            
            if (borrowedToday >= dailyLimit) {
                String msg = isPremium 
                    ? "Premium Scholars can borrow up to 10 books per day. You've reached your limit!"
                    : "Standard users can only borrow 2 books per day. Upgrade to Premium Scholar for 10 books/day!";
                throw new IllegalArgumentException(msg);
            }
        }

        ActivityLog log = new ActivityLog();
        log.setUserId(userId);
        log.setBookId(bookId);
        log.setAction(action);
        log.setTimestamp(LocalDateTime.now());
        return activityLogRepository.save(log);
    }

    // CREATE with more details
    public ActivityLog createActivity(Long userId, Long bookId, String action, Integer currentPage, Integer timeSpentMinutes) {
        if ("BORROW".equalsIgnoreCase(action)) {
            // Prevent borrowing the same book twice
            if (activityLogRepository.existsByUserIdAndBookIdAndAction(userId, bookId, "BORROW")) {
                throw new IllegalArgumentException("You have already borrowed this book.");
            }

            // Check limits before saving
            Optional<User> userOpt = userRepository.findById(userId);
            boolean isPremium = userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getIsPremium());
            
            int dailyLimit = isPremium ? 10 : 2;
            
            // Start of today (midnight)
            LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
            
            long borrowedToday = activityLogRepository.countByUserIdAndActionAndTimestampAfter(
                userId, "BORROW", startOfToday
            );
            
            if (borrowedToday >= dailyLimit) {
                String msg = isPremium 
                    ? "Premium Scholars can borrow up to 10 books per day. You've reached your limit!"
                    : "Standard users can only borrow 2 books per day. Upgrade to Premium Scholar for 10 books/day!";
                throw new IllegalArgumentException(msg);
            }
        }

        ActivityLog log = new ActivityLog();
        log.setUserId(userId);
        log.setBookId(bookId);
        log.setAction(action);
        log.setCurrentPage(currentPage);
        log.setTimeSpentMinutes(timeSpentMinutes);
        // Mark high interest if time spent > 5 minutes
        log.setHighInterest(timeSpentMinutes != null && timeSpentMinutes > 5);
        log.setTimestamp(LocalDateTime.now());
        return activityLogRepository.save(log);
    }

    // READ - Get user's activity history
    public List<ActivityLog> getUserHistory(Long userId) {
        return activityLogRepository.findByUserId(userId);
    }

    // DELETE - Hard delete an activity (completely remove from database)
    public void deleteActivity(Long activityId) {
        activityLogRepository.deleteById(activityId);
    }

    // Get stats for dashboard
    public ActivityStatsDTO getUserStats(Long userId) {
        List<ActivityLog> activities = getUserHistory(userId);

        // --- Reading Velocity ---
        // Use only non-deleted ReadingProgress records (deleted records have current_page=0)
        List<ReadingProgress> progressList = progressRepository.findByUserIdAndIsDeletedFalse(userId);
        int totalPagesRead = progressList.stream()
                .mapToInt(p -> p.getCurrentPage() != null ? p.getCurrentPage() : 0)
                .sum();
        // Express as pages read total (rename label on frontend to "Pages Read")
        // If we have session time data in future, we can convert back to pages/hour
        int readingVelocity = totalPagesRead;

        // --- Books Read ---
        // Count distinct books that have any reading progress
        long booksRead = progressList.stream()
                .map(ReadingProgress::getBookId)
                .distinct()
                .count();
        // Fallback to activity log distinct books if no progress records
        if (booksRead == 0) {
            booksRead = activities.stream()
                    .map(ActivityLog::getBookId)
                    .distinct()
                    .count();
        }

        // --- Current Streak (consecutive days with reading activity) ---
        // Collect all distinct dates that have a reading progress update (lastReadAt)
        Set<LocalDate> activeDays = new TreeSet<>();
        for (ReadingProgress p : progressList) {
            if (p.getLastReadAt() != null) {
                activeDays.add(p.getLastReadAt().toLocalDate());
            }
        }
        // Also include dates from activity logs (BORROW, READ actions)
        for (ActivityLog a : activities) {
            if (a.getTimestamp() != null) {
                activeDays.add(a.getTimestamp().toLocalDate());
            }
        }

        // Count consecutive days ending today (or yesterday)
        int currentStreak = 0;
        LocalDate check = LocalDate.now();
        if (!activeDays.contains(check)) {
            check = check.minusDays(1); // allow streak if last active yesterday
        }
        while (activeDays.contains(check)) {
            currentStreak++;
            check = check.minusDays(1);
        }

        return new ActivityStatsDTO(
                readingVelocity,
                currentStreak,
                (int) booksRead
        );
    }

    // DTO for stats
    public static class ActivityStatsDTO {
        public int readingVelocity;
        public int currentStreak;
        public int booksRead;

        public ActivityStatsDTO(int readingVelocity, int currentStreak, int booksRead) {
            this.readingVelocity = readingVelocity;
            this.currentStreak = currentStreak;
            this.booksRead = booksRead;
        }

        public int getReadingVelocity() { return readingVelocity; }
        public int getCurrentStreak() { return currentStreak; }
        public int getBooksRead() { return booksRead; }
    }
}
