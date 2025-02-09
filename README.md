# Student Points Management System

A comprehensive web application for managing student points and appraisals in an educational setting.

## Features

- 👥 User Authentication (Admin/Teacher roles)
- 📚 Class Management
- 👨‍🎓 Student Management
- ⭐ Points System
- 📊 Performance Analytics
- 📝 Appraisal History
- 📈 Statistical Reports

## Tech Stack

- Frontend: React with TypeScript, Material-UI
- Backend: Node.js, Express
- Database: MySQL
- Authentication: JWT

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Project Structure

```
.
├── frontend/            # React frontend application
├── backend/            # Node.js backend server
├── database/           # Database scripts and migrations
│   ├── setup.sql      # Database schema
│   └── sample_data.sql # Sample data for testing
└── docs/              # Documentation
```

## Quick Start

### 1. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE school_points;
USE school_points;

# Set up database schema
mysql -u root -p school_points < database/setup.sql

# (Optional) Load sample data
mysql -u root -p school_points < database/sample_data.sql
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your database credentials
# Edit .env file with your preferred editor and set:
# DB_HOST=localhost
# DB_USER=your_username
# DB_PASS=your_password
# DB_NAME=school_points
# JWT_SECRET=your_secret_key

# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Login Credentials

```
Admin User:
Email: admin@school.edu
Password: admin123

Sample Teacher:
Email: smith.john@school.edu
Password: teacher123
```

⚠️ **Important**: Change these passwords in production!

## Database Schema

### Key Tables

1. `users`
   - Teachers and administrators
   - Role-based access control
   - Security tracking (login attempts, etc.)

2. `classes`
   - Class information
   - Teacher assignments
   - Academic year and semester tracking

3. `student`
   - Comprehensive student information
   - Points and attendance tracking
   - Class assignments

4. `appraisals`
   - Point assignments
   - Categories (Academic, Behavior, etc.)
   - Teacher comments

5. `points_history`
   - Detailed point change tracking
   - Reason documentation
   - Automatic updates via triggers

## API Documentation

### Authentication

```
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile
```

### Classes

```
GET /api/classes
POST /api/classes
GET /api/classes/:id
PUT /api/classes/:id
DELETE /api/classes/:id
```

### Students

```
GET /api/students
POST /api/students
GET /api/students/:id
PUT /api/students/:id
DELETE /api/students/:id
GET /api/students/:id/summary
```

### Points

```
POST /api/students/:id/points
GET /api/students/:id/points/history
GET /api/students/:id/points/summary
```

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Maintenance

```sql
-- Reset all data
SOURCE database/setup.sql;
SOURCE database/sample_data.sql;

-- View common statistics
SELECT * FROM student_summary;
SELECT * FROM class_statistics;
```

### Common Views

1. `student_summary`
   - Comprehensive student information
   - Total appraisals and point changes
   - Current points and attendance

2. `class_statistics`
   - Student count per class
   - Average points
   - Performance metrics

## Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Prepare backend
cd backend
npm run build
```

### Environment Variables

Required environment variables:
```
NODE_ENV=production
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@school.edu or create an issue in the repository. 