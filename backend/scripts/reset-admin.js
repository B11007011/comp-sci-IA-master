const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetAdmin() {
    // Hardcode the values for now
    const email = 'admin@school.edu';
    const password = 'admin123';

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

        // Hash the password
        const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update or create admin user
        const [result] = await connection.execute(
            `INSERT INTO users (email, password_hash, role, first_name, last_name) 
             VALUES (?, ?, 'admin', 'System', 'Administrator')
             ON DUPLICATE KEY UPDATE password_hash = ?`,
            [email, hashedPassword, hashedPassword]
        );

        if (result.affectedRows > 0) {
            console.log('✅ Admin user created/updated successfully');
            console.log('You can now login with:');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        } else {
            console.error('❌ Failed to update admin user');
        }

        await connection.end();
    } catch (err) {
        console.error('Error resetting admin:', err);
        console.error('Details:', err.message);
        process.exit(1);
    }
}

resetAdmin(); 