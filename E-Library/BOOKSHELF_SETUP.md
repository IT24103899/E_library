# Bookshelf API Setup Guide

## Problem
The `GET /api/bookshelf/all` endpoint was returning 404 errors because the database table wasn't properly initialized.

## Solution

### Step 1: Initialize Database Table
Run the provided SQL script to create/reinitialize the bookshelf table:

```sql
mysql -u root -p"Bharana@2004" elibrary_db < database/init_bookshelf.sql
```

Alternatively, in MySQL Workbench:
1. Open `database/init_bookshelf.sql`
2. Execute all queries

### Step 2: Verify Backend Compilation
The backend code has been updated with:
- Enhanced error handling in BookshelfController
- Validation in BookshelfService (default values, null checks)
- Detailed logging for debugging

Build the backend:
```bash
cd E-Library/backend
mvn clean install
```

### Step 3: Restart Backend & Frontend
1. Stop the current backend (if running)
2. Restart both services:
   ```bash
   npm start  # Frontend - port 3000
   mvn spring-boot:run  # Backend - port 8080
   ```

### Step 4: Test Endpoints

**Test Bookshelf Retrieval:**
```bash
curl -X GET "http://localhost:8080/api/bookshelf/all?userId=1" \
  -H "Content-Type: application/json"
```

**Test Add to Bookshelf:**
```bash
curl -X POST "http://localhost:8080/api/bookshelf/add" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "title": "Test Book",
    "author": "Test Author",
    "emoji": "📚",
    "genre": "Fiction",
    "rating": 0,
    "status": "new",
    "progress": 0,
    "listName": "favourites",
    "coverImage": ""
  }'
```

## Changes Made

### Backend Updates:
1. **BookshelfController.java**
   - Enhanced `/all` endpoint with detailed logging
   - Better error messages for userId validation
   - Proper HTTP status codes and responses

2. **BookshelfService.java**
   - Added validation in `addToBookshelf()` method
   - Sets default values if missing (rating, progress, status, listName)
   - Throws IllegalArgumentException for invalid userId

3. **Response DTOs** (New files)
   - `ErrorResponse.java` - Standardized error responses
   - `SuccessResponse.java` - Standardized success responses

### Frontend Updates:
1. **Bookshelf.jsx**
   - Added array validation to prevent "map is not a function" errors
   - Better error handling and user feedback
   - Proper null checks before processing

## Debugging

If issues persist, check:
1. **Backend logs** - Check console output for detailed error messages
2. **Database connection** - Verify MySQL is running and accessible
3. **Table existence** - Run: `SHOW TABLES IN elibrary_db;`
4. **User records** - Run: `SELECT * FROM users;` (ensure users exist)

## API Endpoints

All bookshelf endpoints require `userId` parameter:

| Method | Endpoint | Parameter | Description |
|--------|----------|-----------|-------------|
| GET | `/api/bookshelf/all` | userId | Get all books for user |
| POST | `/api/bookshelf/add` | (JSON body) | Add book to bookshelf |
| DELETE | `/api/bookshelf/remove/{id}` | id | Remove specific book |
| PUT | `/api/bookshelf/move/{id}` | targetList | Move book to another list |
| DELETE | `/api/bookshelf/clear/{listName}` | listName, userId | Clear entire list |
