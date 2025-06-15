import { pool } from './db.js';

async function createTables() {
  try {
    // Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE
      )
    `);

    console.log('Messages table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createTables(); 