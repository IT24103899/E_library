# New User Progress Saving - Quick Test Guide

## Issue Found ✅
When a **new user logs in**, their reading progress was NOT being saved because the `userId` was being read before the user data was loaded from localStorage.

## What Was Fixed
1. **Reading.jsx** - Updated userId calculation to use optional chaining (`authUser?.id`)
2. **Reading.jsx** - Ensured userId is recalculated every time component re-renders (when authUser changes)
3. **stopSession() function** - Changed to use component-level userId instead of redundant calculation

---

## How to Test the Fix

### Step 1: Clear Browser Data
1. Open Browser DevTools (F12)
2. **Application** tab → **Local Storage** → Click on `http://localhost:3000`
3. **Delete** the `user` entry
4. Close DevTools

### Step 2: Register a New User
1. Go to http://localhost:3000/register
2. Fill in:
   - Email: `newuser@test.com`
   - Full Name: `New Test User`
   - Password: `Test123!`
3. Click "Create Account"
4. Should see success and redirect to login

### Step 3: Login with New User
1. You should be at login page
2. Enter:
   - Email: `newuser@test.com`
   - Password: `Test123!`
3. Click "Sign in"
4. Should see the library/dashboard

### Step 4: Open Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. You should see immediately:
   ```
   User loaded from localStorage: {id: X, email: "newuser@test.com", fullName: "New Test User", ...}
   ```

### Step 5: Open a Book and Read
1. Click "Browse Books" or "Reading History"
2. Click "Continue" or "Start" on any book
3. **Change pages** (click next/previous button 3-5 times)
4. **Wait 2-3 seconds**
5. **Check Console** - You should see:
   ```
   [AutoSave] Saving: userId=X, bookId=1, currentPage=5, totalPages=300
   [AutoSave] Success - Data saved for user: X Response: {...}
   ```
   
   **IMPORTANT:** The `userId=X` should show the NEW user's ID (probably 2, 3, 4, etc.), NOT 1!

### Step 6: Check Network Request
1. Go to **Network** tab in DevTools
2. Look for a **PUT request** to `/api/progress`
3. **Query Parameters** should show:
   ```
   userId=X  (where X is the new user's actual ID)
   bookId=1
   currentPage=5
   totalPages=300
   ```

### Step 7: Verify Database
1. Open MySQL client:
   ```bash
   mysql -u root -p elibrary_db
   ```

2. Run:
   ```sql
   SELECT id, user_id, book_id, current_page, last_read_at
   FROM reading_progress 
   WHERE user_id != 1
   ORDER BY last_read_at DESC;
   ```

3. **EXPECTED OUTPUT** - Should see a row with:
   ```
   | id | user_id | book_id | current_page | last_read_at        |
   |----|---------|---------|--------------|---------------------|
   | X  | 2       | 1       | 5            | 2026-03-17 10:xx:xx |
   ```
   
   The important part is **`user_id = 2`** (or whatever the new user's ID is), NOT user_id = 1

### Step 8: Test Persistence
1. **Refresh the page** (F5)
2. Navigate back to the book
3. Should open at **page 5** (where you left off)
4. ✅ **SUCCESS** - Progress was saved and restored!

---

## What to Check If It Fails

### If Console Shows `userId=1`:
- **Problem:** userId is still falling back to 1
- **Check:** Is the user data in localStorage?
  ```javascript
  // In console type:
  JSON.parse(localStorage.getItem('user'))
  ```
- Should show the new user's ID, not undefined
- If undefined or null, check Login.jsx is storing the data correctly

### If No Network Request Shows:
- **Problem:** API not being called
- **Check:** 
  - Did you wait 2+ seconds after changing pages?
  - Are there console errors?
  - Is book data loaded?

### If Request Shows 500 Error:
- **Problem:** Backend error
- **Check Backend Logs:** Look for error messages
- Most likely: `userId` value is invalid or user doesn't exist in database for some reason

### If Database Shows `user_id = 1`:
- **Problem:** Wrong user ID being sent to API
- **Check:** Console should show `userId=X` where X is not 1
- If it shows 1, then the localStorage isn't being loaded properly

---

## Files Modified
- `E-Library/frontend/src/pages/Reading.jsx`
  - Updated userId initialization to recalculate when authUser changes
  - Better logging to show which user ID is being used
  - stopSession() now uses component-level userId

---

## How It Works Now

### Before (Broken Flow):
```
Component renders → userId = 1 (fallback, authUser is still null)
↓
useEffect runs and loads authUser from localStorage
↓
Component doesn't re-render because userId is already set
↓
API calls use userId = 1 forever ❌
```

### After (Fixed Flow):
```
Component renders → userId = 1 (fallback, authUser is still null)
↓
useEffect runs and loads authUser from localStorage
↓
setAuthUser(newUser) triggers re-render
↓
Component body runs again → userId = newUser.id ✅
↓
API calls use correct user ID ✅
```

---

## Quick Checklist After Rebuilding

- [ ] Backend restarted
- [ ] Frontend refreshed (Ctrl+Shift+R or clear cache)
- [ ] Browser localStorage cleared
- [ ] New user registered
- [ ] New user logged in
- [ ] Book opened and pages changed
- [ ] Console shows `userId=` with actual new user ID (not 1)
- [ ] Network request shows correct userId in query params
- [ ] Database shows progress record with correct user_id
- [ ] Refresh test shows book opens at saved page
