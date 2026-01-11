# Setup Guide

## Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| Java JDK | 21+ | [OpenJDK](https://openjdk.org/) or [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| MySQL | 8.0+ | [mysql.com](https://dev.mysql.com/downloads/) |
| Maven | 3.9+ | [maven.apache.org](https://maven.apache.org/download.cgi) (or use included wrapper) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

### Verify Installation

```bash
# Java
java -version
# Expected: openjdk version "21.x.x"

# Node.js
node -v
# Expected: v18.x.x or higher

npm -v
# Expected: 9.x.x or higher

# MySQL
mysql --version
# Expected: mysql Ver 8.x.x

# Maven (optional - wrapper included)
mvn -version
```

---

## Environment Variables

### Backend Environment Variables

Create `application.properties` from the example file:

```bash
cd Insurai-backend/src/main/resources
cp application.properties.example application.properties
```

Configure the following variables:

```properties
# ===========================================
# Database Configuration
# ===========================================
spring.datasource.url=jdbc:mysql://localhost:3306/insurai_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ===========================================
# JPA/Hibernate Settings
# ===========================================
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# ===========================================
# File Upload Settings
# ===========================================
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=20MB

# ===========================================
# Supabase S3 Storage
# ===========================================
supabase.url=https://your-project.supabase.co
supabase.accessKey=your_supabase_access_key
supabase.secretKey=your_supabase_secret_key
supabase.bucket=Insur_AI
supabase.region=ap-south-1

# ===========================================
# Email Configuration (Gmail SMTP)
# ===========================================
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.protocol=smtp
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# ===========================================
# Cohere AI API
# ===========================================
cohere.api.key=your_cohere_api_key
```

### Environment Variable Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_USERNAME` | MySQL username | Yes |
| `DB_PASSWORD` | MySQL password | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes* |
| `SUPABASE_ACCESS_KEY` | Supabase access key | Yes* |
| `SUPABASE_SECRET_KEY` | Supabase secret key | Yes* |
| `MAIL_USERNAME` | Gmail address | Yes** |
| `MAIL_PASSWORD` | Gmail app password | Yes** |
| `COHERE_API_KEY` | Cohere API key | No*** |

\* Required for document storage functionality  
\** Required for password reset emails  
\*** Required for AI chatbot functionality

---

## Database Setup

### 1. Install MySQL

**Windows:**
Download and install from [MySQL Installer](https://dev.mysql.com/downloads/installer/)

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

### 2. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE insurai_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional, for non-root access)
CREATE USER 'insurai_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON insurai_db.* TO 'insurai_user'@'localhost';
FLUSH PRIVILEGES;

# Exit
EXIT;
```

### 3. Verify Connection

```bash
mysql -u insurai_user -p insurai_db
# Enter password when prompted
# Should connect successfully
```

---

## Backend Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/InsurAI-Project.git
cd InsurAI-Project/Insurai-backend
```

### 2. Configure Application Properties

```bash
# Copy example configuration
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Edit with your values
# Use any text editor (VS Code, Notepad++, vim, etc.)
```

### 3. Build and Run

**Using Maven Wrapper (Recommended):**

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/macOS
./mvnw spring-boot:run
```

**Using Installed Maven:**

```bash
mvn spring-boot:run
```

**Build JAR and Run:**

```bash
# Build
./mvnw clean package -DskipTests

# Run
java -jar target/insurai-backend-0.0.1-SNAPSHOT.jar
```

### 4. Verify Backend

Open browser or use curl:
```bash
curl http://localhost:8080/auth/employees
# Should return [] or list of employees
```

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd InsurAI-Project/insurai-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API URL (if needed)

The API base URL is configured in `src/api.js`:

```javascript
const API = axios.create({
  baseURL: "http://localhost:8080",
  // ...
});
```

Modify if your backend runs on a different port.

### 4. Run Development Server

```bash
npm run dev
```

### 5. Access Application

Open browser: **http://localhost:5173**

---

## Supabase Storage Setup (Optional)

### 1. Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note the project URL

### 2. Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `Insur_AI`
3. Set bucket as **public** or configure RLS policies

### 3. Get API Keys

1. Go to **Settings** > **API**
2. Copy:
   - Project URL
   - `anon` key (access key)
   - `service_role` key (secret key)

### 4. Configure Backend

Update `application.properties`:
```properties
supabase.url=https://your-project-id.supabase.co
supabase.accessKey=your_anon_key
supabase.secretKey=your_service_role_key
supabase.bucket=Insur_AI
supabase.region=ap-south-1
```

---

## Gmail SMTP Setup (Optional)

### 1. Enable 2-Factor Authentication

1. Go to Google Account settings
2. Enable 2-Step Verification

### 2. Generate App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Windows Computer** (or your OS)
3. Generate password
4. Copy the 16-character password

### 3. Configure Backend

```properties
spring.mail.username=your_email@gmail.com
spring.mail.password=your_16_char_app_password
```

---

## Cohere AI Setup (Optional)

### 1. Create Account

1. Go to [cohere.ai](https://cohere.ai)
2. Sign up for an account
3. Navigate to API Keys section

### 2. Generate API Key

1. Create a new API key
2. Copy the key

### 3. Configure Backend

```properties
cohere.api.key=your_cohere_api_key
```

---

## Initial Data Setup

### Create Admin User

The admin user should be created directly in the database:

```sql
INSERT INTO admins (name, email, password) VALUES (
  'System Admin',
  'admin@insurai.com',
  '$2a$10$...'  -- BCrypt encoded password
);
```

To generate BCrypt password:
```java
// Use this in a test class or main method
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
System.out.println(encoder.encode("your_admin_password"));
```

Or use online BCrypt generator (for development only).

---

## Running the Full Stack

### Terminal 1: Backend
```bash
cd Insurai-backend
./mvnw spring-boot:run
```

### Terminal 2: Frontend
```bash
cd insurai-frontend
npm run dev
```

### Access Points
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| MySQL | localhost:3306 |

---

## Common Setup Issues

### Issue: MySQL Connection Refused

**Symptom:** `Communications link failure`

**Solutions:**
1. Ensure MySQL service is running:
   ```bash
   # Windows
   net start mysql
   
   # Linux
   sudo systemctl start mysql
   ```
2. Check port 3306 is not blocked
3. Verify credentials in `application.properties`

---

### Issue: Port 8080 Already in Use

**Symptom:** `Port 8080 was already in use`

**Solutions:**
1. Find and kill the process:
   ```bash
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <pid> /F
   
   # Linux/macOS
   lsof -i :8080
   kill -9 <pid>
   ```
2. Or change port in `application.properties`:
   ```properties
   server.port=8081
   ```

---

### Issue: CORS Errors in Browser

**Symptom:** `Access-Control-Allow-Origin` errors

**Solutions:**
1. Ensure frontend URL matches CORS config
2. Check `SecurityConfig.java`:
   ```java
   .allowedOrigins("http://localhost:5173")
   ```
3. Clear browser cache

---

### Issue: npm install Fails

**Symptom:** Dependency resolution errors

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use legacy peer deps
npm install --legacy-peer-deps
```

---

### Issue: Java Version Mismatch

**Symptom:** `UnsupportedClassVersionError`

**Solutions:**
1. Verify Java 21 is installed:
   ```bash
   java -version
   ```
2. Set JAVA_HOME:
   ```bash
   # Windows
   set JAVA_HOME=C:\Program Files\Java\jdk-21
   
   # Linux/macOS
   export JAVA_HOME=/usr/lib/jvm/java-21
   ```

---

### Issue: Hibernate DDL Errors

**Symptom:** Table creation/update failures

**Solutions:**
1. Check database exists:
   ```sql
   SHOW DATABASES;
   ```
2. Verify user has privileges:
   ```sql
   SHOW GRANTS FOR 'user'@'localhost';
   ```
3. For fresh start:
   ```properties
   spring.jpa.hibernate.ddl-auto=create
   ```
   **Warning:** This drops all tables!

---

## Production Deployment Notes

### Backend
1. Set `spring.jpa.hibernate.ddl-auto=validate`
2. Use environment variables for secrets
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up database backups

### Frontend
```bash
# Build for production
npm run build

# Output in dist/ folder
# Deploy to static hosting (Nginx, S3, Vercel, etc.)
```

### Environment-Specific Configs
Create separate property files:
- `application-dev.properties`
- `application-prod.properties`

Run with profile:
```bash
java -jar app.jar --spring.profiles.active=prod
```

