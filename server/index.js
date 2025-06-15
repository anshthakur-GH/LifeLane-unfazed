// LifeLane backend - local JSON storage version
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { pool, initializeDatabase } from './db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { intents } from './chatbot_intents.js';

// Load environment variables
dotenv.config();

// Test environment variables
console.log('=== Environment Variables Test ===');
console.log('Database Configuration:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (hidden for security)' : 'Not set');
console.log('PORT:', process.env.PORT);
console.log('================================');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const port = process.env.PORT || 5000;
const upload = multer();
const JWT_SECRET = process.env.JWT_SECRET;

// Initialize OpenAI only if API key is available
let openai = null;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

console.log('Checking OpenRouter API key:', OPENROUTER_API_KEY ? 'Present' : 'Missing');

if (OPENROUTER_API_KEY) {
  try {
    const OpenAI = (await import('openai')).default;
    openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'https://lifelane-unfazed.onrender.com',
        'X-Title': 'LifeLane',
        'Content-Type': 'application/json'
      },
      timeout: 30000, // 30 second timeout
      maxRetries: 3
    });
    console.log('OpenRouter chatbot initialized successfully');
  } catch (error) {
    console.error('Failed to initialize OpenRouter:', error);
    openai = null;
  }
} else {
  console.error('OpenRouter chatbot not initialized - API key not provided');
}

// Middleware
router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader);

    if (!authHeader) {
      console.error('No authorization header found');
      return res.status(401).json({ error: 'No authorization header found' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('No token found in authorization header');
      return res.status(401).json({ error: 'No token found in authorization header' });
    }

    console.log('Verifying token...');
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification failed:', err.message);
        return res.status(401).json({ error: 'Invalid token' });
      }
      console.log('Token verified for user:', user.id);
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed', details: error.message });
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Test database connection
router.get('/test-db', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as test');
    res.json({ success: true, result });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// POST: Save new emergency request
router.post('/emergency-request', authenticateToken, async (req, res) => {
  try {
    const { patientName, age, problemDescription } = req.body;
    
    if (!patientName || !age || !problemDescription) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO emergency_requests (user_id, patient_name, age, problem_description) VALUES (?, ?, ?, ?)',
      [req.user.id, patientName, age, problemDescription]
    );

    res.json({
      success: true,
      id: result.insertId,
      message: 'Emergency request submitted successfully'
    });
  } catch (error) {
    console.error('Error in request submission:', error);
    res.status(500).json({ error: 'Failed to save emergency request' });
  }
});

// GET: Get user's requests
router.get('/emergency-requests/user', authenticateToken, async (req, res) => {
  try {
    const [requests] = await pool.query(
      'SELECT * FROM emergency_requests WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// GET: Get all requests (admin only)
router.get('/emergency-requests', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [requests] = await pool.query(
      'SELECT er.*, u.email, u.name as user_name FROM emergency_requests er JOIN users u ON er.user_id = u.id ORDER BY er.created_at DESC'
    );
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// PUT: Update request status (admin only)
router.put('/emergency-requests/:requestId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['granted', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // If status is granted, get an unused activation code
    let activationCode = null;
    if (status === 'granted') {
      // Get an unused activation code
      const [codes] = await pool.query(
        'SELECT code FROM activation_codes WHERE used = FALSE LIMIT 1'
      );

      if (codes.length === 0) {
        return res.status(500).json({ error: 'No activation codes available' });
      }

      activationCode = codes[0].code;

      // Mark the code as used and assign it
      await pool.query(
        'UPDATE activation_codes SET used = TRUE, assigned_to = ?, assigned_at = NOW() WHERE code = ?',
        [req.user.id, activationCode]
      );
    }

    const [result] = await pool.query(
      'UPDATE emergency_requests SET status = ?, code = ?, granted_at = ? WHERE id = ?',
      [
        status,
        status === 'granted' ? activationCode : null,
        status === 'granted' ? new Date() : null,
        req.params.requestId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const [updatedRequest] = await pool.query(
      'SELECT * FROM emergency_requests WHERE id = ?',
      [req.params.requestId]
    );

    res.json(updatedRequest[0]);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// GET: Get single request by ID
router.get('/emergency-requests/:id', authenticateToken, async (req, res) => {
  try {
    const [requests] = await pool.query(
      'SELECT * FROM emergency_requests WHERE id = ?',
      [req.params.id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if user is admin or the request owner
    const isAdmin = req.user.is_admin;
    const isOwner = requests[0].user_id === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(requests[0]);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Function to find the best matching intent
function findMatchingIntent(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  // First check for exact matches
  for (const intent of intents) {
    if (intent.patterns.some(pattern => 
      pattern.toLowerCase() === lowerMessage || 
      lowerMessage.includes(pattern.toLowerCase())
    )) {
      return intent;
    }
  }
  
  // Then check for partial matches
  for (const intent of intents) {
    if (intent.patterns.some(pattern => 
      lowerMessage.includes(pattern.toLowerCase())
    )) {
      return intent;
    }
  }
  
  // If no match found, return the default response
  return {
    tag: "default",
    patterns: [],
    responses: ["I'm not sure I understand. Could you please rephrase your question?"]
  };
}

// Routes
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chatbot endpoint
router.post('/chat', authenticateToken, async (req, res) => {
  const { message: userMessage } = req.body;
  
  // Log the incoming request
  console.log('Chat request received:', {
    userId: req.user.id,
    hasMessage: !!userMessage,
    openaiInitialized: !!openai,
    hasApiKey: !!OPENROUTER_API_KEY,
    nodeEnv: process.env.NODE_ENV
  });

  if (!openai) {
    console.error('Chatbot not initialized - OpenAI instance is null');
    return res.status(500).json({ 
      error: 'Chatbot service unavailable',
      details: 'The chatbot service is not properly configured. Please contact support.'
    });
  }

  if (!userMessage) {
    console.error('No message provided in request body');
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    console.log('Preparing OpenRouter API request...', {
      model: 'anthropic/claude-3-haiku-20240307',
      messageLength: userMessage.length
    });

    const completion = await openai.chat.completions.create({
      model: 'anthropic/claude-3-haiku-20240307',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful emergency response assistant for LifeLane. You help users understand how to use the emergency request system and provide guidance during medical emergencies.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    });

    if (!completion.choices || completion.choices.length === 0) {
      console.error('No response received from OpenRouter API');
      return res.status(500).json({ 
        error: 'No response from chatbot',
        details: 'The AI service did not return a valid response'
      });
    }

    console.log('Successfully received response from OpenRouter API');
    res.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    // Enhanced error logging
    console.error('Chat error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code,
      user: req.user.id,
      response: error.response?.data,
      headers: error.response?.headers,
      config: {
        baseURL: openai.baseURL,
        hasApiKey: !!OPENROUTER_API_KEY,
        apiKeyLength: OPENROUTER_API_KEY?.length,
        nodeEnv: process.env.NODE_ENV
      }
    });

    // Handle specific OpenRouter API errors
    if (error.status === 401) {
      console.error('OpenRouter authentication failed:', error.response?.data);
      return res.status(500).json({ 
        error: 'Chatbot authentication failed',
        details: 'Unable to authenticate with the AI service. Please contact support.'
      });
    }

    if (error.status === 429) {
      console.error('OpenRouter rate limit exceeded:', error.response?.data);
      return res.status(500).json({ 
        error: 'Rate limit exceeded',
        details: 'The chatbot service is currently busy. Please try again in a few moments.'
      });
    }

    // Log the full error for debugging
    console.error('Full error object:', JSON.stringify(error, null, 2));

    res.status(500).json({ 
      error: 'Failed to get response from chatbot',
      details: error.message || 'An unexpected error occurred'
    });
  }
});

// User routes
router.post('/users/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    // Generate token
    const token = jwt.sign(
      { id: result.insertId, email, is_admin: false },
      JWT_SECRET
    );

    res.json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
      console.error('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.error('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.error('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email);
    res.json({ 
      token, 
      is_admin: user.is_admin,
      name: user.name 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed', 
      details: error.message 
    });
  }
});

router.get('/users/profile', authenticateToken, async (req, res) => {
  // ... existing code ...
});

router.put('/users/profile', authenticateToken, async (req, res) => {
  // ... existing code ...
});

// Emergency routes
router.post('/emergencies', authenticateToken, async (req, res) => {
  try {
    const { patient_name, problem_description, age } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO emergency_requests (patient_name, problem_description, age, status) VALUES (?, ?, ?, ?)',
      [patient_name, problem_description, age, 'pending']
    );

    const [newRequest] = await pool.query(
      'SELECT * FROM emergency_requests WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newRequest[0]);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

router.get('/emergencies', authenticateToken, async (req, res) => {
  try {
    const [requests] = await pool.query(
      'SELECT * FROM emergency_requests WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.get('/emergencies/:requestId', authenticateToken, async (req, res) => {
  try {
    const [requests] = await pool.query(
      'SELECT * FROM emergency_requests WHERE id = ? AND user_id = ?',
      [req.params.requestId, req.user.id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(requests[0]);
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

router.put('/emergencies/:requestId', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    const [result] = await pool.query(
      'UPDATE emergency_requests SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.requestId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Request updated successfully' });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Admin routes
router.get('/admin/emergencies', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [requests] = await pool.query(
      'SELECT * FROM emergency_requests ORDER BY created_at DESC'
    );
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

router.put('/admin/emergencies/:requestId', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const [result] = await pool.query(
      'UPDATE emergency_requests SET status = ? WHERE id = ?',
      [status, req.params.requestId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ message: 'Request updated successfully' });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// POST: Upload driving license
router.post('/upload-license', authenticateToken, async (req, res) => {
  try {
    const { name, license_number, valid_till } = req.body;
    
    // Validate required fields
    if (!name || !license_number || !valid_till) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already has a license
    const [existingLicense] = await pool.query(
      'SELECT * FROM driving_licenses WHERE user_id = ?',
      [req.user.id]
    );

    if (existingLicense.length > 0) {
      // Update existing license
      await pool.query(
        'UPDATE driving_licenses SET license_name = ?, license_number = ?, license_valid_till = ?, license_uploaded = TRUE WHERE user_id = ?',
        [name, license_number, valid_till, req.user.id]
      );
    } else {
      // Insert new license
      await pool.query(
        'INSERT INTO driving_licenses (user_id, license_name, license_number, license_valid_till, license_uploaded) VALUES (?, ?, ?, ?, TRUE)',
        [req.user.id, name, license_number, valid_till]
      );
    }

    res.json({ message: 'License uploaded successfully' });
  } catch (error) {
    console.error('Error uploading license:', error);
    // Send more detailed error message
    res.status(500).json({ 
      error: 'Failed to upload license',
      details: error.message 
    });
  }
});

// GET: Get user's driving license status
router.get('/driving-license', authenticateToken, async (req, res) => {
  try {
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

    const [license] = await pool.query(
      'SELECT * FROM driving_licenses WHERE user_id = ?',
      [req.user.id]
    );
    
    res.json(license[0] || { license_uploaded: false });
  } catch (error) {
    console.error('Error fetching license:', error);
    // Send more detailed error message
    res.status(500).json({ 
      error: 'Failed to fetch license',
      details: error.message 
    });
  }
});

// Test endpoint for OpenRouter
router.get('/test-chat', async (req, res) => {
  try {
    if (!openai) {
      throw new Error('OpenAI instance not initialized');
    }

    console.log('Testing OpenRouter connection...');
    const completion = await openai.chat.completions.create({
      model: 'anthropic/claude-3-haiku-20240307',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful emergency response assistant.'
        },
        {
          role: 'user',
          content: 'Hello, are you working?'
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    console.log('Test chat response received:', completion.choices[0].message.content);
    res.json({ 
      success: true,
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Test chat error:', {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false,
      error: error.message,
      details: error.response?.data
    });
  }
});

// Test endpoint for OpenRouter configuration
router.get('/test-chat-config', (req, res) => {
  try {
    const config = {
      hasApiKey: !!OPENROUTER_API_KEY,
      apiKeyLength: OPENROUTER_API_KEY ? OPENROUTER_API_KEY.length : 0,
      apiKeyPrefix: OPENROUTER_API_KEY ? OPENROUTER_API_KEY.substring(0, 10) + '...' : null,
      hasOpenAI: !!openai,
      appUrl: process.env.APP_URL || 'https://lifelane-unfazed.onrender.com',
      headers: openai ? openai.defaultHeaders : null,
      nodeEnv: process.env.NODE_ENV,
      baseURL: openai ? openai.baseURL : null,
      openaiConfig: openai ? {
        baseURL: openai.baseURL,
        defaultHeaders: {
          ...openai.defaultHeaders,
          apiKey: '***' // Masked for security
        }
      } : null
    };
    
    console.log('Chat configuration:', config);
    res.json(config);
  } catch (error) {
    console.error('Error in test-chat-config:', error);
    res.status(500).json({
      error: 'Failed to get configuration',
      details: error.message,
      stack: error.stack
    });
  }
});

// Add a test endpoint
router.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Error handling middleware
router.use((err, req, res, next) => {
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
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    path: req.path,
    method: req.method
  });
});

// Initialize database and start server
initializeDatabase().then(() => {
  console.log(`Server running on port ${port}`);
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Global unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, log to a file or a monitoring service
  // process.exit(1); // Exit with a failure code to allow process managers to restart
});

// Export the router
export { router }; 