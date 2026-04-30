# E-Library VIVA Preparation Guide
## 7 Main Components - Complete Details for 7 Team Members

---

## PART 1: USER MANAGEMENT & AUTHENTICATION
**Team Member 1**

### Overview
Handles user registration, login, profile management, and role-based access control.

### Database Schema
```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,          -- Hashed password
  profile_picture_url VARCHAR(500),
  bio TEXT,
  reading_preference VARCHAR(100),
  role VARCHAR(50) DEFAULT 'USER',         -- USER, ADMIN
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at),
  INDEX idx_role (role)
);
```

### Validation Rules
✅ **Email Validation:**
- Must be unique in database
- Must follow email format (user@example.com)
- Cannot be null

✅ **Password Validation:**
- Minimum 8 characters
- Must contain uppercase, lowercase, numbers, special characters
- Cannot be same as previous passwords
- Stored as hashed (bcrypt/JWT)

✅ **Full Name Validation:**
- Cannot be empty
- Max 255 characters
- Only alphabets and spaces allowed

✅ **Role Validation:**
- Only "USER" or "ADMIN" allowed
- Default is "USER"

✅ **Profile Picture URL:**
- Must be valid URL format
- Optional field

### Involved Components
**Backend APIs:**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- GET `/api/users/{id}` - Get user profile
- PUT `/api/users/{id}` - Update user profile
- DELETE `/api/users/{id}` - Soft delete user

**Frontend Components:**
- Registration form
- Login form
- User profile page
- Profile edit modal

**Security Features:**
- JWT Token authentication
- Password hashing (bcrypt)
- Session management
- Role-based access control (RBAC)

### Key Features to Explain
1. How registration validates email uniqueness
2. How password is hashed and stored
3. How JWT token is generated after login
4. How soft delete works (is_deleted flag)
5. How role-based access is enforced
6. User session management
7. Profile update functionality

---

## PART 2: BOOK MANAGEMENT & CATALOG
**Team Member 2**

### Overview
Manages book inventory, catalog display, book details, and availability status.

### Database Schema
```sql
CREATE TABLE books (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  total_pages INT,
  cover_url VARCHAR(500),
  pdf_url LONGTEXT,
  isbn VARCHAR(20) UNIQUE,
  publication_year INT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  INDEX idx_title (title),
  INDEX idx_author (author),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
);
```

### Validation Rules
✅ **Title Validation:**
- Cannot be empty
- Max 255 characters
- Cannot have duplicate titles by same author

✅ **Author Validation:**
- Cannot be empty
- Max 255 characters

✅ **ISBN Validation:**
- Must be unique in database
- ISBN-10 or ISBN-13 format
- Optional field

✅ **Total Pages Validation:**
- Must be positive integer
- Cannot exceed 9999

✅ **Publication Year Validation:**
- Must be valid year (1000-2100)
- Cannot be in future

✅ **Category Validation:**
- Predefined categories only (Fiction, Science Fiction, Mystery, etc.)
- Cannot be null

✅ **PDF URL Validation:**
- Must be valid LONGTEXT (file path or URL)
- PDF must be accessible

✅ **is_available Flag:**
- Automatically managed by system
- TRUE = book can be borrowed
- FALSE = book not available

### Involved Components
**Backend APIs:**
- POST `/api/books` - Add new book (ADMIN only)
- GET `/api/books` - List all books
- GET `/api/books/{id}` - Get book details
- PUT `/api/books/{id}` - Update book (ADMIN)
- DELETE `/api/books/{id}` - Soft delete book (ADMIN)
- GET `/api/books/category/{category}` - Filter by category

**Frontend Components:**
- Book listing page
- Book detail page
- Book card component
- Admin book upload form

**Database Relationships:**
- One book → Many reading progress records
- One book → Many activity logs
- One book → Many bookshelf items
- One book → Many bookmarks
- One book → Many highlights

### Key Features to Explain
1. How book catalog is displayed
2. How filtering by category works
3. How PDF URLs are stored and managed
4. How ISBN uniqueness is enforced
5. How soft delete works for books
6. How availability status is tracked
7. Search indexing mechanism

---

## PART 3: READING PROGRESS TRACKING + SEARCH HISTORY (COMBINED)
**Team Member 3**

### Overview
Tracks user reading progress (page-by-page, percentage complete) and maintains user search query history.

### Database Schema

#### Reading Progress Table
```sql
CREATE TABLE reading_progress (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  current_page INT DEFAULT 0,
  total_pages INT,
  percentage_complete DOUBLE,
  last_read_at TIMESTAMP,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  version BIGINT DEFAULT 0 NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  UNIQUE KEY unique_user_book (user_id, book_id),
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id)
);
```

#### Search History Table
```sql
CREATE TABLE search_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  search_query VARCHAR(500) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_user_timestamp (user_id, timestamp)
);
```

### Validation Rules

**Reading Progress Validation:**
✅ **Current Page:**
- Must be >= 0
- Cannot exceed total_pages
- Must be integer

✅ **Total Pages:**
- Must be positive integer
- Must match book's total_pages

✅ **Percentage Complete:**
- Calculated as: (current_page / total_pages) * 100
- Range: 0-100
- Automatically calculated

✅ **Timestamps:**
- started_at: Auto-generated on first update
- last_read_at: Updated on every page change
- completed_at: Set only when 100% complete
- Must be in logical order (started < last_read < completed)

✅ **Version Control:**
- Prevents concurrent update conflicts
- Incremented on each update
- Must match on update

**Search History Validation:**
✅ **Search Query:**
- Cannot be null or empty
- Max 500 characters
- Trimmed whitespace
- Case-insensitive storage

✅ **Timestamp:**
- Auto-generated (CURRENT_TIMESTAMP)
- Must be recent for accuracy

✅ **User Association:**
- user_id must exist in users table
- Cannot delete user with active progress

### Involved Components
**Backend APIs:**
- POST `/api/reading-progress` - Start reading book
- PUT `/api/reading-progress/{id}` - Update progress
- GET `/api/reading-progress/user/{userId}` - Get all reading progress
- GET `/api/reading-progress/user/{userId}/book/{bookId}` - Get specific progress
- GET `/api/search-history/user/{userId}` - Get user's search history
- POST `/api/search-history` - Save search query
- DELETE `/api/search-history/{id}` - Delete search history

**Frontend Components:**
- Reading progress bar
- Page number input
- Progress percentage display
- Search history dropdown
- Recent searches list

**Relationships & Dependencies:**
- tied to `users` table (one user → many progressions)
- tied to `books` table (one book → many progressions)
- tied to `activity_logs` (progress updates trigger activity logs)

### Key Features to Explain
1. How current page is validated against total pages
2. How percentage complete is automatically calculated
3. How version control prevents concurrent updates
4. How timestamps track reading timeline
5. How search history stores all user searches
6. How search history helps with recommendations
7. How completion status is determined (100% complete or completed_at set)
8. Soft delete mechanism for both tables

---

## PART 4: ADVANCED SEARCH FEATURE
**Team Member 4**

### Overview
Implements intelligent search using AI ranking model to find books by title, author, description with smart relevance scoring.

### Database Schema
Uses existing `books` table with optimized indexes:
```sql
INDEX idx_title (title),
INDEX idx_author (author),
INDEX idx_category (category),
INDEX idx_created_at (created_at)
```

### Validation Rules
✅ **Search Query Validation:**
- Minimum 1 character
- Maximum 500 characters
- Trim whitespace
- Case-insensitive search
- Handle special characters (escape for SQL injection prevention)

✅ **Search Type Validation:**
- Allowed types: TITLE, AUTHOR, DESCRIPTION, CATEGORY, ALL
- Default: ALL (searches all fields)

✅ **Results Limit:**
- Minimum 1, Maximum 100 results
- Default 20 results

✅ **Ranking Score:**
- Must be numeric (0-100)
- Higher = more relevant
- Calculated by AI model

### Involved Components
**Backend APIs:**
- GET `/api/search?query={query}` - Global search
- GET `/api/search?query={query}&type=TITLE` - Search by title
- GET `/api/search?query={query}&type=AUTHOR` - Search by author
- GET `/api/search?query={query}&limit={n}` - Limit results
- GET `/api/search/suggestions?query={query}` - Auto-complete suggestions

**AI Ranking Model:**
- Location: `Python-ranker/book_vibe_model.joblib`
- Uses: `book.csv` for training data
- Indexes: `books.index` for fast retrieval
- Features ranked:
  - Title relevance (highest weight)
  - Author relevance
  - Description relevance
  - Category match
  - Popularity score
  - User rating/feedback

**Search Components:**
- `create_index.py` - Build search index
- `advanced_app.py` - Advanced search engine
- Search bar in frontend
- Results display with relevance scores

**Database Integration:**
- Searches across `books` table
- Considers `is_deleted = FALSE`
- Considers `is_available = TRUE`
- Links to `bookshelf_items` for user interaction tracking

### Key Features to Explain
1. How search query is tokenized and processed
2. How AI model ranks results by relevance
3. How fuzzy matching handles typos
4. How search history helps improve future searches
5. How category filtering works with search
6. How result ranking factors (title weight > author > description)
7. How search suggestions use autocomplete
8. Performance optimization with indexes
9. SQL injection prevention measures
10. Case-insensitive search implementation

---

## PART 5: BOOKSHELF MANAGEMENT
**Team Member 5**

### Overview
Allows users to create personalized collections of books with custom lists, ratings, and progress tracking.

### Database Schema
```sql
CREATE TABLE bookshelf_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(255),
  author VARCHAR(255),
  emoji VARCHAR(50),
  genre VARCHAR(100),
  rating DOUBLE DEFAULT 0,
  status VARCHAR(50),                     -- Want to Read, Reading, Completed
  progress INT DEFAULT 0,                 -- Percentage 0-100
  list_name VARCHAR(100) DEFAULT 'favourites',
  cover_image LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_list_name (list_name),
  INDEX idx_created_at (created_at)
);
```

### Validation Rules
✅ **Title & Author:**
- Cannot be null
- Max 255 characters each

✅ **Emoji:**
- Single emoji character
- Used for visual representation
- Max 50 characters (UTF-8)

✅ **Genre:**
- Predefined genres only
- Cannot be empty

✅ **Rating:**
- Range: 0.0 to 5.0
- Default: 0.0
- Decimal with 1 place (0.5, 3.5, 5.0)

✅ **Status:**
- Only: "Want to Read", "Reading", "Completed"
- Default: "Want to Read"
- Cannot be null

✅ **Progress:**
- Integer percentage
- Range: 0-100
- Auto-synced with reading_progress table

✅ **List Name:**
- Predefined: "favourites", "reading", "read", "wishlist"
- Default: "favourites"
- Max 100 characters

✅ **Cover Image:**
- Must be valid image URL or base64
- LONGTEXT format

✅ **Timestamps:**
- created_at: Auto-generated
- updated_at: Auto-updated on changes

### Involved Components
**Backend APIs:**
- POST `/api/bookshelf` - Add book to bookshelf
- GET `/api/bookshelf/user/{userId}` - Get user's bookshelf
- GET `/api/bookshelf/list/{listName}` - Get specific list
- PUT `/api/bookshelf/{id}` - Update bookshelf item
- DELETE `/api/bookshelf/{id}` - Remove from bookshelf
- GET `/api/bookshelf/stats/{userId}` - Get reading stats

**Frontend Components:**
- Bookshelf page
- Custom list creation
- Book card with status/rating
- Drag-and-drop between lists
- Progress visualizer

**Relationships:**
- One user → Many bookshelf items
- Links to `books` table (if book exists)
- Syncs with `reading_progress` table
- Syncs with `activity_logs` table

### Key Features to Explain
1. How users create custom lists
2. How status changes affect reading flow
3. How rating is saved and displayed
4. How progress syncs with reading_progress
5. How bookshelf items can be books or custom entries
6. How lists help organize reading goals
7. How statistics are calculated (total books, reading, completed)
8. Soft delete vs permanent removal
9. How permissions control who sees bookshelf
10. Export/import bookshelf functionality

---

## PART 6: BOOKMARKS & HIGHLIGHTS
**Team Member 6**

### Overview
Enables users to bookmark specific pages and highlight important text within books for later reference.

### Database Schema

#### Bookmarks Table
```sql
CREATE TABLE bookmarks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  page_number INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id),
  INDEX idx_created_at (created_at)
);
```

#### Highlights Table
```sql
CREATE TABLE highlights (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  page_number INT NOT NULL,
  content TEXT,
  color VARCHAR(50),                      -- yellow, green, blue, pink
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(id),
  INDEX idx_user_id (user_id),
  INDEX idx_book_id (book_id),
  INDEX idx_created_at (created_at)
);
```

### Validation Rules

**Bookmarks Validation:**
✅ **Page Number:**
- Must be positive integer
- Cannot exceed book's total_pages
- Must exist in reading progress

✅ **User-Book Relationship:**
- User must own/be reading the book
- No duplicate bookmarks on same page (optional)

✅ **Timestamp:**
- Auto-generated
- Cannot be in future

**Highlights Validation:**
✅ **Page Number:**
- Must be positive integer
- Cannot exceed book's total_pages

✅ **Content:**
- Cannot be empty
- Max 5000 characters (quote length)
- Trimmed whitespace

✅ **Color:**
- Only: "yellow", "green", "blue", "pink"
- Default: "yellow"
- Used for visual categorization

✅ **User Permission:**
- Only owner can create/edit highlight
- Cannot highlight on books not reading

### Involved Components
**Backend APIs:**
- POST `/api/bookmarks` - Add bookmark
- GET `/api/bookmarks/user/{userId}/book/{bookId}` - Get bookmarks
- DELETE `/api/bookmarks/{id}` - Remove bookmark
- POST `/api/highlights` - Add highlight
- GET `/api/highlights/user/{userId}/book/{bookId}` - Get highlights
- PUT `/api/highlights/{id}` - Update highlight
- DELETE `/api/highlights/{id}` - Delete highlight
- GET `/api/highlights/user/{userId}` - Get all user highlights

**Frontend Components:**
- Bookmark button in PDF viewer
- Highlight toolbar with color picker
- Bookmarks sidebar
- Highlights collection page
- Notes attachment to highlights (future feature)

**Relationships:**
- One user → Many bookmarks/highlights
- One book → Many bookmarks/highlights
- Must verify user reading access

### Key Features to Explain
1. How page number is validated
2. How highlights are stored with text content
3. How color categorization works
4. How to fetch all bookmarks for a book
5. How page-jumping from bookmarks works
6. How highlights are exported/shared
7. How permissions prevent unauthorized access
8. How duplicates are handled
9. Search functionality within highlights
10. Analytics on most highlighted passages

---

## PART 7: FEEDBACK SYSTEM
**Team Member 7**

### Overview
Collects user feedback for bugs, feature requests, and book reviews to improve the platform and content.

### Database Schema
```sql
CREATE TABLE feedbacks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  type VARCHAR(50) NOT NULL COMMENT 'bug, feature, review',
  rating INT DEFAULT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING' COMMENT 'PENDING, REVIEWED, SOLVED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### Validation Rules
✅ **Feedback Type:**
- Only: "bug", "feature", "review"
- Required field
- Case-insensitive input handling

✅ **Message:**
- Cannot be empty
- Min 5 characters
- Max 5000 characters
- Trimmed whitespace
- HTML/script tags sanitized

✅ **Rating (for reviews):**
- Range: 1-5 (integer)
- Required for type="review"
- Optional for type="bug" or type="feature"

✅ **Status:**
- Values: "PENDING", "REVIEWED", "SOLVED"
- Default: "PENDING"
- Only ADMIN can change status

✅ **User ID:**
- Optional (anonymous feedback allowed)
- If provided, must exist in users table

✅ **Timestamp:**
- Auto-generated on creation
- Cannot be modified

### Involved Components
**Backend APIs:**
- POST `/api/feedback` - Submit feedback
- GET `/api/feedback/user/{userId}` - Get user's feedback
- GET `/api/feedback/admin` - Get all feedback (ADMIN)
- PUT `/api/feedback/{id}/status` - Update status (ADMIN)
- DELETE `/api/feedback/{id}` - Delete feedback (ADMIN)
- GET `/api/feedback/stats` - Feedback statistics (ADMIN)
- GET `/api/feedback/by-type/{type}` - Filter by type (ADMIN)

**Frontend Components:**
- Feedback form modal
- Feedback submission page
- Admin feedback dashboard
- Feedback statistics
- Notification for status changes

**Admin Dashboard Features:**
- View all feedback
- Filter by type (bug/feature/review)
- Filter by status (pending/reviewed/solved)
- Mark as solved
- Respond to feedback (future)
- Analytics on feedback trends

### Key Features to Explain
1. How anonymous feedback is handled
2. How rating is optional based on type
3. How feedback type affects workflow
4. How status transitions work (permissions)
5. How input sanitization prevents XSS
6. How admin dashboard filters feedback
7. How statistics help identify issues
8. How feedback triggers notifications
9. How feedback data is archived
10. Privacy considerations for user feedback

---

## SUMMARY TABLE FOR QUICK REFERENCE

| Part | Team Member | Main Tables | Key Validation | APIs Count |
|------|-------------|-------------|-----------------|-----------|
| 1. User Management | Member 1 | users | Email, Password, Role | 6 |
| 2. Book Management | Member 2 | books | Title, ISBN, Category | 6 |
| 3. Progress + Search | Member 3 | reading_progress, search_history | Page, Percentage, Query | 7 |
| 4. Advanced Search | Member 4 | books (indexes) | Query, Limit, Type | 3 |
| 5. Bookshelf | Member 5 | bookshelf_items | Status, Rating, Progress | 6 |
| 6. Bookmarks & Highlights | Member 6 | bookmarks, highlights | Page, Content, Color | 8 |
| 7. Feedback | Member 7 | feedbacks | Type, Message, Rating | 7 |

---

## TIPS FOR VIVA PRESENTATION

### General Tips:
1. **Know your schema** - Be ready to draw ER diagrams
2. **Understand validation** - Explain WHY each validation exists
3. **API flow** - Walk through request-response cycle
4. **Database relationships** - Explain FOREIGN KEY constraints
5. **Error handling** - What happens with invalid data?
6. **Security** - How is data protected?
7. **Performance** - Why are indexes used?
8. **User experience** - How does this feature help users?

### Common VIVA Questions:
- "What happens if validation fails?"
- "How do you prevent SQL injection?"
- "How is data consistency maintained?"
- "What about concurrent access?"
- "How would you scale this feature?"
- "What are potential bottlenecks?"
- "How do you handle edge cases?"

### Be Ready To:
- Draw database diagrams
- Trace an API request end-to-end
- Explain validation rules in detail
- Discuss performance optimizations
- Explain security measures
- Handle follow-up questions

---

**Good Luck for Your VIVA! 🎓**
