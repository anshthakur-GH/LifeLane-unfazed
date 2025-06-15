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
const port = process.env.PORT || 10000;
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

    // Import and use routes from server/index.js
    const { router } = await import('./server/index.js');
    
    // API routes
    app.use('/api', router);

    // Serve static files from the React app
    if (isProduction) {
      app.use(express.static(path.join(__dirname, 'dist')));
      
      // Handle React routing, return all requests to React app
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      });
    }

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Server error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        headers: req.headers
      });
      
      res.status(500).json({ 
        error: 'Internal server error',
        details: isProduction ? undefined : err.message,
        path: req.path,
        method: req.method
      });
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Environment: ${isProduction ? 'Production' : 'Development'}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
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