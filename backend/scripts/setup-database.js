const mysql = require('mysql2/promise');

async function setupDatabase() {
    try {
        // Create database connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '01470258Qui**'
        });

        // Create database if not exists
        await connection.query('CREATE DATABASE IF NOT EXISTS crud');
        console.log('Database created or already exists');

        // Use the database
        await connection.query('USE crud');

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created or already exists');

        // Create classes table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS classes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            )
        `);
        console.log('Classes table created or already exists');

        // Create student table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS student (
                id INT AUTO_INCREMENT PRIMARY KEY,
                Name VARCHAR(255) NOT NULL,
                Email VARCHAR(255) NOT NULL,
                class_id INT,
                points INT DEFAULT 0,
                FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
            )
        `);
        console.log('Student table created or already exists');

        // Create appraisals table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS appraisals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                points INT NOT NULL,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
            )
        `);
        console.log('Appraisals table created or already exists');

        // Create points_history table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS points_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                points_change INT NOT NULL,
                reason VARCHAR(255),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
            )
        `);
        console.log('Points history table created or already exists');

        await connection.end();
        console.log('Database setup completed successfully');
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase(); 