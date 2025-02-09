const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const ADMIN_EMAIL = 'nguyenvanqui291@gmail.com';
const ADMIN_PASSWORD = '01470258';

async function setupAdmin() {
    try {
        // Generate password hash
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // Create database connection
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '01470258Qui**',
            database: 'crud'
        });

        // Update or insert admin user
        const [existingUser] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [ADMIN_EMAIL]
        );

        if (existingUser.length > 0) {
            // Update existing admin
            await connection.execute(
                'UPDATE users SET password_hash = ? WHERE email = ?',
                [passwordHash, ADMIN_EMAIL]
            );
            console.log('Admin user password updated successfully');
        } else {
            // Insert new admin
            await connection.execute(
                'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
                [ADMIN_EMAIL, passwordHash, 'admin']
            );
            console.log('Admin user created successfully');
        }

        await connection.end();
    } catch (error) {
        console.error('Error setting up admin user:', error);
        process.exit(1);
    }
}

setupAdmin(); 