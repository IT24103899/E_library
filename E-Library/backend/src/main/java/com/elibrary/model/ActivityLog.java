package com.elibrary.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @Column(name = "action", nullable = false)
    private String action; // BORROW, START, PAUSE, COMPLETE, RETURN

    @Column(name = "current_page")
    private Integer currentPage;

    @Column(name = "time_spent_minutes")
    private Integer timeSpentMinutes;

    @Column(name = "high_interest")
    private Boolean highInterest = false;

    @Column(name = "timestamp")
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    // Constructors
    public ActivityLog() {
    }

    public ActivityLog(Long userId, Long bookId, String action) {
        this.userId = userId;
        this.bookId = bookId;
        this.action = action;
    }

    public ActivityLog(Long id, Long userId, Long bookId, String action, Integer currentPage, Integer timeSpentMinutes, Boolean highInterest, LocalDateTime timestamp, Boolean isDeleted) {
        this.id = id;
        this.userId = userId;
        this.bookId = bookId;
        this.action = action;
        this.currentPage = currentPage;
        this.timeSpentMinutes = timeSpentMinutes;
        this.highInterest = highInterest;
        this.timestamp = timestamp;
        this.isDeleted = isDeleted;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Integer getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(Integer currentPage) {
        this.currentPage = currentPage;
    }

    public Integer getTimeSpentMinutes() {
        return timeSpentMinutes;
    }

    public void setTimeSpentMinutes(Integer timeSpentMinutes) {
        this.timeSpentMinutes = timeSpentMinutes;
    }

    public Boolean getHighInterest() {
        return highInterest;
    }

    public void setHighInterest(Boolean highInterest) {
        this.highInterest = highInterest;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
}
