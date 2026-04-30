package com.elibrary.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String password;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "reading_preference")
    private String readingPreference;

    @Column(name = "role")
    private String role;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "is_premium")
    private Boolean isPremium = false;

    @Column(name = "premium_expires_at")
    private LocalDateTime premiumExpiresAt;

    @Column(name = "subscription_plan")
    private String subscriptionPlan;

    // Constructors
    public User() {
    }

    public User(String email, String fullName, String password) {
        this.email = email;
        this.fullName = fullName;
        this.password = password;
    }

    public User(Long id, String email, String fullName, String password, String profilePictureUrl, String bio, String readingPreference, LocalDateTime createdAt, LocalDateTime updatedAt, Boolean isDeleted, Boolean isPremium) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.password = password;
        this.profilePictureUrl = profilePictureUrl;
        this.bio = bio;
        this.readingPreference = readingPreference;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isDeleted = isDeleted;
        this.isPremium = isPremium;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getReadingPreference() {
        return readingPreference;
    }

    public void setReadingPreference(String readingPreference) {
        this.readingPreference = readingPreference;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Boolean getIsPremium() {
        return isPremium;
    }

    public void setIsPremium(Boolean isPremium) {
        this.isPremium = isPremium;
    }

    public LocalDateTime getPremiumExpiresAt() {
        return premiumExpiresAt;
    }

    public void setPremiumExpiresAt(LocalDateTime premiumExpiresAt) {
        this.premiumExpiresAt = premiumExpiresAt;
    }

    public String getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(String subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }
}
