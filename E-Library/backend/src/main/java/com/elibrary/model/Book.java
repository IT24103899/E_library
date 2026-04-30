package com.elibrary.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "total_pages")
    private Integer totalPages;

    @Column(name = "cover_url")
    private String coverUrl;

    @Column(name = "pdf_url", columnDefinition = "LONGTEXT")
    private String pdfUrl;

    @Column(name = "isbn")
    private String isbn;

    @Column(name = "publication_year")
    private Integer publicationYear;

    @Column(name = "category")
    private String category;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    // Constructors
    public Book() {
    }

    public Book(String title, String author) {
        this.title = title;
        this.author = author;
    }

    public Book(Long id, String title, String author, String description, String content, Integer totalPages, String coverUrl, String pdfUrl, String isbn, Integer publicationYear, String category, LocalDateTime createdAt, Boolean isDeleted, Boolean isAvailable) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.description = description;
        this.content = content;
        this.totalPages = totalPages;
        this.coverUrl = coverUrl;
        this.pdfUrl = pdfUrl;
        this.isbn = isbn;
        this.publicationYear = publicationYear;
        this.category = category;
        this.createdAt = createdAt;
        this.isDeleted = isDeleted;
        this.isAvailable = isAvailable;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public Integer getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(Integer publicationYear) {
        this.publicationYear = publicationYear;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
}
