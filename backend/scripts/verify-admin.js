const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyAdmin() {
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('Connected to database');

        // Check if admin user exists
        const [rows] = await connection.execute(
            'SELECT id, email, role FROM users WHERE email = ? AND role = ?',
            ['admin@school.edu', 'admin']
        );

        if (rows.length > 0) {
            console.log('✅ Admin user verified successfully');
            console.log('Admin details:', {
                id: rows[0].id,
                email: rows[0].email,
                role: rows[0].role
            });
        } else {
            console.error('❌ Admin user not found!');
            console.log('Please run npm run init-db to create the admin user');
        }

        await connection.end();
    } catch (err) {
        console.error('Error verifying admin:', err);
        process.exit(1);
    }
}

verifyAdmin(); 