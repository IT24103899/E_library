# Reading Progress Concurrency Issues - Analysis & Fixes

## Issues Identified

### 1. **Race Condition in Backend (ProgressService)**
- Multiple concurrent requests could update the same `reading_progress` record simultaneously
- Without transaction isolation, updates could interfere with each other
- **Problem**: User reads page 5, then page 10 within 2 seconds. Both requests arrive at backend. If page 5 update finishes last, it overwrites page 10.

### 2. **No Optimistic Locking**
- `ReadingProgress` entity was missing `@Version` annotation required by Spring Data for optimistic locking
- Without version tracking, the database can't detect concurrent modifications
- **Problem**: Lost update anomaly where an older version overwrites a newer one

### 3. **Inadequate Frontend Debounce**
- Debounce timeout could be cleared and reset multiple times
- While it prevents rapid saves, it doesn't prevent in-flight requests from arriving out of order
- **Problem**: Request for page 10 could arrive before page 15, causing the wrong page to be saved

### 4. **No Page Validation Check**
- Backend accepted any page number without checking if it was newer than the current value
- **Problem**: An old request arriving late could revert progress to an older page

## Fixes Implemented

### Backend Changes:

#### 1. **Added Optimistic Locking** (`ReadingProgress.java`)
```java
@Version
@Column(name = "version")
private Long version = 0L;
```
- JPA/Hibernate automatically increments this on update
- Detects concurrent modification attempts
- Returns `409 Conflict` if version mismatch occurs

#### 2. **Enhanced ProgressService** (`ProgressService.java`)
- Added `@Transactional` annotation for transaction isolation
- Added page precedence check: only updates if `newPage > currentPage`
- Prevents old updates from overwriting newer ones:
```java
if (currentPage != null && currentPage > progress.getCurrentPage()) {
    progress.setCurrentPage(currentPage);
} else {
    return progress; // Don't update with older data
}
```

#### 3. **Retry Logic in Controller** (`ProgressController.java`)
- Added automatic retry (up to 3 attempts) for optimistic locking conflicts
- Exponential backoff (50ms, 100ms, 150ms) between retries
- Returns `409 Conflict` only after all retries exhausted
- Better error logging for debugging concurrent issues

### Frontend Changes:

#### 1. **Improved Concurrent Request Prevention** (`Reading.jsx`)
```javascript
const savingInProgressRef = useRef(false);
const lastSentPageRef = useRef(0);
```
- `savingInProgressRef`: Prevents multiple saves happening simultaneously
- `lastSentPageRef`: Tracks which page was last sent to avoid duplicate requests

#### 2. **Enhanced Debounce Logic**
- Only triggers save if:
  1. Not already saving (`savingInProgressRef`)
  2. Page is different from what was sent (`lastSentPageRef`)
  3. 2-second timeout has passed since last page change

#### 3. **Better Error Handling**
- Failed saves don't update `lastSavedPage`, allowing retry
- Errors are logged for debugging
- `lastSentPageRef` only updates on success

### Database Changes:

#### 1. **Added Version Column** (`add_version_to_reading_progress.sql`)
```sql
ALTER TABLE reading_progress ADD COLUMN version BIGINT DEFAULT 0 NOT NULL;
```

#### 2. **Added Composite Index**
```sql
CREATE UNIQUE INDEX idx_reading_progress_user_book 
ON reading_progress(user_id, book_id) WHERE is_deleted = false;
```
- Speeds up lookups for finding existing progress records
- Ensures efficient concurrent update handling

## How the Fix Works

### Scenario: User rapidly changes pages (5 → 10 → 15)

**Before (Broken):**
1. Request to save page 5 sent, takes 500ms to process
2. Request to save page 10 sent, arrives first, completes
3. Request to save page 15 sent, arrives last, completes
4. Page 5 request finally completes, overwrites with page 5 ❌

**After (Fixed):**
1. Request to save page 5 sent
   - `savingInProgressRef = true`, debounce starts
2. Page 10 pressed → debounce resets (page 5 hasn't completed)
3. Page 15 pressed → debounce resets again
4. After 2 seconds with no more changes, only page 15 sent
5. Backend receives page 15, saves it, version increments
6. If old requests arrive, they fail with version mismatch
7. Controller retries, but page 15 > page 5/10, so no update
8. Final database state: page 15 ✅

## Testing the Fix

### Run the migration:
```bash
mysql -u root -p elibrary < E-Library/database/add_version_to_reading_progress.sql
```

### Test rapid page changes:
1. Open a book in reading mode
2. Click next/previous rapidly (change 10+ pages quickly)
3. Check browser console → verify `[AutoSave] Saving` messages appear for final page only
4. Check database → `reading_progress` table should have version column = 1 or higher
5. Verify `current_page` is the last page you landed on

### Verify transaction isolation:
- Open same book in 2 browsers
- Change pages rapidly in each
- Each should save independently without overwriting the other's latest page

## Additional Notes

- The 2-second debounce is a balance between responsiveness and reducing server load
- Optimistic locking retries handle AWS RDS transaction conflicts gracefully
- Page precedence check prevents logical reversions (page 5 after page 15)
- All changes maintain backward compatibility - no breaking API changes

## Files Changed

1. `E-Library/backend/src/main/java/com/elibrary/model/ReadingProgress.java`
   - Added `@Version` field for optimistic locking

2. `E-Library/backend/src/main/java/com/elibrary/service/ProgressService.java`
   - Added `@Transactional` annotation
   - Added page precedence validation

3. `E-Library/backend/src/main/java/com/elibrary/controller/ProgressController.java`
   - Added retry logic for optimistic locking failures
   - Added conflict error handling

4. `E-Library/frontend/src/pages/Reading.jsx`
   - Added `savingInProgressRef` and `lastSentPageRef`
   - Enhanced debounce logic with concurrency checks

5. `E-Library/database/add_version_to_reading_progress.sql` (NEW)
   - Database migration script for version column
