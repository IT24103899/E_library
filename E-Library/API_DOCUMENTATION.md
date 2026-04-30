# 📋 E-Library API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
(JWT implementation in roadmap - currently using userId query parameter)

---

## 📊 Activity Endpoints

### 1. Get User Activity History
**Endpoint:** `GET /history?userId={userId}`

**Description:** Retrieve all activities for a user

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | Long | Yes | The user ID |

**Response:**
```json
[
  {
    "id": 1,
    "bookId": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "currentPage": 45,
    "totalPages": 180,
    "lastRead": "2024-02-24T15:30:00"
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 2. Create New Activity
**Endpoint:** `POST /activity`

**Description:** Log a new reading activity (BORROW, START, PAUSE, COMPLETE)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | Long | Yes | User ID |
| bookId | Long | Yes | Book ID |
| action | String | Yes | BORROW, START, PAUSE, COMPLETE, RETURN |
| currentPage | Integer | No | Current page number |
| timeSpentMinutes | Integer | No | Minutes spent reading |

**Example Request:**
```bash
curl -X POST 'http://localhost:8080/api/activity?userId=1&bookId=1&action=START&currentPage=0&timeSpentMinutes=30'
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "bookId": 1,
  "action": "START",
  "currentPage": 0,
  "timeSpentMinutes": 30,
  "highInterest": true,
  "timestamp": "2024-02-24T15:30:00"
}
```

**Status Codes:**
- `201 Created` - Activity created successfully
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

---

### 3. Delete Activity
**Endpoint:** `DELETE /history/{activityId}`

**Description:** Soft delete an activity (marks as deleted, not removed from DB)

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| activityId | Long | Activity ID to delete |

**Response:**
```json
{
  "message": "Activity deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Deleted successfully
- `404 Not Found` - Activity not found
- `500 Internal Server Error` - Server error

---

## 📈 Statistics Endpoints

### Get User Statistics
**Endpoint:** `GET /stats?userId={userId}`

**Description:** Get calculated statistics for a user

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | Long | Yes | User ID |

**Response:**
```json
{
  "readingVelocity": 35,
  "currentStreak": 5,
  "booksRead": 12
}
```

**Field Definitions:**
- `readingVelocity` (int) - Average pages read per hour
- `currentStreak` (int) - Number of consecutive reading sessions > 5 min
- `booksRead` (int) - Total books in history

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

## 📖 Progress Endpoints

### 1. Update Reading Progress
**Endpoint:** `PUT /progress`

**Description:** Update the current page progress for a book

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | Long | Yes | User ID |
| bookId | Long | Yes | Book ID |
| currentPage | Integer | Yes | Current page number |
| totalPages | Integer | No | Total pages (default: 300) |

**Example Request:**
```bash
curl -X PUT 'http://localhost:8080/api/progress?userId=1&bookId=1&currentPage=45&totalPages=180'
```

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "bookId": 1,
  "currentPage": 45,
  "totalPages": 180,
  "percentageComplete": 25.0,
  "lastReadAt": "2024-02-24T15:35:00",
  "startedAt": "2024-02-24T14:00:00",
  "completedAt": null
}
```

**Status Codes:**
- `200 OK` - Updated successfully
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

---

### 2. Get Reading Progress
**Endpoint:** `GET /progress?userId={userId}&bookId={bookId}`

**Description:** Retrieve reading progress for a specific book

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | Long | Yes | User ID |
| bookId | Long | Yes | Book ID |

**Response:**
```json
{
  "id": 1,
  "userId": 1,
  "bookId": 1,
  "currentPage": 45,
  "totalPages": 180,
  "percentageComplete": 25.0,
  "lastReadAt": "2024-02-24T15:35:00",
  "startedAt": "2024-02-24T14:00:00",
  "completedAt": null
}
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

## 📚 Book Endpoints

### 1. Get All Books
**Endpoint:** `GET /books`

**Description:** Retrieve all active books in the catalog

**Response:**
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A classic American novel",
    "totalPages": 180,
    "coverUrl": "https://...",
    "isbn": "9780743273565",
    "category": "Fiction",
    "publicationYear": 1925
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Server error

---

### 2. Get Single Book
**Endpoint:** `GET /books/{id}`

**Description:** Retrieve details for a specific book

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Book ID |

**Response:**
```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "description": "A classic American novel",
  "totalPages": 180,
  "coverUrl": "https://...",
  "isbn": "9780743273565",
  "category": "Fiction",
  "publicationYear": 1925
}
```

**Status Codes:**
- `200 OK` - Success
- `404 Not Found` - Book not found
- `500 Internal Server Error` - Server error

---

### 3. Create Book (Admin)
**Endpoint:** `POST /books`

**Description:** Add a new book to the catalog

**Request Body:**
```json
{
  "title": "1984",
  "author": "George Orwell",
  "description": "A dystopian novel",
  "totalPages": 328,
  "coverUrl": "https://...",
  "isbn": "9780451524935",
  "category": "Science Fiction",
  "publicationYear": 1949
}
```

**Response:** Same as single book response

**Status Codes:**
- `201 Created` - Book created successfully
- `400 Bad Request` - Invalid data
- `500 Internal Server Error` - Server error

---

### 4. Update Book (Admin)
**Endpoint:** `PUT /books/{id}`

**Description:** Update an existing book

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Book ID |

**Request Body:** Same as create book

**Status Codes:**
- `200 OK` - Updated successfully
- `404 Not Found` - Book not found
- `500 Internal Server Error` - Server error

---

### 5. Delete Book (Admin)
**Endpoint:** `DELETE /books/{id}`

**Description:** Soft delete a book

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Book ID |

**Response:**
```json
{
  "message": "Book deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Deleted successfully
- `500 Internal Server Error` - Server error

---

## 🔄 Request/Response Flow Example

### Complete User Session

**1. User Borrows Book**
```bash
POST /activity?userId=1&bookId=1&action=BORROW
```

**2. User Starts Reading**
```bash
POST /activity?userId=1&bookId=1&action=START&currentPage=0&timeSpentMinutes=30
```

**3. Update Progress**
```bash
PUT /progress?userId=1&bookId=1&currentPage=45&totalPages=180
```

**4. Get Stats**
```bash
GET /stats?userId=1
```
Response: Reading velocity updated!

**5. Get History**
```bash
GET /history?userId=1
```
Response: Shows all reading activities

---

## 🎯 Key Features

### High Interest Flag
When a user reads for **more than 5 minutes**, the backend automatically sets:
```json
"highInterest": true
```

This flag is used by AI/ML services to boost book recommendations.

### Soft Deletes
All delete operations use a soft delete pattern:
- Data is marked with `is_deleted = true`
- Data is never permanently removed from database
- Queries filter out deleted records with `is_deleted = false`

### Automatic Calculations
- **Reading Velocity:** Total pages ÷ Total minutes × 60
- **Current Streak:** Count of activities with `high_interest = true`
- **Books Read:** Distinct count of book IDs in user's history

---

## 📊 Data Types

### Core Objects

**User**
```json
{
  "id": Long,
  "email": String,
  "fullName": String,
  "password": String (hashed),
  "profilePictureUrl": String,
  "bio": String,
  "readingPreference": String,
  "createdAt": DateTime,
  "isDeleted": Boolean
}
```

**Book**
```json
{
  "id": Long,
  "title": String,
  "author": String,
  "description": String,
  "totalPages": Integer,
  "coverUrl": String,
  "isbn": String,
  "category": String,
  "publicationYear": Integer,
  "createdAt": DateTime,
  "isDeleted": Boolean
}
```

**ActivityLog**
```json
{
  "id": Long,
  "userId": Long,
  "bookId": Long,
  "action": String (BORROW|START|PAUSE|COMPLETE|RETURN),
  "currentPage": Integer,
  "timeSpentMinutes": Integer,
  "highInterest": Boolean,
  "timestamp": DateTime,
  "isDeleted": Boolean
}
```

**ReadingProgress**
```json
{
  "id": Long,
  "userId": Long,
  "bookId": Long,
  "currentPage": Integer,
  "totalPages": Integer,
  "percentageComplete": Double,
  "lastReadAt": DateTime,
  "startedAt": DateTime,
  "completedAt": DateTime (null if ongoing),
  "isDeleted": Boolean
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid parameters",
  "message": "userId is required"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "Book with id 999 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

## 🔐 Future Security Features

- JWT Authentication
- Role-based access control (Admin, User, Guest)
- API rate limiting
- Request validation
- Data encryption

---

## 📞 Testing Tools

### Postman
- Import endpoints from this documentation
- Create a collection for testing

### cURL Examples Included
See each endpoint for ready-to-use curl commands

### Frontend Integration
- Axios is pre-configured in `ActivityService.js`
- All endpoints ready to use

---

**API Documentation - Last Updated: February 2024**
