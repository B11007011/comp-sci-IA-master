const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

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
    host: 'localhost',
    user: 'root',
    password: '01470258Qui**',
    database: 'crud',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0
});

// Get a promise-based connection
const promisePool = pool.promise();

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
                Name as name,
                Email as email,
                COALESCE(points, 0) as points 
            FROM student 
            WHERE class_id = ? 
            ORDER BY id DESC 
            LIMIT 5`,
            [classId]
        );

        const responseData = {
            id: classDetails[0].id,
            name: classDetails[0].name,
            student_count: parseInt(classDetails[0].student_count),
            average_points: parseFloat(classDetails[0].average_points) || 0,
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
        const [rows] = await promisePool.query("SELECT * FROM student");
        res.json(rows);
    } catch (err) {
        console.error('Query error:', err);
        res.status(500).json({ error: "Database error" });
    }
});

app.post('/students', async (req, res) => {
    try {
        const sql = "INSERT INTO student (`Name`, `Email`, `class_id`) VALUES (?, ?, ?)";
        const [result] = await promisePool.query(sql, [req.body.name, req.body.email, req.body.class_id]);
        res.json({ message: "Created successfully", data: result });
    } catch (err) {
        console.error('Create error:', err);
        res.status(500).json({ error: "Error creating record" });
    }
});

app.put('/students/:id', async (req, res) => {
    try {
        const sql = "UPDATE student SET `Name` = ?, `Email` = ?, `class_id` = ? WHERE id = ?";
        const [result] = await promisePool.query(sql, [req.body.name, req.body.email, req.body.class_id, req.params.id]);
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
                s.Name as name,
                c.name as class,
                COALESCE(s.points, 0) as points,
                s.Email as email
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
app.post('/students/:id/points', async (req, res) => {
    try {
        console.log('Adding/removing points for student:', req.params.id, req.body);
        const { points, reason, comment } = req.body;
        
        // First update the student's points
        const updateSql = `
            UPDATE student 
            SET points = points + ? 
            WHERE id = ?
        `;
        await promisePool.query(updateSql, [points, req.params.id]);
        
        // Then record the points history
        const historySql = `
            INSERT INTO points_history (student_id, points_change, reason, comment) 
            VALUES (?, ?, ?, ?)
        `;
        await promisePool.query(historySql, [req.params.id, points, reason, comment]);
        
        console.log('Points updated successfully');
        res.json({ message: "Points updated successfully" });
    } catch (err) {
        console.error('Error updating points:', err);
        res.status(500).json({ error: "Error updating points: " + err.message });
    }
});

// Get student summary
app.get('/students/:id/summary', async (req, res) => {
    try {
        console.log('Fetching summary for student:', req.params.id);
        
        // Get student details
        const [student] = await promisePool.query(`
            SELECT 
                s.id,
                s.Name as name,
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
                reason,
                comment,
                created_at
            FROM points_history
            WHERE student_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        `, [req.params.id]);
        
        // Get points distribution by reason
        const [distribution] = await promisePool.query(`
            SELECT 
                reason,
                SUM(points_change) as total
            FROM points_history
            WHERE student_id = ?
            GROUP BY reason
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
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});