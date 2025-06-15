import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create emergency_requests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS emergency_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        problem_description TEXT NOT NULL,
        status ENUM('pending', 'granted', 'dismissed') DEFAULT 'pending',
        code VARCHAR(6),
        granted_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create admin user if not exists
    const [adminExists] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@gmail.com']
    );

    if (adminExists.length === 0) {
      // Hash the admin password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Create admin user with specified credentials
      await pool.query(
        'INSERT INTO users (email, password, name, is_admin) VALUES (?, ?, ?, ?)',
        ['admin@gmail.com', hashedPassword, 'Admin User', true]
      );
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export { pool, initializeDatabase }; 