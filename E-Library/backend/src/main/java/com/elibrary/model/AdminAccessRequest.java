package com.elibrary.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_access_requests")
public class AdminAccessRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "reason", columnDefinition = "LONGTEXT")
    private String reason;

    @Column(name = "admin_notes", columnDefinition = "LONGTEXT")
    private String adminNotes;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "admin_code")
    private String adminCode;

    @Column(name = "code_used", columnDefinition = "boolean default false")
    private boolean codeUsed;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    public AdminAccessRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public Long getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(Long reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getAdminCode() { return adminCode; }
    public void setAdminCode(String adminCode) { this.adminCode = adminCode; }

    public boolean isCodeUsed() { return codeUsed; }
    public void setCodeUsed(boolean codeUsed) { this.codeUsed = codeUsed; }
}
