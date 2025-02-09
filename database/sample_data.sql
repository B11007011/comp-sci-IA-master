-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE points_history;
TRUNCATE TABLE appraisals;
TRUNCATE TABLE student;
TRUNCATE TABLE classes;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert sample users (teachers)
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active) VALUES 
('smith.john@school.edu', '$2b$10$YourHashedPasswordHere', 'teacher', 'John', 'Smith', true),
('davis.emma@school.edu', '$2b$10$YourHashedPasswordHere', 'teacher', 'Emma', 'Davis', true),
('wilson.michael@school.edu', '$2b$10$YourHashedPasswordHere', 'teacher', 'Michael', 'Wilson', true);

-- Insert sample classes
INSERT INTO classes (name, description, teacher_id, max_students, is_active, academic_year, semester) VALUES 
('Advanced Mathematics', 'Advanced level mathematics course covering calculus and linear algebra', 1, 25, true, '2023-2024', 'Fall'),
('Physics 101', 'Introductory physics course covering mechanics and thermodynamics', 2, 30, true, '2023-2024', 'Fall'),
('Computer Science Fundamentals', 'Introduction to programming and computer science concepts', 3, 20, true, '2023-2024', 'Fall'),
('Chemistry Basics', 'Introduction to chemistry and laboratory practices', 2, 25, true, '2023-2024', 'Fall'),
('English Literature', 'Study of classic literature and writing skills', 1, 30, true, '2023-2024', 'Fall');

-- Insert sample students
INSERT INTO student (first_name, last_name, email, class_id, student_id, date_of_birth, gender, points, attendance_rate, is_active, notes) VALUES 
('John', 'Doe', 'john.doe@student.edu', 1, 'STU001', '2005-03-15', 'M', 85, 98.5, true, 'Excellent in mathematics'),
('Jane', 'Smith', 'jane.smith@student.edu', 1, 'STU002', '2005-06-22', 'F', 92, 100.0, true, 'Outstanding academic performance'),
('Bob', 'Wilson', 'bob.wilson@student.edu', 2, 'STU003', '2005-09-10', 'M', 78, 95.0, true, 'Good practical skills'),
('Alice', 'Brown', 'alice.brown@student.edu', 2, 'STU004', '2005-12-05', 'F', 95, 97.5, true, 'Exceptional problem-solving abilities'),
('Charlie', 'Davis', 'charlie.davis@student.edu', 3, 'STU005', '2005-01-30', 'M', 88, 92.0, true, 'Strong programming skills'),
('Eva', 'Green', 'eva.green@student.edu', 1, 'STU006', '2005-07-18', 'F', 90, 96.0, true, 'Active class participant'),
('Frank', 'White', 'frank.white@student.edu', 2, 'STU007', '2005-04-25', 'M', 82, 94.0, true, 'Shows improvement'),
('Grace', 'Lee', 'grace.lee@student.edu', 3, 'STU008', '2005-11-12', 'F', 94, 99.0, true, 'Natural leader');

-- Insert sample appraisals
INSERT INTO appraisals (student_id, teacher_id, points, category, comment, created_at) VALUES 
(1, 1, 10, 'Academic', 'Excellent performance in calculus test', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(1, 1, 5, 'Participation', 'Active participation in class discussion', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(2, 1, 15, 'Academic', 'Perfect score on midterm exam', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(3, 2, -5, 'Behavior', 'Disrupting class', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(4, 2, 10, 'Leadership', 'Helping other students with lab work', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(5, 3, 20, 'Academic', 'Outstanding programming project', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(6, 1, 8, 'Participation', 'Regular contributions to class discussions', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(7, 2, -3, 'Behavior', 'Late to class multiple times', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8, 3, 12, 'Leadership', 'Organizing study groups', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Insert sample points history
INSERT INTO points_history (student_id, teacher_id, points_change, previous_points, new_points, category, reason, comment, created_at) VALUES 
(1, 1, 10, 75, 85, 'Academic', 'Test Performance', 'Excellent performance in calculus test', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2, 1, 15, 77, 92, 'Academic', 'Exam Performance', 'Perfect score on midterm exam', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(3, 2, -5, 83, 78, 'Behavior', 'Classroom Disruption', 'Disrupting class', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(4, 2, 10, 85, 95, 'Leadership', 'Peer Support', 'Helping other students with lab work', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(5, 3, 20, 68, 88, 'Academic', 'Project Excellence', 'Outstanding programming project', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(6, 1, 8, 82, 90, 'Participation', 'Class Participation', 'Regular contributions to class discussions', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(7, 2, -3, 85, 82, 'Behavior', 'Tardiness', 'Late to class multiple times', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(8, 3, 12, 82, 94, 'Leadership', 'Initiative', 'Organizing study groups', DATE_SUB(NOW(), INTERVAL 1 DAY)); 