# Spring Boot Backend Setup for Android

## ✅ Prerequisites

### Required Software
- **Java 21 LTS** - Download from [oracle.com](https://www.oracle.com/java/technologies/downloads/) or use OpenJDK
- **Maven 3.8+** - Download from [maven.apache.org](https://maven.apache.org/)
- **MySQL 8.0+** - Database server

### Verify Installation

```powershell
# Check Java
java -version
# Should show: Java 21.0.x

# Check Maven
mvn -version
# Should show: 3.8+ and Java 21

# Check MySQL
mysql -u root -p
# Enter password: Bharana@2004
```

---

## 🚀 Step 1: Build the Backend

### Option A: Using Maven (Recommended)

```bash
cd "E-Library/backend"
mvn clean install -DskipTests
```

**What it does:**
- Cleans previous builds
- Downloads dependencies
- Compiles Java code
- Packages into JAR file

**Output:** `target/elibrary-backend-1.0.0.jar`

### Option B: Using Build Scripts

#### Windows Batch Script
```bash
cd E-Library
run_backend.bat
```

#### Or with Java 21 setup
```bash
cd E-Library
build_java21.bat
```

---

## 🔧 Step 2: Configure Database

### 1. Start MySQL Server

```powershell
# Windows - If installed as service
net start MySQL80

# Or open MySQL CLI
mysql -u root -p
```

### 2. Create Database and Tables

```bash
cd "E-Library/database"
mysql -u root -p < schema.sql
```

**Password:** `Bharana@2004`

### 3. Verify Database Created

```sql
mysql> SHOW DATABASES;
mysql> USE elibrary_db;
mysql> SHOW TABLES;
```

---

## 🏃 Step 3: Run the Backend

### Quick Start

```bash
cd "E-Library/backend"
mvn spring-boot:run
```

### Expected Output

```
✅ E-Library Backend started successfully on port 8080!
```

### Test Backend is Running

```powershell
# From PowerShell
Invoke-WebRequest -Uri "http://localhost:8080/api/health" | ConvertTo-Json
```

**Success Response:**
```json
{
  "status": "UP",
  "message": "E-Library Backend is running",
  "timestamp": 1712294400000,
  "version": "1.0.0"
}
```

---

## 📱 Step 4: Connect Android App

### Configuration: API URLs

**Web Frontend:**
```
http://localhost:8080/api
```

**Android Emulator:**
```
http://10.0.2.2:8080/api
```

**Android Physical Device:**
```
http://YOUR_PC_IP:8080/api
```

### Find Your PC IP Address

```powershell
ipconfig
```

Look for **IPv4 Address** (e.g., `192.168.1.100`)

---

## 🔍 Verify Connections

### Test from Browser

```
Web: http://localhost:8080/api/health
```

### Test from Android Emulator

```bash
# In Android emulator terminal
ping 10.0.2.2
curl http://10.0.2.2:8080/api/health
```

### Test from Physical Device

```bash
# Replace with your PC's IP
ping 192.168.1.100
curl http://192.168.1.100:8080/api/health
```

---

## 📋 Spring Boot Configuration

### Location: `backend/src/main/resources/application.yml`

**Key Configurations for Android:**

```yaml
server:
  port: 8080
  servlet:
    context-path: /api
  compression:
    enabled: true                    # Reduce response size for mobile
    min-response-size: 1024

spring:
  datasource:
    hikari:
      maximum-pool-size: 20          # Connection pooling
      connection-timeout: 20000
      
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 20             # Batch operations
          fetch_size: 50
```

**CORS Configuration** (for Android):
- ✅ Allows all origins
- ✅ Supports all HTTP methods
- ✅ Enables compression

---

## 🎯 Common Endpoints

### Health Check
```
GET /api/health
Response: { status: "UP", message: "..." }
```

### Readiness Check
```
GET /api/health/ready
Response: { ready: true, service: "elibrary-backend" }
```

### Books API
```
GET /api/books
POST /api/books
```

### Search
```
GET /api/search?query=...
```

---

## ⚠️ Troubleshooting

### Error: "Address already in use :8080"

**Solution:** Another app is using port 8080

```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port in application.yml:
# server:
#   port: 8081
```

### Error: "Cannot connect to database"

**Check:**
1. MySQL server is running: `net start MySQL80`
2. Database exists: `USE elibrary_db;`
3. Credentials in `application.yml` are correct
4. Database user has proper permissions

```sql
-- Reset MySQL user permissions
GRANT ALL PRIVILEGES ON elibrary_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "CORS blocked"

**Already fixed!** Updated CORS configuration allows:
- Web: `localhost:3000`
- Android: All origins

### Backend runs but Android can't connect

**Check:**
1. Both PC and device on same WiFi network
2. Windows Firewall allows Java:
   - Settings → Firewall → Allow app through firewall
   - Add Java.exe or IntelliJ IDEA
3. Use correct IP: `ipconfig` → find IPv4 Address

---

## 🔗 Files Modified

1. ✅ `backend/src/main/java/com/elibrary/ELibraryApplication.java`
   - Enhanced CORS configuration for Android
   - Allows cross-origin requests from emulator and devices

2. ✅ `backend/src/main/resources/application.yml`
   - Added connection pooling (HikariCP)
   - Enabled compression for mobile bandwidth
   - Added health check endpoints
   - Improved logging

3. ✅ `backend/src/main/java/com/elibrary/controller/HealthCheckController.java`
   - New health check endpoint for Android to verify connection

---

## 📦 Dependency Check

The following dependencies are in `pom.xml`:

```xml
<!-- Core -->
<spring-boot-starter-web>          <!-- REST APIs -->
<spring-boot-starter-data-jpa>     <!-- Database -->

<!-- Database -->
<mysql-connector-java>             <!-- MySQL Driver -->

<!-- Security -->
<spring-boot-starter-security>     <!-- Auth -->

<!-- Validation -->
<spring-boot-starter-validation>   <!-- Data validation -->

<!-- Actuator -->
<spring-boot-starter-actuator>     <!-- Health checks, metrics -->
```

### Add Dependency (if needed)

```bash
# Inside pom.xml <dependencies> section
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

# Then rebuild
mvn clean install
```

---

## 🎓 Next Steps

1. **Build Backend:** `mvn clean install`
2. **Start Backend:** `mvn spring-boot:run`
3. **Verify Health:** `curl http://localhost:8080/api/health`
4. **Run Android App** in emulator/device
5. **Monitor Logs:** Watch for API requests from Android

---

## 📞 Support

See the provided files for details:
- API endpoints: `API_DOCUMENTATION.md`
- Setup issues: `SETUP.md`
- Project structure: `PROJECT_STRUCTURE.md`
