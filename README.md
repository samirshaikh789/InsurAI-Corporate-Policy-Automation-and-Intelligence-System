# InsurAI - Corporate Policy Automation and Intelligence System

A comprehensive enterprise insurance management system with AI-powered automation for policy management, claims processing, and employee queries.

## Project Structure

```
InsurAI-Corporate-Policy-Automation-and-Intelligence-System/
└── Insurai-backend/          # Spring Boot Backend Application
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   └── com/insurai/insurai_backend/
    │   │   │       ├── config/          # Security, JWT, CORS configurations
    │   │   │       ├── controller/      # REST API endpoints
    │   │   │       ├── model/           # Entity classes
    │   │   │       ├── repository/      # Data access layer
    │   │   │       └── service/         # Business logic
    │   │   └── resources/
    │   │       └── application.properties
    │   └── test/
    ├── pom.xml                # Maven dependencies
    └── README.md
```

## Features

- **Multi-Role Authentication**: Admin, HR, Employee, and Agent roles with JWT-based security
- **Policy Management**: Corporate policy creation, updates, and tracking
- **Claims Processing**: End-to-end claim submission and approval workflow
- **Employee Enrollment**: Seamless policy enrollment system
- **AI Chatbot**: Intelligent query handling for employees
- **Agent Dashboard**: Real-time query management and resolution
- **Document Management**: Upload and manage policy documents and claim evidence

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: MySQL
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA
- **Build Tool**: Maven

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/samirshaikh789/InsurAI-Corporate-Policy-Automation-and-Intelligence-System.git
cd InsurAI-Corporate-Policy-Automation-and-Intelligence-System
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE insurai_db;
```

### 3. Configure Application Properties

Navigate to `Insurai-backend/src/main/resources/` and copy the example properties file:

```bash
cp application.properties.example application.properties
```

Edit `application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/insurai_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 4. Build and Run

#### Using Maven Wrapper (Recommended)

**Windows:**
```bash
cd Insurai-backend
mvnw.cmd clean install
mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
cd Insurai-backend
./mvnw clean install
./mvnw spring-boot:run
```

#### Using Maven

```bash
cd Insurai-backend
mvn clean install
mvn spring-boot:run
```

#### Using Batch File (Windows)

```bash
cd Insurai-backend
run.bat
```

The application will start on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/hr/login` - HR login
- `POST /api/auth/employee/login` - Employee login
- `POST /api/auth/agent/login` - Agent login

### Admin Operations
- Policy management
- User management
- Claims approval
- System configuration

### HR Operations
- Employee management
- Enrollment management
- Policy assignment

### Employee Operations
- View policies
- File claims
- Enrollment requests
- Query chatbot

### Agent Operations
- Query management
- Employee assistance
- Real-time chat support

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Secure password encryption using BCrypt
- CORS configuration for frontend integration
- Request validation and sanitization

## Default Credentials

**Admin:**
- Username: `admin`
- Password: (Set during initial setup)

**Note**: Change default credentials immediately after first login.

## Development

### Running Tests

```bash
mvn test
```

### Package for Production

```bash
mvn clean package -DskipTests
```

The JAR file will be created in the `target/` directory.

## Configuration

Key configuration files:
- `application.properties` - Main application configuration
- `SecurityConfig.java` - Security and authentication setup
- `CorsConfig.java` - Cross-origin resource sharing settings
- `JwtUtil.java` - JWT token configuration

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `application.properties`
   - Ensure database exists

2. **Port Already in Use**
   - Change server port in `application.properties`:
     ```properties
     server.port=8081
     ```

3. **Build Failures**
   - Clean Maven cache: `mvn clean`
   - Update dependencies: `mvn clean install -U`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Contact

For queries and support, please contact the development team.

## Acknowledgments

- Spring Boot Framework
- Spring Security
- MySQL Community
- All contributors to this project

