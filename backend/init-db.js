const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    try {
        // Create connection without database
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: process.env.DB_PORT
        });

        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`Database ${process.env.DB_NAME} created or already exists`);

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME}`);

        // Read and execute setup.sql
        const setupSql = await fs.readFile(path.join(__dirname, '..', 'database', 'setup.sql'), 'utf8');
        const statements = setupSql.split(';').filter(stmt => stmt.trim());

        for (let statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
            }
        }

        console.log('Database schema created successfully');

        // Read and execute sample_data.sql if it exists
        try {
            const sampleDataSql = await fs.readFile(path.join(__dirname, '..', 'database', 'sample_data.sql'), 'utf8');
            const sampleStatements = sampleDataSql.split(';').filter(stmt => stmt.trim());

            for (let statement of sampleStatements) {
                if (statement.trim()) {
                    await connection.query(statement);
                }
            }
            console.log('Sample data inserted successfully');
        } catch (err) {
            console.log('No sample data file found or error inserting sample data');
        }

        await connection.end();
        console.log('Database initialization completed');
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initializeDatabase(); 