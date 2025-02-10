const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Add request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    next();
});

app.use(express.json());

// Configure CORS properly
app.use(cors());  // Allow all origins and methods

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
});

// Get a promise-based connection
const promisePool = pool.promise();

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Auth endpoints
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Get user from database
        const [users] = await promisePool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        const user = users[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        // Update last login
        await promisePool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name
            },
            token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Error during login' });
    }
});

app.get('/auth/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await promisePool.query(
            'SELECT id, email, role, first_name, last_name FROM users WHERE id = ?',
            [req.user.id]
        );

        const user = users[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name
        });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// Class Management Endpoints
app.get("/classes", async (req, res) => {
    try {
        console.log('Fetching all classes');
        const [rows] = await promisePool.query("SELECT * FROM classes");
        console.log('Classes fetched:', rows);
        res.json(rows);
    } catch (err) {
        console.error('Query error:', err);
        res.status(500).json({ error: "Database error: " + err.message });
    }
});

app.post('/classes', async (req, res) => {
    try {
        console.log('Creating new class with data:', req.body);
        if (!req.body.name) {
            return res.status(400).json({ error: "Class name is required" });
        }
        const sql = "INSERT INTO classes (`name`) VALUES (?)";
        const [result] = await promisePool.query(sql, [req.body.name]);
        console.log('Class created successfully:', result);
        res.json({ message: "Class created successfully", id: result.insertId });
    } catch (err) {
        console.error('Create error:', err);
        res.status(500).json({ error: "Error creating class: " + err.message });
    }
});

app.put('/classes/:id', async (req, res) => {
    try {
        const sql = "UPDATE classes SET `name` = ? WHERE id = ?";
        const [result] = await promisePool.query(sql, [req.body.name, req.params.id]);
        res.json({ message: "Class updated successfully", data: result });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: "Error updating class" });
    }
});

app.delete('/classes/:id', async (req, res) => {
    try {
        const sql = "DELETE FROM classes WHERE id = ?";
        const [result] = await promisePool.query(sql, [req.params.id]);
        res.json({ message: "Class deleted successfully", data: result });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: "Error deleting class" });
    }
});

// Get class details including students
app.get("/classes/:id/details", async (req, res) => {
    try {
        const classId = req.params.id;
        console.log('Fetching details for class:', classId);

        // First check if class exists
        const [classExists] = await promisePool.query(
            "SELECT * FROM classes WHERE id = ?",
            [classId]
        );

        if (!classExists || classExists.length === 0) {
            console.log('Class not found:', classId);
            return res.status(404).json({ 
                error: "Class not found",
                message: `No class found with ID ${classId}`
            });
        }

        // Get class details with student count and average points
        const [classDetails] = await promisePool.query(
            `SELECT 
                c.id,
                c.name,
                c.description,
                c.academic_year,
                c.semester,
                COUNT(DISTINCT s.id) as student_count,
                COALESCE(AVG(s.points), 0) as average_points
            FROM classes c
            LEFT JOIN student s ON s.class_id = c.id
            WHERE c.id = ?
            GROUP BY c.id`,
            [classId]
        );

        if (!classDetails || classDetails.length === 0) {
            return res.status(500).json({ 
                error: "Failed to fetch class details",
                message: "Database query returned no results"
            });
        }

        // Get recent students
        const [students] = await promisePool.query(
            `SELECT 
                id,
                CONCAT(first_name, ' ', last_name) as name,
                email,
                COALESCE(points, 0) as points 
            FROM student 
            WHERE class_id = ? 
            ORDER BY id DESC 
            LIMIT 5`,
            [classId]
        );

        const responseData = {
            ...classDetails[0],
            recent_students: students || []
        };

        res.json(responseData);
    } catch (err) {
        console.error('Error fetching class details:', err);
        res.status(500).json({ 
            error: "Database error",
            message: err.message
        });
    }
});

// Student Management Endpoints
app.get("/students", async (req, res) => {
    try {
        const [rows] = await promisePool.query(`
            SELECT 
                id,
                first_name,
                last_name,
                email,
                class_id,
                student_id,
                points,
                attendance_rate,
                is_active
            FROM student
        `);
        res.json(rows);
    } catch (err) {
        console.error('Query error:', err);
        res.status(500).json({ error: "Database error" });
    }
});

app.post('/students', async (req, res) => {
    try {
        const sql = `
            INSERT INTO student (
                first_name, 
                last_name, 
                email, 
                class_id,
                gender
            ) VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await promisePool.query(sql, [
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.class_id,
            req.body.gender || 'Other'
        ]);
        res.json({ message: "Created successfully", data: result });
    } catch (err) {
        console.error('Create error:', err);
        res.status(500).json({ error: "Error creating record" });
    }
});

app.put('/students/:id', async (req, res) => {
    try {
        const sql = `
            UPDATE student 
            SET first_name = ?, 
                last_name = ?, 
                email = ?, 
                class_id = ?
            WHERE id = ?
        `;
        const [result] = await promisePool.query(sql, [
            req.body.first_name,
            req.body.last_name,
            req.body.email,
            req.body.class_id,
            req.params.id
        ]);
        res.json({ message: "Updated successfully", data: result });
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: "Error updating record" });
    }
});

app.get("/students/:id", async (req, res) => {
    try {
        console.log('Fetching student data for ID:', req.params.id);
        const sql = `
            SELECT 
                s.id,
                s.first_name,
                s.last_name,
                s.email,
                s.class_id,
                c.name as class_name,
                s.points,
                s.attendance_rate
            FROM student s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.id = ?
        `;
        const [rows] = await promisePool.query(sql, [req.params.id]);
        
        if (rows.length === 0) {
            console.log('Student not found');
            res.status(404).json({ error: "Student not found" });
            return;
        }
        
        console.log('Student data found:', rows[0]);
        res.json(rows[0]);
    } catch (err) {
        console.error('Query error:', err);
        res.status(500).json({ error: "Database error: " + err.message });
    }
});

// Points Management Endpoints
app.post('/students/:id/points', authenticateToken, async (req, res) => {
    try {
        console.log('Adding/removing points for student:', req.params.id);
        console.log('Request body:', req.body);
        console.log('Authenticated user:', req.user);
        
        const { points, reason, comment, category } = req.body;
        const teacher_id = req.user.id;  // Get teacher_id from authenticated user
        const student_id = req.params.id;
        
        console.log('Parsed data:', { points, reason, comment, category, teacher_id });

        // Get current points
        const [currentPoints] = await promisePool.query(
            'SELECT points FROM student WHERE id = ?',
            [student_id]
        );

        if (!currentPoints || currentPoints.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        const previous_points = currentPoints[0].points;
        const new_points = previous_points + points;
        
        // First update the student's points
        const updateSql = `
            UPDATE student 
            SET points = ? 
            WHERE id = ?
        `;
        console.log('Executing update SQL:', updateSql, [new_points, student_id]);
        await promisePool.query(updateSql, [new_points, student_id]);
        
        // Then record the points history
        const historySql = `
            INSERT INTO points_history (
                student_id, 
                teacher_id,
                points_change, 
                previous_points,
                new_points,
                category,
                reason, 
                comment
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        console.log('Executing history SQL:', historySql, [
            student_id, teacher_id, points, previous_points, 
            new_points, category, reason, comment
        ]);
        await promisePool.query(historySql, [
            student_id,
            teacher_id,
            points,
            previous_points,
            new_points,
            category,
            reason,
            comment
        ]);

        // Also record in appraisals table
        const appraisalSql = `
            INSERT INTO appraisals (
                student_id,
                teacher_id,
                points,
                category,
                comment
            ) VALUES (?, ?, ?, ?, ?)
        `;
        console.log('Executing appraisal SQL:', appraisalSql, [student_id, teacher_id, points, category, comment]);
        await promisePool.query(appraisalSql, [
            student_id,
            teacher_id,
            points,
            category,
            comment
        ]);
        
        console.log('Points updated successfully');
        res.json({ 
            message: "Points updated successfully",
            previous_points,
            new_points
        });
    } catch (err) {
        console.error('Error updating points:', err);
        console.error('Error details:', {
            code: err.code,
            errno: err.errno,
            sqlMessage: err.sqlMessage,
            sqlState: err.sqlState,
            sql: err.sql
        });
        res.status(500).json({ 
            error: "Error updating points",
            details: err.sqlMessage || err.message
        });
    }
});

// Get student summary
app.get('/students/:id/summary', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching summary for student:', req.params.id);
        
        // Get student details
        const [student] = await promisePool.query(`
            SELECT 
                s.id,
                CONCAT(s.first_name, ' ', s.last_name) as name,
                s.points,
                c.name as class_name
            FROM student s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.id = ?
        `, [req.params.id]);
        
        if (!student || student.length === 0) {
            res.status(404).json({ error: "Student not found" });
            return;
        }
        
        // Get points history
        const [history] = await promisePool.query(`
            SELECT 
                points_change,
                category,
                reason,
                comment,
                created_at
            FROM points_history
            WHERE student_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        `, [req.params.id]);
        
        // Get points distribution by category
        const [distribution] = await promisePool.query(`
            SELECT 
                category as reason,
                SUM(points_change) as total
            FROM points_history
            WHERE student_id = ?
            GROUP BY category
            ORDER BY total DESC
        `, [req.params.id]);
        
        console.log('Summary data fetched successfully');
        res.json({
            student: student[0],
            history: history || [],
            distribution: distribution || []
        });
    } catch (err) {
        console.error('Error fetching summary:', err);
        res.status(500).json({ error: "Error fetching summary: " + err.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});