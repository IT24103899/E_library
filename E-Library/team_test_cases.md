# Team Test Cases - Updated

## Member 3: Abhinaya K (IT24103851)
*Integrated test cases for `Reading.jsx`. The previous zoom features were replaced with Bookmark and Highlight features.*

| Test Case ID | Test Title | Description | Preconditions | Test Steps | Test Data | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|---|---|---|
| TC001 | Load PDF Document | Verify PDF viewer logic in Reading.jsx | User selects a valid book to read | 1. Open the Reading page with the book ID.<br>2. Wait for the load. | Valid Book ID | PDF document renders correctly on screen. | The specified PDF document loaded perfectly into the viewer frame. | Pass |
| TC002 | PDF Not Found Error | Verify error state in Reading.jsx | The system has missing PDF file | 1. Open the Reading page. | Invalid Book ID or missing file | The error message "Document not found" appears gracefully. | The application gracefully presented the "Document not found" graphic instead of crashing. | Pass |
| TC003 | Next Page Navigation | Verify next page button in Reading.jsx | PDF is successfully loaded | 1. Click "Next Page" button. | None | Viewer displays the subsequent page of the PDF. | Clicking the Next button properly advanced the view to page 2. | Pass |
| TC004 | Prev Page Navigation | Verify prev page button in Reading.jsx | PDF is on page 2 or higher | 1. Click "Previous Page" button. | None | Viewer displays the preceding page of the PDF. | Clicking the Prev button effectively updated the viewer back to the previous page. | Pass |
| TC005 | Prev Page Disabled | Verify prev button state in Reading.jsx | PDF is on the first page (Page 1) | 1. Observe "Previous Page" button.<br>2. Click it. | None | Button is disabled; viewer stays on Page 1. | The previous button visually appeared greyed out and clicking did nothing. | Pass |
| TC006 | Add Bookmark | Verify bookmark logic in Reading.jsx | PDF is successfully loaded | 1. Navigate to a specific page.<br>2. Click "Bookmark" icon. | Valid Page Number (e.g. Page 5) | Bookmark icon changes state. Page number is saved to the user's bookmark list. | Bookmark icon updated visually and page bookmarked successfully. | Pass |
| TC007 | Text Highlight | Verify highlighting text in Reading.jsx | PDF is successfully loaded | 1. Select a block of text.<br>2. Click the "Highlight" option. | Selected text string | Selected text background turns yellow (or designated highlight color). | Text was successfully highlighted visually on the screen. | Pass |


## Member 4: Herath H.M.B.M (IT24103899)
*Integrated test cases for `UserDashboard.jsx`, `ActivityDashboard.jsx`, `BookPage.jsx`, and `Reading.jsx`. Clear History test cases were replaced with Borrow Book Action and Reading Progress Sync.*

| Test Case ID | Test Title | Description | Preconditions | Test Steps | Test Data | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|---|---|---|
| TC001 | Dashboard Profile Info | Verify profile rendering in UserDashboard.jsx | User is logged in | 1. Navigate to User Dashboard.<br>2. Check profile section. | Valid user data | The user's name and email are accurately plotted on screen. | Test user's Name and Email were extracted and printed flawlessly on the profile card. | Pass |
| TC002 | Dashboard Empty Stats | Verify initial stats in UserDashboard.jsx | New user account | 1. Navigate to User Dashboard.<br>2. Check books read stat. | Zero activity | Statistics cleanly show "0" for books read or activities. | Number of books read and recent activities rendered accurately as 0. | Pass |
| TC003 | Dashboard Navigation | Verify sidebar links in UserDashboard.jsx | User is on Dashboard | 1. Click 'Settings' or 'Profile' link. | None | Navigates successfully to respective pages. | Clicking the profile efficiently altered routing to the standard profile url cleanly. | Pass |
| TC004 | Load Activity History | Verify fetching list in ActivityDashboard.jsx | User has past reading activity | 1. Navigate to Activity Dashboard.<br>2. View list. | Existing activity records | A chronological list of previously read books is rendered. | 3 history items were pulled from the API and shown properly as a list. | Pass |
| TC005 | Empty History State | Verify no-activity UI in ActivityDashboard.jsx | User has zero recorded activity | 1. Navigate to Activity Dashboard. | No activity records | "No recent activity" placeholder message is shown. | The "No recent activity" blank slate rendered successfully. | Pass |
| TC006 | Re-read Book from History | Verify item click in ActivityDashboard.jsx | History list has entries | 1. Click on a specific book activity card. | Valid Book ID | System navigates user directly to the Reading page. | User was dumped straight into Reading.jsx for the exact book ID selected. | Pass |
| TC007 | History Date Formatting | Verify date display in ActivityDashboard.jsx | History list is loaded | 1. Inspect the timestamp on activity items. | Timestamp data | Dates are formatted logically (e.g. "Oct 12"). | Date text read as "2 days ago" confirming time logic works smoothly. | Pass |
| TC008 | History Pagination | Verify infinite scroll/pages in ActivityDashboard.jsx | User has >20 history items | 1. Scroll to bottom or click Next Page. | >20 records | Additional items append seamlessly to the list. | Scrolling down the block accurately appended the older 10 items to the DOM. | Pass |
| TC009 | Borrow Book Action | Verify borrowing a book in BookPage.jsx | User is logged in. Book is available. | 1. Navigate to a specific BookPage.<br>2. Click "Borrow Book" button. | Valid Book ID | Button changes to "Borrowed", success toast appears, and book is added to user's library. | System updated status to "Borrowed" and displayed success message. | Pass |
| TC010 | Reading Progress Sync | Verify progress updates in Reading.jsx | User is reading a borrowed book. | 1. Navigate to Reading.jsx.<br>2. Change pages.<br>3. Go back to Dashboard. | Book ID, Last read page number | System saves the last read page. Dashboard displays accurate percentage read. | Reading progress successfully saved and reflected accurately on dashboard. | Pass |
