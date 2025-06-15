import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

const pool = mysql.createPool({
  host: 'yamabiko.proxy.rlwy.net',
  port: 17322,
  user: 'root',
  password: 'sFeHMLsfOPmNaQABICREOZqMEZSyrJOF',
  database: 'railway',
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

    // Create activation_codes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activation_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        assigned_to VARCHAR(255) NULL,
        assigned_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed activation codes if table is empty
    const [existingCodes] = await pool.query('SELECT COUNT(*) as count FROM activation_codes');
    if (existingCodes[0].count === 0) {
      const activationCodes = [
        "A1B2#", "C3D4#", "1A2B#", "B4C3#", "D1C2#", "3B2A#", "4D1A#", "B3C1#", "C2D3#", "A3B4#",
        "1B2C#", "D4A1#", "2C1D#", "3A4B#", "B1C2#", "C4D1#", "4B3A#", "D2C1#", "A2B3#", "3C1D#",
        "1C2A#", "B2D3#", "C3A1#", "D1B2#", "A4C3#", "2D1B#", "3B2D#", "C1A4#", "D3C2#", "B4A1#",
        "A1D2#", "C2B3#", "3A1C#", "D4B2#", "B3A2#", "C1D4#", "2A3B#", "D3C1#", "A2C3#", "B1D4#",
        "1A3D#", "C4B1#", "2B1A#", "D2C4#", "3D2A#", "A3B1#", "C1D3#", "B4C2#", "1D4B#", "A2B1#",
        "B2C3#", "D1A3#", "3C2B#", "A4D1#", "C3B4#", "D2A1#", "B1C4#", "2A4D#", "C2D3#", "B3A1#",
        "1B3D#", "A3C2#", "C1B2#", "D4A3#", "2D3B#", "B4C1#", "A1B3#", "C3D2#", "D2B4#", "3A2C#",
        "B1D3#", "C4A1#", "A2C4#", "D1B3#", "4B2A#", "C1A3#", "D3B1#", "A4C2#", "2C3B#", "B2D1#",
        "A3B2#", "C2D4#", "D4C1#", "B3A4#", "1C4D#", "A1D3#", "C3B2#", "D2A4#", "B4D3#", "C1B3#",
        "2A1C#", "D4C3#", "A2B4#", "B1C3#", "C4A2#", "D3A1#", "3B1C#", "A4D2#", "B3C4#", "C2A1#"
      ];

      // Use INSERT IGNORE to skip duplicate entries
      for (const code of activationCodes) {
        await pool.query(
          'INSERT IGNORE INTO activation_codes (code) VALUES (?)',
          [code]
        );
      }
      console.log('Activation codes seeded successfully');
    }

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