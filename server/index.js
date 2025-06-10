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

const router = express.Router();
const upload = multer();
const JWT_SECRET = process.env.JWT_SECRET;

// Initialize OpenAI only if API key is available
let openai = null;
if (process.env.OPENROUTER_API_KEY) {
  const OpenAI = (await import('openai')).default;
  openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1/"
  });
  console.log('OpenRouter chatbot initialized successfully', openai !== null);
} else {
  console.log('OpenRouter chatbot not initialized - API key not provided or environment variable name is incorrect');
}

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
router.get('/test-db', async (req, res) => {
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
router.post('/register', async (req, res) => {
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
router.post('/login', async (req, res) => {
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
router.post('/emergency-requests', authenticateToken, async (req, res) => {
  try {
    const { patient_name, age, problem_description } = req.body;
    
    // Validate required fields
    if (!patient_name || !age || !problem_description) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Insert new request
    const [result] = await pool.query(
      'INSERT INTO emergency_requests (user_id, patient_name, age, problem_description) VALUES (?, ?, ?, ?)',
      [req.user.id, patient_name, age, problem_description]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Emergency request created successfully'
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
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
router.put('/emergency-requests/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, code } = req.body;
    const requestId = req.params.id;

    // Validate status
    if (!['pending', 'granted', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // If status is granted, validate code
    if (status === 'granted' && (!code || code.length !== 6)) {
      return res.status(400).json({ error: 'Valid 6-digit code required for granting request' });
    }

    // Update request
    const [result] = await pool.query(
      'UPDATE emergency_requests SET status = ?, code = ?, granted_at = ? WHERE id = ?',
      [status, code, status === 'granted' ? new Date() : null, requestId]
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

// Chatbot endpoint
router.post('/chatbot', async (req, res) => {
  console.log('Chatbot endpoint hit.');
  if (!openai) {
    console.error('Chatbot service not available: OpenAI instance is null.');
    return res.status(500).json({ error: 'Chatbot service not available. OpenRouter API key not configured.' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  console.log('Attempting to get completion from OpenRouter with message:', message);
  try {
    const systemMessage = `You are LifeBot, a professional, helpful, and clear chatbot for LifeLane. Your replies must be short (1-2 lines), direct, and easy to read. Do not use emojis, markdown (like bold or italics), or overly casual tones. Follow these specific instructions for common questions:

- What is LifeLane? LifeLane lets you turn your private car into an emergency vehicle by requesting a verified siren activation code during real medical emergencies.
- How does LifeLane work? You submit an emergency request. After it's verified by our team, you get a one-time-use code to activate your siren device.
- Who verifies my request? Our internal admin team verifies each request manually before issuing a siren code.
- Do you provide ambulances? No. LifeLane helps you use your own vehicle as emergency transport when ambulances aren't available.
- How do I submit an emergency request? Click "Request Emergency" on the app or website and fill in the patient name, age, and emergency details.
- What happens after I submit a request? Your request goes to our admin team. Once approved, you'll receive a one-time code to activate your siren device.
- What if my request is rejected? If your request is dismissed, you'll be notified in your dashboard. You can submit a new request if needed.
- What is a siren code? A siren code is a one-time-use code you receive after approval. Entering it into your LifeLane device activates your siren.
- Can I use the code multiple times? No. Each siren code is valid for one-time use only and expires after a few minutes.
- How long is the code valid? Your siren code is valid for 5 minutes from the time it's issued.
- What if the code doesn't work? Make sure you're entering it correctly. If it still doesn't work, contact support immediately.
- Do I need a device to use LifeLane? Yes. You need the LifeLane siren device installed in your vehicle to use the code and activate the siren.
- How does the device work? The device checks the code you enter against a list of valid ones stored in it. If the code is valid, the siren turns on.
- What if my device isn't responding? Please check the power and re-enter your code. If the problem continues, contact our support team.
- What happens if someone misuses the system? Misuse may result in account suspension, fines, or legal action. LifeLane is only for real emergencies.
- Is it legal to use a siren on a private vehicle? You can only activate the siren after verified approval and with a valid code. Misuse is strictly prohibited.
- Where can I see my past requests? Go to your dashboard to view all your requests and their current status.
- What does "pending" mean? Your request has been submitted and is waiting for admin verification.
- What does "granted" mean? Your request was approved and a siren code has been issued.
- What does "dismissed" mean? Your request was reviewed but not approved. You can submit a new one if needed.
- How do I contact support? You can email us at lifelanesupport@gmail.com or call +91 73938 00862.
- Is someone available in emergencies? Yes. Our support team is available 24/7 to assist with code issues or emergency requests.
- I have a different question. I'm here to help! Please ask your question or contact support for more detailed assistance.
- Thank you. You're welcome. Stay safe.

For any other questions, provide a short, direct answer consistent with the persona.`;

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: message }
      ],
      // Optional: Add HTTP-Referer and X-Title for OpenRouter rankings
      // headers: {
      //   "HTTP-Referer": "YOUR_SITE_URL", 
      //   "X-Title": "YOUR_SITE_NAME"
      // }
    });

    res.json({
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenRouter API error:', error);
    res.status(500).json({ error: 'Failed to get response from chatbot.' });
  }
});

// Initialize database
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

export default router; 