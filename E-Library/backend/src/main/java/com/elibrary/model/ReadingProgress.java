package com.elibrary.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reading_progress")
public class ReadingProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @Column(name = "current_page")
    private Integer currentPage;

    @Column(name = "total_pages")
    private Integer totalPages;

    @Column(name = "percentage_complete")
    private Double percentageComplete;

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Version
    @Column(name = "version")
    private Long version = 0L;

    // Constructors
    public ReadingProgress() {
    }

    public ReadingProgress(Long userId, Long bookId) {
        this.userId = userId;
        this.bookId = bookId;
    }

    public ReadingProgress(Long id, Long userId, Long bookId, Integer currentPage, Integer totalPages, Double percentageComplete, LocalDateTime lastReadAt, LocalDateTime startedAt, LocalDateTime completedAt, Boolean isDeleted) {
        this.id = id;
        this.userId = userId;
        this.bookId = bookId;
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.percentageComplete = percentageComplete;
        this.lastReadAt = lastReadAt;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
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

    public Integer getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(Integer currentPage) {
        this.currentPage = currentPage;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Double getPercentageComplete() {
        return percentageComplete;
    }

    public void setPercentageComplete(Double percentageComplete) {
        this.percentageComplete = percentageComplete;
    }

    public LocalDateTime getLastReadAt() {
        return lastReadAt;
    }

    public void setLastReadAt(LocalDateTime lastReadAt) {
        this.lastReadAt = lastReadAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }
}
