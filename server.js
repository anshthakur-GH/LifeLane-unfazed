import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bodyParser from 'body-parser';
import { pool, initializeDatabase } from './server/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database with retry logic
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, 'dist')));

    // Import and use routes from server/index.js
    import('./server/index.js').then(({ router }) => {
      app.use('/api', router);

      // Error handling middleware
      app.use((err, req, res, next) => {
        console.error('Server error:', err);
        res.status(500).json({ 
          error: 'Internal server error',
          message: isProduction ? 'Something went wrong' : err.message
        });
      });

      // Handle React routing, return all requests to React app
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      });

      // Start the server
      app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
      });
    }).catch(error => {
      console.error('Failed to load routes:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process in production
  if (!isProduction) {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in production
  if (!isProduction) {
    process.exit(1);
  }
});

// Start the server
startServer(); 