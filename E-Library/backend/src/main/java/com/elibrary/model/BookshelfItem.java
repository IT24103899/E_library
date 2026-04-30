package com.elibrary.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookshelf_items")
public class BookshelfItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private String title;
    private String author;
    
    // Front-end sends string fields like 'emoji', 'genre', 'rating' etc
    private String emoji;
    private String genre;
    private Double rating;
    private String status;
    private Integer progress;
    
    @Column(name = "list_name")
    private String listName;
    
    @Column(name = "cover_image", columnDefinition = "TEXT")
    private String coverImage;
    
    @Column(name = "borrowed_at")
    private LocalDateTime borrowedAt;

    public BookshelfItem() {}

    public BookshelfItem(Long userId, String title, String author, String emoji, String genre, Double rating, String status, Integer progress, String listName, String coverImage) {
        this.userId = userId;
        this.title = title;
        this.author = author;
        this.emoji = emoji;
        this.genre = genre;
        this.rating = rating;
        this.status = status;
        this.progress = progress;
        this.listName = listName;
        this.coverImage = coverImage;
    }

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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getListName() {
        return listName;
    }

    public void setListName(String listName) {
        this.listName = listName;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public LocalDateTime getBorrowedAt() {
        return borrowedAt;
    }

    public void setBorrowedAt(LocalDateTime borrowedAt) {
        this.borrowedAt = borrowedAt;
    }
}
