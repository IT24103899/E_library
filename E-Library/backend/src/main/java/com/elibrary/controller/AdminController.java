package com.elibrary.controller;

import com.elibrary.model.User;
import com.elibrary.repository.UserRepository;
import com.elibrary.repository.ActivityLogRepository;
import com.elibrary.repository.BookmarkRepository;
import com.elibrary.repository.HighlightRepository;
import com.elibrary.repository.FeedbackRepository;
import com.elibrary.repository.ReadingProgressRepository;
import com.elibrary.repository.SearchHistoryRepository;
import com.elibrary.service.BookService;
import com.elibrary.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private HighlightRepository highlightRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private ReadingProgressRepository readingProgressRepository;

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    @Autowired
    private BookService bookService;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // GET - list all users (admin only)
    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestParam Long userId) {
        try {
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can view users"));
            }

            // Return non-deleted users (proper database query)
            List<User> users = userRepository.findByIsDeletedFalse();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch users"));
        }
    }

    // POST - create a new user (admin only)
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body, @RequestParam Long userId) {
        try {
            // Verify admin
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can create users"));
            }

            String fullName = body.get("fullName");
            String email = body.get("email");
            String role = body.getOrDefault("role", "USER").toUpperCase();

            // Validate inputs
            if (fullName == null || fullName.trim().isEmpty() || email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name and email are required"));
            }

            // Check if email already exists
            if (userRepository.findByEmailAndIsDeletedFalse(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Email already exists"));
            }

            // Create new user with temporary password
            User newUser = new User();
            newUser.setFullName(fullName);
            newUser.setEmail(email);
            newUser.setRole(role);
            newUser.setPassword(passwordEncoder.encode("TempPass123!")); // Temporary password
            newUser.setIsDeleted(false);

            userRepository.save(newUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to create user: " + e.getMessage()));
        }
    }

    // PUT - change user role (admin only)
    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeUserRole(@PathVariable Long id, @RequestParam Long userId, @RequestParam String role) {
        try {
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can change roles"));
            }

            var targetOpt = userRepository.findById(id);
            if (targetOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User target = targetOpt.get();
            target.setRole(role == null ? "USER" : role.toUpperCase());
            userRepository.save(target);
            return ResponseEntity.ok(Map.of("message", "Role updated", "role", target.getRole()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to change role"));
        }
    }

    // DELETE - soft-delete a user (admin only)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @RequestParam Long userId) {
        try {
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can delete users"));
            }

            var targetOpt = userRepository.findByIdAndIsDeletedFalse(id);
            if (targetOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found or already deleted"));
            }

            // Soft-delete all user-related data (no hard deletes to avoid foreign key issues)
            // Soft-delete bookmarks
            var bookmarks = bookmarkRepository.findByUserIdAndIsDeletedFalse(id);
            for (var bookmark : bookmarks) {
                bookmark.setIsDeleted(true);
                bookmarkRepository.save(bookmark);
            }

            // Soft-delete highlights
            var highlights = highlightRepository.findByUserIdAndIsDeletedFalse(id);
            for (var highlight : highlights) {
                highlight.setIsDeleted(true);
                highlightRepository.save(highlight);
            }

            // Soft-delete reading progress
            var readingProgress = readingProgressRepository.findByUserId(id);
            for (var progress : readingProgress) {
                progress.setIsDeleted(true);
                readingProgressRepository.save(progress);
            }

            // Soft-delete feedback
            var feedbacks = feedbackRepository.findByUserIdAndIsDeletedFalse(id);
            for (var feedback : feedbacks) {
                feedback.setIsDeleted(true);
                feedbackRepository.save(feedback);
            }

            // Soft-delete search history
            var searchHistories = searchHistoryRepository.findByUserIdAndIsDeletedFalse(id);
            for (var history : searchHistories) {
                history.setIsDeleted(true);
                searchHistoryRepository.save(history);
            }

            // Soft-delete all activity logs for this user
            var userLogs = activityLogRepository.findByUserIdAndIsDeletedFalse(id);
            for (var log : userLogs) {
                log.setIsDeleted(true);
                activityLogRepository.save(log);
            }

            // Finally soft-delete the user
            User target = targetOpt.get();
            target.setIsDeleted(true);
            userRepository.save(target);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }

    // DELETE - delete a book (admin only)
    @DeleteMapping("/books/{id}")
    public ResponseEntity<?> deleteBookAdmin(@PathVariable Long id, @RequestParam Long userId) {
        try {
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can delete books"));
            }

            // Ensure book exists
            if (bookRepository.findById(id).isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Book not found"));
            }

            bookService.deleteBook(id);
            return ResponseEntity.ok(Map.of("message", "Book deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete book: " + e.getMessage()));
        }
    }

    // PUT - reset user password (admin only)
    @PutMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id, @RequestParam Long userId, @RequestBody Map<String, String> body) {
        try {
            var opt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (opt.isEmpty() || !"ADMIN".equalsIgnoreCase(opt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can reset passwords"));
            }

            var targetOpt = userRepository.findById(id);
            if (targetOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            String newPassword = body.get("newPassword");
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Password cannot be empty"));
            }

            User target = targetOpt.get();
            target.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(target);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully");
            response.put("userId", String.valueOf(id));
            response.put("tempPassword", newPassword);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to reset password"));
        }
    }

    // ============ ADMIN ACCESS REQUESTS ============
    // These methods handle the Admin Code workflow.

    @Autowired
    private com.elibrary.repository.AdminAccessRequestRepository adminAccessRequestRepository;

    @Autowired
    private com.elibrary.service.EmailService emailService;

    // User Endpoint: Request admin access
    @PostMapping("/access-request")
    public ResponseEntity<?> requestAdminAccess(@RequestBody Map<String, String> body, @RequestParam Long userId) {
        try {
            var userOpt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.badRequest().body(Map.of("error", "You are already an admin"));
            }

            // Check if already pending or approved but code not used
            var existingOpt = adminAccessRequestRepository.findByUserIdAndStatus(userId, "PENDING");
            if (existingOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "You already have a pending request"));
            }

            var unverifiedApprovedOpt = adminAccessRequestRepository.findByUserIdAndStatus(userId, "APPROVED");
            if (unverifiedApprovedOpt.isPresent() && !unverifiedApprovedOpt.get().isCodeUsed()) {
                return ResponseEntity.badRequest().body(Map.of("error", "You have an approved request, check your email for the code"));
            }

            com.elibrary.model.AdminAccessRequest request = new com.elibrary.model.AdminAccessRequest();
            request.setUserId(user.getId());
            request.setUserEmail(user.getEmail());
            request.setUserName(user.getFullName());
            request.setReason(body.get("reason"));
            
            adminAccessRequestRepository.save(request);
            
            return ResponseEntity.ok(Map.of("message", "Admin access request submitted", "requestId", request.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to submit request"));
        }
    }

    // User Endpoint: Check current admin request
    @GetMapping("/my-access-request")
    public ResponseEntity<?> getMyAccessRequest(@RequestParam Long userId) {
        try {
            List<com.elibrary.model.AdminAccessRequest> requests = adminAccessRequestRepository.findByUserId(userId);
            if (requests.isEmpty()) {
                return ResponseEntity.ok(Map.of("hasRequest", false));
            }
            
            // Sort by createdAt desc
            requests.sort((a,b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            return ResponseEntity.ok(requests.get(0));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch request"));
        }
    }

    // User Endpoint: Verify Admin Code
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyAdminCode(@RequestBody Map<String, String> body, @RequestParam Long userId) {
        try {
            String adminCode = body.get("adminCode");
            if (adminCode == null || adminCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Admin code is required"));
            }

            var requestOpt = adminAccessRequestRepository.findByUserIdAndAdminCode(userId, adminCode);
            if (requestOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid Admin Code"));
            }

            com.elibrary.model.AdminAccessRequest request = requestOpt.get();
            if (request.isCodeUsed()) {
                return ResponseEntity.badRequest().body(Map.of("error", "This code has already been used"));
            }

            // Mark code as used
            request.setCodeUsed(true);
            adminAccessRequestRepository.save(request);

            // Change user role
            var userOpt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setRole("ADMIN");
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Success! You are now an Admin."));
            }
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to verify code: " + e.getMessage()));
        }
    }

    // Admin Endpoint: List pending
    @GetMapping("/access-requests")
    public ResponseEntity<?> getPendingRequests(@RequestParam Long userId) {
        try {
            var userOpt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (userOpt.isEmpty() || !"ADMIN".equalsIgnoreCase(userOpt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can view requests"));
            }
            
            return ResponseEntity.ok(adminAccessRequestRepository.findByStatus("PENDING"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch requests"));
        }
    }

    // Admin Endpoint: List all
    @GetMapping("/access-requests/all")
    public ResponseEntity<?> getAllRequests(@RequestParam Long userId) {
        try {
            var userOpt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (userOpt.isEmpty() || !"ADMIN".equalsIgnoreCase(userOpt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can view requests"));
            }
            
            return ResponseEntity.ok(adminAccessRequestRepository.findAllByOrderByCreatedAtDesc());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to fetch requests"));
        }
    }

    // Admin Endpoint: Approve Request
    @PutMapping("/access-requests/{requestId}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId, @RequestParam Long userId, @RequestBody(required=false) Map<String, String> body) {
        try {
            var adminOpt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (adminOpt.isEmpty() || !"ADMIN".equalsIgnoreCase(adminOpt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can approve requests"));
            }

            var requestOpt = adminAccessRequestRepository.findById(requestId);
            if (requestOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Request not found"));
            }

            com.elibrary.model.AdminAccessRequest request = requestOpt.get();
            if (!"PENDING".equals(request.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request is not PENDING"));
            }

            // Generate secure admin code
            String code = java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            request.setStatus("APPROVED");
            request.setAdminCode(code);
            request.setCodeUsed(false);
            request.setReviewedBy(userId);
            request.setReviewedAt(LocalDateTime.now());
            if (body != null && body.containsKey("adminNotes")) {
                request.setAdminNotes(body.get("adminNotes"));
            }

            adminAccessRequestRepository.save(request);

            // Send email
            try {
                emailService.sendAdminCodeEmail(request.getUserEmail(), request.getUserName(), code);
            } catch (Exception e) {
                // Return ok but mention email failed
                System.out.println("Email sending failed: " + e.getMessage());
                return ResponseEntity.ok(Map.of("message", "Request approved, but email failed to send. Code is: " + code));
            }

            return ResponseEntity.ok(Map.of("message", "Request approved and code sent to user's email"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to approve request"));
        }
    }

    // Admin Endpoint: Reject Request
    @PutMapping("/access-requests/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId, @RequestParam Long userId, @RequestBody Map<String, String> body) {
        try {
            var adminOpt = userRepository.findByIdAndIsDeletedFalse(userId);
            if (adminOpt.isEmpty() || !"ADMIN".equalsIgnoreCase(adminOpt.get().getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only admins can reject requests"));
            }

            var requestOpt = adminAccessRequestRepository.findById(requestId);
            if (requestOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Request not found"));
            }

            com.elibrary.model.AdminAccessRequest request = requestOpt.get();
            request.setStatus("REJECTED");
            request.setReviewedBy(userId);
            request.setReviewedAt(LocalDateTime.now());
            
            if (body != null && body.containsKey("adminNotes")) {
                request.setAdminNotes(body.get("adminNotes"));
            }

            adminAccessRequestRepository.save(request);
            return ResponseEntity.ok(Map.of("message", "Request rejected successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to reject request"));
        }
    }

}
