# Professional Project Structure - Organized Architecture

## 📁 Recommended Frontend Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── App.js                          // Main app
│   ├── App.css
│   ├── index.js
│   │
│   ├── components/                     // Reusable components
│   │   ├── Header/
│   │   │   ├── Header.jsx
│   │   │   └── Header.module.css
│   │   ├── Footer/
│   │   │   ├── Footer.jsx
│   │   │   └── Footer.module.css
│   │   ├── Navigation/
│   │   │   ├── Navigation.jsx
│   │   │   └── Navigation.module.css
│   │   ├── ThemeToggle/
│   │   │   ├── ThemeToggle.jsx
│   │   │   └── ThemeToggle.module.css
│   │   │
│   │   ├── Stats/
│   │   │   ├── StatsCard.jsx
│   │   │   ├── StatsCard.module.css
│   │   │   ├── ReadingChart.jsx
│   │   │   └── ReadingChart.module.css
│   │   │
│   │   ├── Reader/
│   │   │   ├── HighlightBar.jsx
│   │   │   ├── HighlightBar.module.css
│   │   │   ├── NotesPanel.jsx
│   │   │   ├── NotesPanel.module.css
│   │   │   ├── ReadingPreferences.jsx
│   │   │   └── ReadingPreferences.module.css
│   │   │
│   │   ├── Books/
│   │   │   ├── BookCard.jsx
│   │   │   ├── BookCard.module.css
│   │   │   ├── BookGrid.jsx
│   │   │   ├── BookNotesView.jsx
│   │   │   ├── ReviewCard.jsx
│   │   │   └── ReviewCard.module.css
│   │   │
│   │   ├── Common/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.module.css
│   │   │   ├── Modal.jsx
│   │   │   ├── Modal.module.css
│   │   │   ├── Loading.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ErrorBoundary.module.css
│   │   │
│   │   └── index.js                   // Export all components
│   │
│   ├── pages/                          // Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Login.module.css
│   │   │   ├── Register.jsx
│   │   │   └── Register.module.css
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.module.css
│   │   │   ├── ActivityDashboard.jsx
│   │   │   └── ReadingStatsPage.jsx
│   │   │
│   │   ├── books/
│   │   │   ├── BooksPage.jsx
│   │   │   ├── BooksPage.module.css
│   │   │   ├── BookDetailPage.jsx
│   │   │   ├── BookDetailPage.module.css
│   │   │   ├── MyBooksPage.jsx
│   │   │   └── MyBooksPage.module.css
│   │   │
│   │   ├── reading/
│   │   │   ├── Reading.jsx
│   │   │   ├── Reading.module.css
│   │   │   ├── BookNotesView.jsx
│   │   │   └── BookNotesView.module.css
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── ProfilePage.module.css
│   │   │   ├── PreferencesPage.jsx
│   │   │   └── PreferencesPage.module.css
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── BookManagement.jsx
│   │   │   └── Analytics.jsx
│   │   │
│   │   ├── StartPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── index.js
│   │
│   ├── services/                       // API calls
│   │   ├── ActivityService.js
│   │   ├── BookService.js             // NEW
│   │   ├── UserService.js             // NEW
│   │   ├── StatsService.js            // NEW
│   │   ├── NotesService.js            // NEW
│   │   ├── AuthService.js             // NEW
│   │   ├── apiClient.js               // Base axios config
│   │   └── index.js
│   │
│   ├── context/                        // Global state
│   │   ├── ThemeContext.jsx            // NEW
│   │   ├── AuthContext.jsx             // Existing or NEW
│   │   ├── UserContext.jsx             // NEW
│   │   └── index.js
│   │
│   ├── hooks/                          // Custom React hooks
│   │   ├── useTheme.js                 // NEW
│   │   ├── useAuth.js                  // NEW
│   │   ├── useFetch.js                 // NEW
│   │   ├── useLocalStorage.js          // NEW
│   │   └── index.js
│   │
│   ├── utils/                          // Helper functions
│   │   ├── constants.js
│   │   ├── validators.js               // NEW
│   │   ├── formatters.js               // NEW (date, time, number)
│   │   ├── pdfGenerator.js             // NEW
│   │   ├── csvExporter.js              // NEW
│   │   ├── errorHandler.js             // NEW
│   │   └── index.js
│   │
│   ├── styles/                         // Global styles
│   │   ├── index.css                   // Global CSS
│   │   ├── theme.css                   // NEW - Dark/light theme
│   │   ├── typography.css              // NEW - Font styles
│   │   ├── animations.css              // NEW - Transitions
│   │   ├── responsive.css              // NEW - Mobile styles
│   │   └── variables.css               // NEW - CSS variables
│   │
│   ├── assets/                         // Images, icons, etc.
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   └── config/                         // Configuration
│       ├── apiConfig.js
│       ├── theme.config.js             // NEW
│       └── featureFlags.js             // NEW
│
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 📁 Recommended Backend Structure

```
backend/
├── src/main/java/com/elibrary/
│   │
│   ├── ElibraryBackendApplication.java
│   │
│   ├── config/                         // Configuration
│   │   ├── SecurityConfig.java
│   │   ├── WebConfig.java
│   │   ├── DataLoader.java
│   │   ├── CorsConfig.java
│   │   └── JpaConfig.java
│   │
│   ├── controller/                     // REST endpoints
│   │   ├── AuthController.java
│   │   ├── BookController.java
│   │   ├── ProgressController.java
│   │   ├── ActivityController.java
│   │   ├── StatsController.java        // NEW
│   │   ├── NotesController.java        // NEW
│   │   ├── ReviewController.java       // NEW
│   │   ├── UserController.java         // NEW
│   │   ├── AdminController.java        // NEW
│   │   └── HealthController.java       // NEW - API health check
│   │
│   ├── service/                        // Business logic
│   │   ├── AuthService.java
│   │   ├── BookService.java
│   │   ├── ProgressService.java
│   │   ├── ActivityService.java
│   │   ├── StatsService.java           // NEW
│   │   ├── NotesService.java           // NEW
│   │   ├── ReviewService.java          // NEW
│   │   ├── UserService.java            // NEW
│   │   ├── AdminService.java           // NEW
│   │   └── EmailService.java           // NEW (optional)
│   │
│   ├── repository/                     // Database access
│   │   ├── UserRepository.java
│   │   ├── BookRepository.java
│   │   ├── ReadingProgressRepository.java
│   │   ├── ActivityLogRepository.java
│   │   ├── ReadingStatsRepository.java // NEW
│   │   ├── BookHighlightRepository.java// NEW
│   │   ├── BookNoteRepository.java     // NEW
│   │   └── BookReviewRepository.java   // NEW
│   │
│   ├── model/                          // JPA entities
│   │   ├── User.java
│   │   ├── Book.java
│   │   ├── ReadingProgress.java
│   │   ├── ActivityLog.java
│   │   ├── ReadingStats.java           // NEW
│   │   ├── BookHighlight.java          // NEW
│   │   ├── BookNote.java               // NEW
│   │   ├── BookReview.java             // NEW
│   │   ├── ReadingStreak.java          // NEW
│   │   ├── UserPreferences.java        // NEW
│   │   └── DailyReadingLog.java        // NEW
│   │
│   ├── dto/                            // Data transfer objects
│   │   ├── request/
│   │   │   ├── LoginRequest.java
│   │   │   ├── RegisterRequest.java
│   │   │   ├── CreateBookRequest.java
│   │   │   ├── AddNoteRequest.java     // NEW
│   │   │   ├── CreateReviewRequest.java// NEW
│   │   │   └── UpdatePreferencesRequest.java // NEW
│   │   │
│   │   └── response/
│   │       ├── UserResponse.java
│   │       ├── BookResponse.java
│   │       ├── StatsResponse.java      // NEW
│   │       ├── NoteResponse.java       // NEW
│   │       └── ReviewResponse.java     // NEW
│   │
│   ├── exception/                      // Custom exceptions
│   │   ├── ResourceNotFoundException.java
│   │   ├── UnauthorizedException.java
│   │   ├── ValidationException.java    // NEW
│   │   ├── InvalidOperationException.java // NEW
│   │   ├── GlobalExceptionHandler.java // NEW
│   │   └── ErrorResponse.java          // NEW
│   │
│   ├── security/                       // Security
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetailsService.java
│   │
│   ├── util/                           // Utilities
│   │   ├── DateUtil.java
│   │   ├── ValidationUtil.java         // NEW
│   │   ├── PdfUtil.java                // NEW
│   │   ├── FileUtil.java               // NEW
│   │   └── LoggerUtil.java             // NEW
│   │
│   └── constants/                      // Constants
│       ├── ApiConstants.java
│       ├── ErrorMessages.java          // NEW
│       ├── SuccessMessages.java        // NEW
│       └── ValidationMessages.java     // NEW
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml             // NEW - Development config
│   ├── application-prod.yml            // NEW - Production config
│   ├── db/
│   │   ├── schema.sql
│   │   ├── migration/
│   │   │   ├── V1_initial_schema.sql
│   │   │   ├── V2_add_stats.sql        // NEW
│   │   │   └── V3_add_notes.sql        // NEW
│   │   └── data/
│   │       └── sample_data.sql
│   └── logging/
│       └── logback-spring.xml          // NEW
│
├── src/test/java/com/elibrary/
│   ├── controller/
│   │   ├── AuthControllerTest.java
│   │   └── BookControllerTest.java
│   ├── service/
│   │   ├── BookServiceTest.java
│   │   └── StatsServiceTest.java       // NEW
│   └── repository/
│       └── UserRepositoryTest.java
│
├── pom.xml
├── .gitignore
└── README.md
```

---

## 🗂️ Database Schema Organization

```sql
-- ==========================================
-- 1. User Management Tables
-- ==========================================
users
user_roles (if role-based)
user_preferences
user_reading_goals

-- ==========================================
-- 2. Book Management Tables
-- ==========================================
books
book_categories
book_tags
book_series (if applicable)
book_cover_images

-- ==========================================
-- 3. Reading Progress Tables
-- ==========================================
reading_progress
activity_logs
reading_statistics
reading_streaks
daily_reading_log

-- ==========================================
-- 4. Reader Engagement Tables
-- ==========================================
book_highlights
book_notes
bookmarks
reading_lists
reading_list_items

-- ==========================================
-- 5. Social Features Tables
-- ==========================================
book_reviews
book_ratings
user_reviews_helpful (reactions)

-- ==========================================
-- 6. Challenge & Gamification Tables
-- ==========================================
reading_challenges
user_challenge_progress
achievements
user_achievements

-- ==========================================
-- 7. Admin & Analytics Tables
-- ==========================================
system_logs
user_activity_analytics
book_analytics
report_exports
```

---

## 📋 Configuration Files

### `frontend/.env.example`
```
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_MAX_UPLOAD_SIZE=10485760
REACT_APP_SESSION_TIMEOUT=1800
REACT_APP_FEATURE_FLAGS_DARK_MODE=true
REACT_APP_FEATURE_FLAGS_NOTES=true
REACT_APP_FEATURE_FLAGS_STATS=true
```

### `backend/src/main/resources/application.yml`
```yaml
spring:
  application:
    name: elibrary-backend
  
  profiles:
    active: dev
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  
  datasource:
    url: jdbc:mysql://localhost:3306/elibrary_db
    username: root
    password: password

server:
  port: 8080
  servlet:
    context-path: /api
  compression:
    enabled: true

logging:
  level:
    root: INFO
    com.elibrary: DEBUG
```

---

## 🚀 Development Workflow

### Daily Development
1. **Start backend** → `mvn spring-boot:run`
2. **Start frontend** → `npm start`
3. **Check logs** → Backend logs + Browser console

### When Adding New Features
1. Create models/entities first
2. Create repositories
3. Create services
4. Create controllers
5. Create DTOs
6. Create frontend components
7. Create API service calls
8. Test thoroughly

### Before Committing
```bash
# Backend
mvn spotless:apply  # Format code
mvn test           # Run tests

# Frontend
npm run lint       # Check code style
npm test          # Run tests
```

---

## 📦 Dependencies Organization

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.0.0",
    "axios": "^1.0.0",
    "recharts": "^2.0.0",    // Charts
    "framer-motion": "^10.0.0", // Animations
    "react-quill": "^2.0.0"     // Rich text editor
  },
  "devDependencies": {
    "tailwindcss": "^3.0.0",
    "postcss": "^8.0.0"
  }
}
```

### Backend (pom.xml)
```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- PDF Generation -->
    <dependency>
        <groupId>com.itextpdf</groupId>
        <artifactId>itextpdf</artifactId>
        <version>5.5.13</version>
    </dependency>
    
    <!-- Logging -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-logging</artifactId>
    </dependency>
</dependencies>
```

---

## ✅ Code Standards

### Naming Conventions
- **Classes:** PascalCase (UserService, BookController)
- **Methods:** camelCase (getUserById, updateBookProgress)
- **Variables:** camelCase (userId, bookTitle)
- **Constants:** UPPER_SNAKE_CASE (MAX_PAGES, DEFAULT_TIMEOUT)
- **Files:** Match class name or folder/filename.jsx

### File Organization
- One class per file
- Group related methods together
- Keep files under 300 lines
- Use folders to organize logic

### Documentation
```javascript
/**
 * Fetches reading statistics for a user
 * @param {number} userId - The user ID
 * @returns {Promise<Stats>} User's reading statistics
 */
async function getReadingStats(userId) {
  // implementation
}
```

---

## 🎯 Quick Reference

```
NEW COMPONENTS NEEDED:
✓ ThemeToggle (enhance existing)
✓ StatsCard (enhance existing)
✓ ReadingChart
✓ ReadingStatsPage
✓ HighlightBar
✓ NotesPanel
✓ ReviewForm
✓ RatingStars

NEW SERVICES NEEDED:
✓ StatsService
✓ NotesService
✓ ReviewService
✓ UserService

NEW TABLES NEEDED:
✓ reading_statistics
✓ daily_reading_log
✓ book_highlights
✓ book_notes
✓ book_reviews
✓ reading_lists
✓ user_reading_goals

NEW STYLES NEEDED:
✓ theme.css (dark mode)
✓ animations.css (smooth transitions)
✓ responsive.css (mobile)
✓ typography.css (fonts)
```

This structure scales well and is professional-grade! 🚀

