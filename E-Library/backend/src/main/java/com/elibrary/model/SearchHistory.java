package com.elibrary.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_history")
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "search_query", nullable = false)
    private String searchQuery;

    @Column(name = "timestamp", nullable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime timestamp;

    @Column(name = "is_deleted", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isDeleted = false;

    public SearchHistory() {
        this.timestamp = LocalDateTime.now();
    }

    public SearchHistory(Long userId, String searchQuery) {
        this.userId = userId;
        this.searchQuery = searchQuery;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getSearchQuery() { return searchQuery; }
    public void setSearchQuery(String searchQuery) { this.searchQuery = searchQuery; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
}
