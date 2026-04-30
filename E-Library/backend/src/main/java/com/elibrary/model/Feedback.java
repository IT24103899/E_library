package com.elibrary.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank(message = "Feedback type is required")
    @Column(name = "type", nullable = false)
    private String type; // bug, feature, review

    @Column(name = "rating")
    private Integer rating; // 1-5 for review

    @NotBlank(message = "Feedback message is required")
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "status")
    private String status; // PENDING, REVIEWED, SOLVED

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    public Feedback() {}

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = "PENDING";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
}
