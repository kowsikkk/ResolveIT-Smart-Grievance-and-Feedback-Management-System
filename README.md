# ResolveIT Smart Grievance and Feedback Management System

## Setup Instructions

### Backend (Spring Boot)

1. **Database Setup:**
   - Install MySQL and create a database named `grievance_db`
   - Update database credentials in `springapp/src/main/resources/application.properties`

2. **Run Backend:**
   ```bash
   cd springapp
   mvn spring-boot:run
   ```
   - Backend will run on http://localhost:8080

### Frontend (React)

1. **Install Dependencies:**
   ```bash
   cd reactapp
   npm install
   ```

2. **Run Frontend:**
   ```bash
   npm start
   ```
   - Frontend will run on http://localhost:3000

## Default Test Users

- **Username:** admin, **Password:** admin123 (Role: Admin)
- **Username:** user, **Password:** user123 (Role: User)
- **Username:** officer1, **Password:** officer123 (Role: Officer)

## Features

### Login Page
- User authentication with username/password
- Clean, responsive design matching the provided mockup

### Complaint Form
- Public or Anonymous submission options
- Subject and description fields
- File attachment support (UI ready)
- Bottom navigation bar
- Success feedback on submission

### Officer Dashboard
- View assigned complaints
- Update complaint status (In Progress/Resolved)
- Send public updates to complainants
- Statistics overview of assigned work
- Individual complaint detail view

## API Endpoints

- `POST /api/auth/login` - User authentication
- `POST /api/complaints/submit` - Submit complaint
- `GET /api/officer/complaints/{officerId}` - Get assigned complaints
- `GET /api/officer/stats/{officerId}` - Get officer statistics
- `PUT /api/officer/complaints/{id}/status` - Update complaint status

## Database Schema

### Users Table
- id (Primary Key)
- username (Unique)
- password
- email

### Complaints Table
- id (Primary Key)
- subject
- description
- submission_type (Public/Anonymous)
- attachment_path
- created_at
- user_id (Foreign Key, nullable for anonymous)