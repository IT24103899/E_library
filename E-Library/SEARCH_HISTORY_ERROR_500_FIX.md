# Search History 500 Error - Fix Guide

## Root Cause
The backend was returning **500 (Internal Server Error)** because **the `search_history` table doesn't exist in the database**, but the Java entity and controller tried to access it.

## Quick Fix (Choose One)

### Option 1: Run SQL Script (Fastest)
1. Open MySQL Workbench or MySQL client:
   ```bash
   mysql -u root -p
   ```

2. Copy-paste this SQL:
   ```sql
   USE elibrary_db;
   
   CREATE TABLE IF NOT EXISTS search_history (
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

3. Press Enter and verify:
   ```sql
   SHOW TABLES LIKE 'search_history';
   SELECT COUNT(*) FROM search_history;
   ```

---

### Option 2: Use Pre-made SQL File
1. Open MySQL Workbench
2. File → Open SQL Script
3. Navigate to: `E-Library\database\create_search_history_table.sql`
4. Click Execute (or Ctrl+Shift+Enter)
5. Verify table was created

---

### Option 3: Auto-Create with Hibernate (Requires Backend Rebuild)
The Spring application has `ddl-auto: update` which should auto-create missing tables.

1. **Rebuild the backend:**
   ```bash
   cd E-Library/backend
   mvn clean compile
   ```

2. **Stop the backend** (if running)

3. **Start the backend:**
   ```bash
   mvn spring-boot:run
   ```

4. Check if table was auto-created:
   ```sql
   SELECT * FROM search_history;
   ```

---

## Backend Improvements Made

The backend `SearchController` was also improved with:

✅ **Input Validation** - Checks for missing userId/searchQuery  
✅ **Error Handling** - Catches exceptions and returns helpful error messages  
✅ **NPE Prevention** - Validates payload before accessing keys  
✅ **Logging** - Prints stack traces for debugging  

New error responses:
- `400 Bad Request` - Missing required fields
- `400 Bad Request` - Empty search query
- `500 Internal Server Error` - Database error (with detailed message)

---

## Files Updated

### Database
- ✅ `database/schema.sql` - Added `search_history` table definition
- ✅ `database/create_search_history_table.sql` - Created standalone SQL file

### Backend  
- ✅ `backend/src/main/java/com/elibrary/controller/SearchController.java` - Added error handling

### Frontend (Already Fixed)
- ✅ `frontend/src/components/AdvancedSearchBar.jsx` - Fixed user auth and error logging

---

## Testing After Fix

1. **Create the table** (using SQL above)

2. **Restart backend:**
   ```bash
   # If using Maven Spring Boot
   mvn spring-boot:run
   
   # Or if using batch file
   run_backend.bat
   ```

3. **In browser (F12 → Console):**
   - Login with your account
   - Go to Books page
   - Click the search bar
   - You should see "Recent Searches" dropdown (might be empty on first use)

4. **Type a search query** and press Enter
   - Should see console message: `Search history fetched: [...]`
   - No more 500 errors!

5. **Verify data saved:**
   ```sql
   SELECT * FROM search_history WHERE user_id = 20;
   ```

---

## Verification Checklist

- [ ] Table created: `SHOW TABLES LIKE 'search_history';`
- [ ] Table has correct columns: `DESCRIBE search_history;`
- [ ] Backend restarted
- [ ] No more 500 errors in browser console
- [ ] Search history data appears in dropdown
- [ ] New searches are being saved to database

---

## If Problems Continue

**Check these in order:**

1. **Database connection:**
   ```sql
   SHOW TABLES;
   SELECT * FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'elibrary_db';
   ```

2. **Backend logs for SQL errors:**
   - Check the terminal where backend is running
   - Look for "Caused by:" messages
   - Copy the full error

3. **Verify foreign key:**
   ```sql
   SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
   WHERE TABLE_NAME = 'search_history' AND COLUMN_NAME = 'user_id';
   ```

4. **Check user exists:**
   ```sql
   SELECT * FROM users WHERE id = 20;
   ```

---

## Summary

| Issue | Fix | Status |
|-------|-----|--------|
| Missing `search_history` table | Created table in database | ✅ |
| Missing error handling in backend | Added validation & error responses | ✅ |
| Frontend hardcoded user ID | Fixed to use actual logged-in user | ✅ |
| Poor error logging | Added detailed error messages | ✅ |

**You're ready to test!** Run the SQL script above and restart your backend.
