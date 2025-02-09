-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS points_history;
DROP TABLE IF EXISTS appraisals;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS users;

-- Create users table with better security and tracking
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'staff') NOT NULL DEFAULT 'teacher',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Create classes table with additional useful fields
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id INT,
    max_students INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    academic_year VARCHAR(9),
    semester ENUM('Fall', 'Spring', 'Summer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE INDEX idx_name_year_semester (name, academic_year, semester),
    INDEX idx_teacher (teacher_id)
);

-- Create student table with comprehensive student information
CREATE TABLE student (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    class_id INT,
    student_id VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    gender ENUM('M', 'F', 'Other') NOT NULL,
    points INT DEFAULT 0,
    attendance_rate DECIMAL(5,2) DEFAULT 100.00,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_class (class_id),
    INDEX idx_name (last_name, first_name)
);

-- Create appraisals table with better tracking
CREATE TABLE appraisals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    points INT NOT NULL,
    category ENUM('Academic', 'Behavior', 'Participation', 'Leadership', 'Other') NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_category (category)
);

-- Create points_history table with better auditing
CREATE TABLE points_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_id INT NOT NULL,
    points_change INT NOT NULL,
    previous_points INT NOT NULL,
    new_points INT NOT NULL,
    category ENUM('Academic', 'Behavior', 'Participation', 'Leadership', 'Other') NOT NULL,
    reason VARCHAR(255) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student (student_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
);

-- Create views for common queries
CREATE OR REPLACE VIEW student_summary AS
SELECT 
    s.id,
    s.first_name,
    s.last_name,
    s.email,
    c.name as class_name,
    s.points,
    s.attendance_rate,
    COUNT(DISTINCT a.id) as total_appraisals,
    COUNT(DISTINCT ph.id) as total_point_changes
FROM student s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN appraisals a ON s.id = a.student_id
LEFT JOIN points_history ph ON s.id = ph.student_id
GROUP BY s.id;

-- Create view for class statistics
CREATE OR REPLACE VIEW class_statistics AS
SELECT 
    c.id,
    c.name,
    COUNT(s.id) as student_count,
    AVG(s.points) as average_points,
    MIN(s.points) as min_points,
    MAX(s.points) as max_points,
    AVG(s.attendance_rate) as average_attendance
FROM classes c
LEFT JOIN student s ON c.id = s.class_id
WHERE c.is_active = TRUE
GROUP BY c.id;

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES 
('admin@school.edu', '$2b$10$YourHashedPasswordHere', 'admin', 'System', 'Administrator');

-- Create triggers for points history
DELIMITER //

CREATE TRIGGER after_points_update
AFTER UPDATE ON student
FOR EACH ROW
BEGIN
    IF OLD.points != NEW.points THEN
        INSERT INTO points_history (
            student_id,
            teacher_id,
            points_change,
            previous_points,
            new_points,
            category,
            reason,
            comment
        )
        VALUES (
            NEW.id,
            @current_user_id,
            (NEW.points - OLD.points),
            OLD.points,
            NEW.points,
            'Other',
            'Points updated',
            NULL
        );
    END IF;
END//

DELIMITER ; 