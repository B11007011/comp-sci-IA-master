const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function loadSampleData() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            multipleStatements: true // Enable multiple statements
        });

        console.log('Connected to database');

        // Read and execute sample_data.sql
        const sampleDataSql = await fs.readFile(path.join(__dirname, '..', '..', 'database', 'sample_data.sql'), 'utf8');
        
        console.log('Executing sample data script...');
        await connection.query(sampleDataSql);
        console.log('✅ Sample data loaded successfully');

        await connection.end();
    } catch (err) {
        console.error('Error loading sample data:', err);
        console.error('Details:', err.message);
        process.exit(1);
    }
}

loadSampleData(); 