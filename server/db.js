import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Immediately attempt to drop vehicle_number column from driving_licenses on backend startup
(async () => {
  try {
    await pool.query('ALTER TABLE driving_licenses DROP COLUMN vehicle_number');
    console.log('Directly dropped vehicle_number column from driving_licenses table');
  } catch (error) {
    if (
      !error.message.includes('check that column/key exists') &&
      !error.message.includes('1091') &&
      !error.message.includes("doesn't exist") &&
      !error.message.includes('Unknown column')
    ) {
      console.error('Error directly dropping vehicle_number column:', error);
    }
  }
})();

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Initialize database tables
async function initializeDatabase() {
  let retries = 5;
  let connected = false;

  while (retries > 0 && !connected) {
    connected = await testConnection();
    if (!connected) {
      console.log(`Retrying database connection... (${retries} attempts remaining)`);
      retries--;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
    }
  }

  if (!connected) {
    throw new Error('Failed to connect to database after multiple attempts');
  }

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
        hospital_name VARCHAR(255) NOT NULL,
        hospital_location VARCHAR(255) NOT NULL,
        status ENUM('pending', 'granted', 'dismissed') DEFAULT 'pending',
        code VARCHAR(6),
        granted_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // First check if the table exists
    const [tables] = await pool.query(
      'SHOW TABLES LIKE "driving_licenses"'
    );

    if (tables.length === 0) {
      // Table doesn't exist, create it
      await pool.query(`
        CREATE TABLE IF NOT EXISTS driving_licenses (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          license_name VARCHAR(255) NOT NULL,
          license_number VARCHAR(50) NOT NULL,
          license_valid_till DATE NOT NULL,
          license_uploaded BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
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

    // Add hospital_name and hospital_location columns if they don't exist (nullable for migration safety)
    try {
      await pool.query(`
        ALTER TABLE emergency_requests
        ADD COLUMN hospital_name VARCHAR(255) NULL,
        ADD COLUMN hospital_location VARCHAR(255) NULL
      `);
      console.log('Added hospital_name and hospital_location columns to emergency_requests table');
    } catch (error) {
      // Columns might already exist, which is fine
      if (!error.message.includes('Duplicate column name') && !error.message.includes('Duplicate column') && !error.message.includes('1060')) {
        console.error('Error adding hospital_name/hospital_location columns:', error);
      }
    }
    // Backfill NULLs to empty string for existing rows
    try {
      await pool.query(`UPDATE emergency_requests SET hospital_name = '' WHERE hospital_name IS NULL`);
      await pool.query(`UPDATE emergency_requests SET hospital_location = '' WHERE hospital_location IS NULL`);
    } catch (error) {
      console.error('Error backfilling hospital_name/hospital_location:', error);
    }
    // Make columns NOT NULL after backfill
    try {
      await pool.query(`
        ALTER TABLE emergency_requests
        MODIFY COLUMN hospital_name VARCHAR(255) NOT NULL,
        MODIFY COLUMN hospital_location VARCHAR(255) NOT NULL
      `);
      console.log('Set hospital_name and hospital_location columns to NOT NULL');
    } catch (error) {
      if (!error.message.includes('Duplicate column name') && !error.message.includes('Duplicate column') && !error.message.includes('1060')) {
        console.error('Error setting hospital_name/hospital_location to NOT NULL:', error);
      }
    }

    // Restore license_number column to driving_licenses if it does not exist
    try {
      await pool.query('ALTER TABLE driving_licenses ADD COLUMN license_number VARCHAR(50)');
      console.log('Restored license_number column to driving_licenses table');
    } catch (error) {
      // Ignore error if column already exists
      if (!error.message.includes('Duplicate column name') && !error.message.includes('1060')) {
        console.error('Error restoring license_number column:', error);
      }
    }

    // Forcefully drop vehicle_number column from driving_licenses if it exists
    try {
      await pool.query('ALTER TABLE driving_licenses DROP COLUMN vehicle_number');
      console.log('Force-dropped vehicle_number column from driving_licenses table');
    } catch (error) {
      // Ignore error if column doesn't exist
      if (
        !error.message.includes('check that column/key exists') &&
        !error.message.includes('1091') &&
        !error.message.includes("doesn't exist") &&
        !error.message.includes('Unknown column')
      ) {
        console.error('Error force-dropping vehicle_number column:', error);
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Handle database connection errors
pool.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect to database...');
    initializeDatabase().catch(console.error);
  }
});

export { pool, initializeDatabase }; 