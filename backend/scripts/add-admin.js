const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function addAdmin(email, password, firstName, lastName) {
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

        // Insert new admin user
        const [result] = await connection.execute(
            `INSERT INTO users (email, password_hash, role, first_name, last_name) 
             VALUES (?, ?, 'admin', ?, ?)`,
            [email, hashedPassword, firstName, lastName]
        );

        if (result.affectedRows > 0) {
            console.log('✅ Admin user created successfully');
            console.log('New admin details:');
            console.log(`Email: ${email}`);
            console.log(`Name: ${firstName} ${lastName}`);
        } else {
            console.error('❌ Failed to create admin user');
        }

        await connection.end();
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.error('❌ Error: Email already exists');
        } else {
            console.error('Error creating admin:', err);
            console.error('Details:', err.message);
        }
        process.exit(1);
    }
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 4) {
    console.log('Usage: node add-admin.js <email> <password> <firstName> <lastName>');
    console.log('Example: node add-admin.js newadmin@school.edu admin123 John Doe');
    process.exit(1);
}

const [email, password, firstName, lastName] = args;
addAdmin(email, password, firstName, lastName); 