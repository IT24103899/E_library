# Reading Progress Update - Debugging Guide

## Quick Steps to Verify the Issue

### Step 1: Check Database Schema
Run this in your MySQL client:
```sql
-- Check if version column exists
DESC elibrary_db.reading_progress;
```

Expected output should include:
```
version | bigint | NO | | 0 |
```

If the `version` column is missing, run:
```sql
ALTER TABLE elibrary_db.reading_progress 
ADD COLUMN version BIGINT DEFAULT 0 NOT NULL;
```

---

### Step 2: Check Backend Logs
1. **Open the Backend Terminal** in VS Code
2. **Look for this pattern** when you save a reading page:
   ```
   ================================================================================
   PUT /progress API CALLED
     userId=1, bookId=1, currentPage=5, totalPages=300
   ================================================================================
   [Attempt 1] Calling progressService.updateProgress()
   Updating progress for userId=1, bookId=1, currentPage=5, totalPages=300
   Found existing progress record with version=0, currentPage=0
   Updating currentPage from 0 to 5
   Saving progress: percentageComplete=1.66, lastReadAt=...
   SUCCESS - Progress saved to database
     Response - id=1, currentPage=5, totalPages=300, version=1
   ================================================================================
   ```

**If you DON'T see this output:**
- The API endpoint is not being called
- Check browser Developer Tools (F12) → Network tab

**If you see an ERROR:**
- Check the exception message
- Common errors: "version column not found" (run the ALTER TABLE above)

---

### Step 3: Check Browser Network Requests
1. **Open Browser DevTools** (Press F12)
2. **Go to Network tab**
3. **Open a book and change pages**
4. **Look for** a PUT request to `/api/progress`

Expected Request:
```
PUT http://localhost:8080/api/progress?userId=1&bookId=1&currentPage=5&totalPages=300
```

Expected Response (200 OK):
```json
{
  "id": 1,
  "userId": 1,
  "bookId": 1,
  "currentPage": 5,
  "totalPages": 300,
  "percentageComplete": 1.66,
  "lastReadAt": "2026-03-17T10:30:45",
  "version": 1
}
```

**If request is NOT sent:**
- Frontend is not calling the API
- Check Reading.jsx `handleAutoSave()` function
- Verify browser console (F12 → Console) for errors

**If request returns ERROR:**
- Check Status Code: 
  - `409` = Conflict (concurrency issue)
  - `500` = Server error (check backend logs)

---

### Step 4: Check Database Records
Open MySQL client and run:
```sql
-- Check the actual data in reading_progress table
SELECT id, user_id, book_id, current_page, total_pages, 
       last_read_at, version
FROM elibrary_db.reading_progress 
WHERE user_id = 1 
ORDER BY last_read_at DESC;
```

**Expected output after saving page 5:**
```
| id | user_id | book_id | current_page | total_pages | last_read_at        | version |
|----|---------|---------|--------------|-------------|---------------------|---------|
| 1  | 1       | 1       | 5            | 300         | 2026-03-17 10:30:45 | 1       |
```

**If current_page is 0 or NULL:**
- Data is NOT being saved from the API
- Issue is in backend service

**If last_read_at is old:**
- API is not being called
- Issue is in frontend

---

## Common Issues & Solutions

### Issue 1: "version column not found"
**Error in logs:**
```
Column 'version' doesn't exist
```
**Solution:**
```sql
ALTER TABLE elibrary_db.reading_progress 
ADD COLUMN version BIGINT DEFAULT 0 NOT NULL;
```

---

### Issue 2: API not being called
**Symptom:** Network tab shows NO PUT request to `/api/progress`

**Debugging:**
1. Open browser console (F12 → Console)
2. You should see logs like: `[AutoSave] Saving: userId=1, bookId=1, currentPage=5`
3. If you DON'T see these logs, the `handleAutoSave()` function is not being triggered

**Check in Reading.jsx:**
```javascript
console.log('[AutoSave] Saving: userId=...'); // Should appear in console
```

**Possible causes:**
- `savingInProgressRef.current` is true (already saving)
- `currentPage !== lastSavedPage` is false (no page change detected)
- `book` is null (book data not loaded)

---

### Issue 3: API called but data not saved to DB
**Symptom:** 
- Network tab shows successful 200 response
- But database still shows `current_page = 0`

**Debugging:**
- Check backend logs for the success message
- If logs show "SUCCESS" but DB doesn't update, there's a transaction issue
- Run:
```sql
SELECT * FROM elibrary_db.reading_progress WHERE id = 1;
-- Check if last_read_at timestamp is recent
```

**Possible causes:**
- Database connection pool issue
- Transaction rollback (check for exceptions)
- Foreign key constraint violation

---

## Complete Testing Flow

### Step 1: Prepare
1. Close and reopen the book reading page
2. Make sure backend is running (check for no errors)
3. Open browser DevTools (F12)

### Step 2: Test Save
1. Read a few pages (go to page 5, 10, 15, etc.)
2. **Wait 2-3 seconds** (debounce timeout)
3. Check these in order:
   - ✅ Browser Console → See `[AutoSave] Saving...` message
   - ✅ Network Tab → See PUT request to `/api/progress?...`
   - ✅ Backend Logs → See `SUCCESS - Progress saved to database`
   - ✅ Database Query → `current_page` matches the page you're on

### Step 3: Verify Persistence
1. Refresh the page (F5)
2. Check if the book opens to the same page you were reading
3. If yes, everything is working ✅

---

## Backend Log Levels

Add this to `application.yml` to see more detailed logs:
```yaml
logging:
  level:
    com.elibrary.service.ProgressService: DEBUG
    com.elibrary.controller.ProgressController: INFO
    org.hibernate: INFO
```

Then restart backend and repeat the test.

---

## Files to Check

1. **Frontend API Call:**
   - `E-Library/frontend/src/pages/Reading.jsx` → `handleAutoSave()` function
   - `E-Library/frontend/src/services/ActivityService.js` → `logActivity()` method

2. **Backend Processing:**
   - `E-Library/backend/src/main/java/com/elibrary/controller/ProgressController.java`
   - `E-Library/backend/src/main/java/com/elibrary/service/ProgressService.java`
   - `E-Library/backend/src/main/java/com/elibrary/model/ReadingProgress.java`

3. **Database:**
   - `E-Library/database/schema.sql` → Should have `version` column
   - `elibrary_db.reading_progress` → Actual table in MySQL

---

## Questions to Answer While Debugging

1. **Does `/api/progress` API endpoint receive the request?**
   - Check backend logs for: `PUT /progress API CALLED`

2. **Are the parameters correct?**
   - Logs should show: `userId=?, bookId=?, currentPage=?, totalPages=?`

3. **Does the database have a `version` column?**
   - Run: `DESC elibrary_db.reading_progress;`

4. **Is the save happening?**
   - Logs should show: `SUCCESS - Progress saved to database`

5. **Is the data in the database?**
   - Run: `SELECT * FROM reading_progress WHERE user_id=1;`

If any of these fails, you've found the issue!
