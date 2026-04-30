package com.elibrary.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "highlights")
public class Highlight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "book_id", nullable = false)
    private Long bookId;

    @Column(name = "page_number", nullable = false)
    private Integer pageNumber;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    public Highlight() {}

    public Highlight(Long userId, Long bookId, Integer pageNumber, String content, String color) {
        this.userId = userId;
        this.bookId = bookId;
        this.pageNumber = pageNumber;
        this.content = content;
        this.color = color;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public Integer getPageNumber() { return pageNumber; }
    public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
}
