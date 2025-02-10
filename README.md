# School Points Management System

A comprehensive web application for managing student points, classes, and appraisals in an educational setting.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- MySQL Workbench (recommended for database management)
- Git

## Installation

### Database Setup

1. Install MySQL and MySQL Workbench
2. Open MySQL Workbench and connect to your local MySQL server
3. Create a new schema:
   - Click "Create new schema" in MySQL Workbench
   - Name it `school_points`
   - Click "Apply"
4. Run the database setup script:
   - Open MySQL Workbench
   - File > Open SQL Script
   - Navigate to `database/setup.sql`
   - Click "Execute" (lightning bolt icon)
5. Load sample data (optional):
   ```bash
   cd backend
   npm run load-sample-data
   ```

### Sample Data Setup

The sample data includes:

1. Users:
   - Default Admin: `admin@school.edu` / `admin123`
   - Teacher: `teacher1@school.edu` / `teacher123`
   - Teacher: `teacher2@school.edu` / `teacher123`

2. Classes:
   - Class 10A (Academic Year 2023-2024, Fall Semester)
   - Class 11B (Academic Year 2023-2024, Spring Semester)
   - Class 12C (Academic Year 2023-2024, Fall Semester)

3. Students:
   - 10 sample students distributed across classes
   - Each student has initial points and sample appraisals

### Sample Data Setup Instructions

To set up the sample data:

1. First ensure your database is initialized:
   ```bash
   cd backend
   npm run init-db
   ```

2. Then load the sample data:
   ```bash
   npm run load-sample-data
   ```

3. Verify the data:
   ```bash
   # Login with admin account
   curl -X POST http://localhost:5000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@school.edu","password":"admin123"}'

   # Check students list
   curl http://localhost:5000/students \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

If you need to reset the database and reload sample data:
```bash
npm run init-db && npm run load-sample-data
```

### Admin Account Management

There are several ways to manage admin accounts:

1. **Default Admin Account**
   - Email: `admin@school.edu`
   - Password: `admin123`
   - This account is created automatically during database initialization

2. **Add New Admin Account**
   ```bash
   cd backend
   npm run add-admin <email> <password> <firstName> <lastName>
   
   # Example:
   npm run add-admin newadmin@school.edu admin123 John Doe
   ```

3. **Reset Default Admin**
   ```bash
   cd backend
   npm run reset-admin
   ```

4. **Verify Admin Account**
   ```bash
   cd backend
   npm run verify-admin
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASS=your_password
   DB_NAME=school_points
   DB_PORT=3306
   JWT_SECRET=your_secure_jwt_secret_key_here
   JWT_EXPIRATION=24h
   ```

5. Initialize the database:
   ```bash
   npm run init-db
   ```

6. Verify the setup:
   ```bash
   npm run verify-admin
   ```

   If the verification fails, you can reset the admin password:
   ```bash
   npm run reset-admin
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### Backend Configuration (.env)
- `PORT`: Backend server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGIN`: Frontend URL for CORS
- `RATE_LIMIT_WINDOW`: Rate limiting window
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window
- `PASSWORD_SALT_ROUNDS`: Number of rounds for password hashing

### Frontend Configuration
- Update API endpoint in `frontend/src/utils/api.ts` if needed
- Default backend URL is `http://localhost:5000`

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage Guide

### Initial Login
- Default admin credentials:
  - Email: `admin@school.edu`
  - Password: `admin123`

### Points System

The application uses a comprehensive points system with the following features:

1. Points Categories:
   - Academic
   - Behavior
   - Participation
   - Leadership
   - Other

2. Points Management:
   - Add or remove points from students
   - Record reason and comments for each points change
   - Track points history with previous and new point values
   - View points distribution by category
   - Generate summary reports

3. Appraisals:
   - Teachers can create appraisals for students
   - Each appraisal includes points, category, and comments
   - View appraisal history and trends

### Key Features
1. User Management
   - Create/manage teacher accounts
   - Manage user roles and permissions

2. Class Management
   - Create and manage classes
   - Assign teachers to classes
   - View class statistics

3. Student Management
   - Add/edit student information
   - Assign students to classes
   - Track attendance and points

4. Points System
   - Award/deduct points with categories
   - Track point history with audit trail
   - Generate reports and summaries

## API Documentation

### Authentication Endpoints
- POST `/auth/login`: User login
- POST `/auth/register`: Register new user
- GET `/auth/profile`: Get user profile

### Class Management
- GET `/classes`: List all classes
- POST `/classes`: Create new class
- PUT `/classes/:id`: Update class
- DELETE `/classes/:id`: Delete class
- GET `/classes/:id/details`: Get class details with students

### Student Management
- GET `/students`: List all students
- POST `/students`: Create new student
- PUT `/students/:id`: Update student
- GET `/students/:id`: Get student details

### Points Management
- POST `/students/:id/points`: Add/remove points
  ```json
  {
    "points": 5,
    "category": "Academic",
    "reason": "Good performance",
    "comment": "Excellent work on the project"
  }
  ```
- GET `/students/:id/summary`: Get student points summary

## Database Schema

### Main Tables
1. `users`: User authentication and profiles
2. `classes`: Class information and settings
3. `student`: Student records and points
4. `appraisals`: Student appraisals
5. `points_history`: Point transaction history with audit trail

### Views
1. `student_summary`: Comprehensive student information
2. `class_statistics`: Class performance metrics

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License. 