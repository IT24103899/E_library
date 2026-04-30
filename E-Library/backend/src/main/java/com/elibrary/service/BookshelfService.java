package com.elibrary.service;

import com.elibrary.model.BookshelfItem;
import com.elibrary.model.User;
import com.elibrary.repository.ActivityLogRepository;
import com.elibrary.repository.BookshelfRepository;
import com.elibrary.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BookshelfService {

    @Autowired
    private BookshelfRepository bookshelfRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public List<BookshelfItem> getUserBookshelf(Long userId) {
        return bookshelfRepository.findByUserId(userId);
    }

    public BookshelfItem addToBookshelf(Long userId, BookshelfItem item) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Valid userId is required");
        }
        
        // Fetch user to check premium status
        Optional<User> userOpt = userRepository.findById(userId);
        boolean isPremium = userOpt.isPresent() && Boolean.TRUE.equals(userOpt.get().getIsPremium());
        
        int totalLimit = isPremium ? 50 : 5;
        int dailyLimit = isPremium ? 10 : 1;

        // Only count "library" books (borrowed books) - not wishlist
        List<BookshelfItem> currentItems = bookshelfRepository.findByUserId(userId);
        long borrowedCount = currentItems.stream()
            .filter(b -> "library".equals(b.getListName()) || "borrowed".equals(b.getListName()))
            .count();
        
        // Check if the same book is already in the user's library (prevent duplicate borrows)
        if ("library".equals(item.getListName()) || "borrowed".equals(item.getListName())) {
            boolean alreadyBorrowed = currentItems.stream()
                .anyMatch(b -> b.getTitle() != null && b.getTitle().equalsIgnoreCase(item.getTitle()) &&
                               ("library".equals(b.getListName()) || "borrowed".equals(b.getListName())));
            if (alreadyBorrowed) {
                throw new IllegalArgumentException("You have already borrowed this book.");
            }
        }

        // Prevent adding the same book twice to any other list (favourites, wishlist, etc.)
        if (item.getListName() != null && !"library".equals(item.getListName()) && !"borrowed".equals(item.getListName())) {
            String targetList = item.getListName();
            boolean alreadyInList = currentItems.stream()
                .anyMatch(b -> b.getTitle() != null && b.getTitle().equalsIgnoreCase(item.getTitle()) &&
                               targetList.equalsIgnoreCase(b.getListName()));
            if (alreadyInList) {
                throw new IllegalArgumentException("This book is already in your " + targetList + " list.");
            }
        }

        // If adding to a borrowed list and already at limit, reject
        if (("library".equals(item.getListName()) || "borrowed".equals(item.getListName())) && borrowedCount >= totalLimit) {
            String msg = isPremium 
                ? "You have reached your premium limit of 50 books in your library."
                : "You can only borrow a maximum of 5 books. Upgrade to Premium Scholar to borrow up to 50!";
            throw new IllegalArgumentException(msg);
        }
        
        // Check daily borrow limit
        if ("library".equals(item.getListName()) || "borrowed".equals(item.getListName())) {
            LocalDate today = LocalDate.now();
            LocalDateTime startOfToday = today.atStartOfDay();

            // Count ActivityLog borrows
            long activityBorrowsToday = activityLogRepository.countByUserIdAndActionAndTimestampAfterAndIsDeletedFalse(
                userId, "BORROW", startOfToday
            );

            // Count BookshelfItem borrows (if not already counted in activityLog)
            long bookshelfBorrowsToday = currentItems.stream()
                .filter(b -> ("library".equals(b.getListName()) || "borrowed".equals(b.getListName())) &&
                            b.getBorrowedAt() != null &&
                            b.getBorrowedAt().toLocalDate().equals(today))
                .count();
            
            long totalBorrowedToday = Math.max(activityBorrowsToday, bookshelfBorrowsToday);

            if (totalBorrowedToday >= dailyLimit) {
                String msg = isPremium
                    ? "Premium Scholars can borrow up to 10 books per day. You've reached your limit for today!"
                    : "Standard users can only borrow 1 book per day. Upgrade to Premium Scholar to borrow 10 books/day!";
                throw new IllegalArgumentException(msg);
            }
        }
        
        item.setUserId(userId);
        
        // Set borrow timestamp
        if ("library".equals(item.getListName()) || "borrowed".equals(item.getListName())) {
            item.setBorrowedAt(LocalDateTime.now());
        }
        
        // Set defaults if not provided
        if (item.getRating() == null) {
            item.setRating(0.0);
        }
        if (item.getProgress() == null) {
            item.setProgress(0);
        }
        if (item.getStatus() == null || item.getStatus().isEmpty()) {
            item.setStatus("new");
        }
        if (item.getListName() == null || item.getListName().isEmpty()) {
            item.setListName("favourites");
        }
        
        return bookshelfRepository.save(item);
    }

    @Transactional
    public void removeFromBookshelf(Long id) {
        bookshelfRepository.deleteById(id);
    }

    @Transactional
    public void clearList(Long userId, String listName) {
        bookshelfRepository.deleteByUserIdAndListName(userId, listName);
    }

    @Transactional
    public BookshelfItem moveToList(Long id, String targetList) throws Exception {
        Optional<BookshelfItem> existing = bookshelfRepository.findById(id);
        if (existing.isPresent()) {
            BookshelfItem item = existing.get();
            item.setListName(targetList);
            return bookshelfRepository.save(item);
        } else {
            throw new Exception("Bookshelf item not found");
        }
    }
}
