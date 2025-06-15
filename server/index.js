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

const app = express();
const port = process.env.PORT || 5000;
const upload = multer();
const JWT_SECRET = process.env.JWT_SECRET;

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENROUTER_API_KEY) {
  const OpenAI = (await import('openai')).default;
  openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: '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',
    defaultHeaders: {
      'Authorization': 'Bearer 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',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'LifeLane',
      'Content-Type': 'application/json'
    }
  });
  console.log('OpenRouter chatbot initialized successfully', openai !== null);
} else {
  console.log('OpenRouter chatbot not initialized - API key not provided or environment variable name is incorrect');
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as test');
    res.json({
      success: true,
      message: 'Database connection successful',
      result
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
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
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      JWT_SECRET
    );

    res.json({ 
      token, 
      is_admin: user.is_admin,
      name: user.name 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST: Save new emergency request
app.post('/api/emergency-request', authenticateToken, async (req, res) => {
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
app.get('/api/emergency-requests/user', authenticateToken, async (req, res) => {
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
app.get('/api/emergency-requests', authenticateToken, isAdmin, async (req, res) => {
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
app.put('/api/emergency-requests/:id', authenticateToken, isAdmin, async (req, res) => {
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
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const [updatedRequest] = await pool.query(
      'SELECT * FROM emergency_requests WHERE id = ?',
      [req.params.id]
    );

    res.json(updatedRequest[0]);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// GET: Get single request by ID
app.get('/api/emergency-requests/:id', authenticateToken, async (req, res) => {
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

// Load chatbot intents
const chatbotIntents = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'chatbot_intents.json'), 'utf8'));

// Chatbot endpoint
app.post('/api/chat', async (req, res) => {
  const { message: userMessage } = req.body;
  
  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  console.log('Chat request received:', userMessage);
  
  try {
    // Check if the message is a greeting
    const isGreeting = /^(hi|hello|hey|hii|hiii|hiiii)$/i.test(userMessage.trim());
    
    if (isGreeting) {
      console.log('Greeting detected, returning standard response');
      return res.json({ 
        response: "Hello! I'm LifeBot, your emergency response assistant. How can I help you today?"
      });
    }

    console.log('Making OpenRouter API call...');
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        { 
          role: "system", 
          content: `You are LifeBot, a professional and helpful assistant for LifeLane. Your responses must be:
1. Short and concise (max 2-3 sentences)
2. Professional but friendly
3. Focused on emergency response and LifeLane services
4. Never explain your thinking process
5. Never use phrases like "I understand" or "I see"

Key points about LifeLane:
- Turns private cars into emergency vehicles during medical emergencies
- Emergency requests are verified by admin team
- Approved requests get a 5-minute siren activation code
- 24/7 support: lifelanesupport@gmail.com or +91 73938 00862
- Misuse may result in account suspension or legal action

Example responses:
User: "How does it work?"
Assistant: "LifeLane lets you activate emergency sirens on your car during medical emergencies. Submit a request, get verified, and receive a 5-minute activation code."

User: "I need help"
Assistant: "For immediate assistance, please contact our 24/7 support at +91 73938 00862 or email lifelanesupport@gmail.com."`
        },
        { role: "user", content: userMessage }
      ],
      max_tokens: 50,
      temperature: 0.7
    });

    console.log('OpenRouter response received:', JSON.stringify(completion, null, 2));
    
    // Get the message from the completion
    const assistantMessage = completion?.choices?.[0]?.message;
    
    // If we have content, use it
    if (assistantMessage?.content) {
      const response = assistantMessage.content.trim();
      // Remove any reasoning or thinking process from the response
      const cleanResponse = response.split('\n')[0].trim();
      console.log('Sending response:', cleanResponse);
      return res.json({ response: cleanResponse });
    }
    
    // If no content but we have reasoning, use the first line of reasoning
    if (assistantMessage?.reasoning) {
      console.log('Using reasoning as fallback');
      const reasoningLines = assistantMessage.reasoning.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('We are') && !line.startsWith('The user') && !line.startsWith('This is') && !line.startsWith('User said'));
      
      if (reasoningLines.length > 0) {
        const response = reasoningLines[0].trim();
        console.log('Sending fallback response:', response);
        return res.json({ response });
      }
    }
    
    // If we get here, we couldn't get a valid response
    console.error('Invalid response structure:', JSON.stringify(completion, null, 2));
    throw new Error('Invalid response structure from OpenRouter');
  } catch (error) {
    console.error('OpenRouter API error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      stack: error.stack,
      response: error.response?.data
    });
    
    res.status(500).json({ 
      error: 'Failed to get response from chatbot',
      details: error.message || 'Unknown error occurred'
    });
  }
});

// Create a new emergency request
app.post('/api/emergency-requests', async (req, res) => {
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

// POST: Upload driving license
app.post('/api/upload-license', authenticateToken, async (req, res) => {
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
app.get('/api/driving-license', authenticateToken, async (req, res) => {
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
app.get('/api/test-chat', async (req, res) => {
  try {
    console.log('Testing OpenRouter connection...');
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        { role: "user", content: "Say hello" }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });
    
    console.log('OpenRouter test response:', completion);
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenRouter test error:', error);
    res.status(500).json({ 
      error: 'OpenRouter test failed',
      details: error.message,
      stack: error.stack
    });
  }
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
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