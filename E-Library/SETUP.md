# 🚀 E-Library Setup & Deployment Guide

## ⚙️ Prerequisites Installation

### 1. Install Node.js & npm
- Download: https://nodejs.org (LTS version 18+)
- Verify: `node -v` and `npm -v`

### 2. Install Java JDK 11+
```bash
# Windows - use installer from https://www.oracle.com/java/technologies/downloads/
# macOS
brew install openjdk@11

# Linux (Ubuntu)
sudo apt-get install openjdk-11-jdk
```
- Verify: `java -version`

### 3. Install Maven
- Download: https://maven.apache.org/download.cgi
- Or: `brew install maven` (macOS)

### 4. Install MySQL
- Download: https://dev.mysql.com/downloads/mysql/
- Default credentials: `root` / `root`

---

## 📋 Database Setup

```bash
# Open MySQL
mysql -u root -p

# Enter password: root

# Run schema
source database/schema.sql

# Verify
USE elibrary_db;
SHOW TABLES;
```

Expected tables:
- ✅ users
- ✅ books
- ✅ activity_logs
- ✅ reading_progress

---

## 🔧 Backend Setup & Run

```bash
cd backend

# Clean build
mvn clean install

# Run Spring Boot
mvn spring-boot:run
```

Expected output:
```
✅ E-Library Backend started successfully on port 8080!
```

**API will be available at:** `http://localhost:8080/api`

---

## 🎨 Frontend Setup & Run

**Open a NEW terminal window:**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**App will open at:** `http://localhost:3000`

---

## ✅ Testing the Connection

### Test from Frontend

1. Open browser: `http://localhost:3000`
2. You should see the **E-Library Dashboard**
3. Verify stats are loading (may show "Error" if backend not running)

### Test API Manually

```bash
curl http://localhost:8080/api/stats?userId=1
```

Expected response:
```json
{
  "readingVelocity": 35,
  "currentStreak": 5,
  "booksRead": 2
}
```

---

## 📊 Testing CRUD Operations

### 1. GET - Retrieve History
```bash
curl http://localhost:8080/api/history?userId=1
```

### 2. POST - Create Activity
```bash
curl -X POST http://localhost:8080/api/activity \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "bookId": 1,
    "action": "BORROW",
    "currentPage": 0,
    "timeSpentMinutes": 0
  }'
```

### 3. PUT - Update Progress
```bash
curl -X PUT http://localhost:8080/api/progress \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "bookId": 1,
    "currentPage": 45,
    "totalPages": 180
  }'
```

### 4. DELETE - Remove Activity
```bash
curl -X DELETE http://localhost:8080/api/history/1
```

---

## 🐛 Common Issues & Solutions

### Issue: "Connection refused on port 8080"
**Solution:** Backend not running. Run:
```bash
cd backend
mvn spring-boot:run
```

### Issue: "Cannot GET / on port 3000"
**Solution:** Frontend not running. Run:
```bash
cd frontend
npm start
```

### Issue: "Error: connect ECONNREFUSED 127.0.0.1:3306"
**Solution:** MySQL not running
```bash
# macOS
mysql.server start

# Windows - Use Services or
mysqld
```

### Issue: "Port 3000 already in use"
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Maven build fails with "Java version not supported"
**Solution:** Update Java to 11+
```bash
java -version  # Should be 11 or higher
```

---

## 🔄 Development Workflow

### Make Frontend Changes
1. Edit files in `frontend/src/`
2. Hot reload happens automatically
3. Check `http://localhost:3000` in browser

### Make Backend Changes
1. Edit files in `backend/src/`
2. Stop `mvn spring-boot:run` (Ctrl+C)
3. Run `mvn spring-boot:run` again
4. Test with API endpoint

### Make Database Changes
1. Modify `database/schema.sql`
2. Run: `mysql -u root -p elibrary_db < database/schema.sql`
3. Restart backend

---

## 📦 Build for Production

### Frontend Build
```bash
cd frontend
npm run build
```
Output in `frontend/build/` - ready to deploy on static hosting (Vercel, Netlify, AWS S3)

### Backend Package
```bash
cd backend
mvn clean package
```
Output: `backend/target/elibrary-backend-1.0.0.jar`

Run with:
```bash
java -jar backend/target/elibrary-backend-1.0.0.jar
```

---

## 🌐 Environment Variables

### Frontend (.env)
```
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

### Backend (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/elibrary_db
    username: root
    password: root
```

---

## 📚 Useful Commands

```bash
# Frontend
npm start              # Run dev server
npm run build          # Create production build
npm test               # Run tests

# Backend
mvn clean              # Remove build files
mvn install            # Download dependencies
mvn spring-boot:run    # Start server
mvn test               # Run tests
mvn package            # Create JAR

# Database
mysql -u root -p       # Connect to MySQL
mysql -u root -p < schema.sql  # Import schema
```

---

## 🎨 Customize Your Setup

### Change Backend Port
Edit `backend/src/main/resources/application.yml`:
```yaml
server:
  port: 9000  # Change from 8080
```

### Change Frontend Port
Run with:
```bash
PORT=3001 npm start
```

### Change Database Credentials
Edit `backend/src/main/resources/application.yml`:
```yaml
datasource:
  username: youruser
  password: yourpass
```

---

## ✨ You're All Set!

- ✅ Database created with sample data
- ✅ Backend API running on 8080
- ✅ Frontend UI running on 3000
- ✅ Ready to develop!

**Next Steps:**
1. Explore the ActivityDashboard at `http://localhost:3000`
2. Review API endpoints at `http://localhost:8080/api/books`
3. Check database tables in MySQL
4. Start building new features!

---

**Happy Coding! 🚀**
