/**
 * server.js - Authentication Backend Server
 * Handles user registration, login, and JWT token management
 */

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'quantum-learning-secret-key-change-in-production';
const DB_PATH = 'quantum-learning.db';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize SQLite Database
let db;
const SQL = await initSqlJs();

// Load or create database
if (fs.existsSync(DB_PATH)) {
  const buffer = fs.readFileSync(DB_PATH);
  db = new SQL.Database(buffer);
} else {
  db = new SQL.Database();
}

// Helper to save database to disk
function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Create users table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified INTEGER DEFAULT 0,
    verification_code TEXT,
    verification_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )
`);

// Create user progress table
db.run(`
  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    circuit_data TEXT,
    challenges_completed TEXT DEFAULT '[]',
    lectures_viewed TEXT DEFAULT '[]',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

saveDatabase();

// Email configuration
let transporter = null;

// Only create transporter if email credentials are provided
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  console.log('📧 Email service configured:', process.env.EMAIL_USER);
} else {
  console.log('⚠️  Email disabled - Verification codes will appear in console only');
}

// Generate 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email, username, code) {
  // If no transporter configured, skip email sending
  if (!transporter) {
    console.error('❌ Email transporter not configured');
    return { success: false, error: 'Email not configured' };
  }

  console.log(`📤 Attempting to send email to: ${email}`);

  const mailOptions = {
    from: `"QuantumAlgo Platform" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your QuantumAlgo Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0a0f1d 0%, #1a1f3d 100%); color: #f8fafc; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #38bdf8; font-size: 32px; margin: 0;">⚛ QuantumAlgo</h1>
          <p style="color: #94a3b8; margin-top: 8px;">Interactive Quantum Learning Platform</p>
        </div>

        <div style="background: rgba(15, 23, 42, 0.75); padding: 30px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.15);">
          <h2 style="color: #f8fafc; margin-top: 0;">Welcome, ${username}!</h2>
          <p style="color: #cbd5e1; line-height: 1.6;">Thank you for signing up. Please verify your email address to activate your account and start your quantum computing journey.</p>

          <div style="background: rgba(56, 189, 248, 0.1); border: 2px solid #38bdf8; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
            <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">Your Verification Code</p>
            <h1 style="color: #38bdf8; margin: 0; font-size: 42px; letter-spacing: 8px; font-weight: bold;">${code}</h1>
          </div>

          <p style="color: #cbd5e1; line-height: 1.6;">Enter this code in the verification screen to complete your registration. This code will expire in <strong style="color: #f8fafc;">15 minutes</strong>.</p>

          <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(56, 189, 248, 0.15);">
            If you didn't create this account, please ignore this email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
          <p>© 2026 QuantumAlgo Platform. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    console.log('📧 Sending email via SMTP...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
    console.log('   To:', email);
    console.log('   Code:', code);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send failed!');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Response:', error.response);
    return { success: false, error: error.message };
  }
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists
    const existingUser = db.exec('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser[0]?.values.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Insert new user (not verified yet)
    db.run(
      'INSERT INTO users (username, email, password_hash, verification_code, verification_expires) VALUES (?, ?, ?, ?, ?)',
      [username, email, passwordHash, verificationCode, verificationExpires]
    );
    saveDatabase();

    // Get the inserted user ID
    const userResult = db.exec('SELECT id FROM users WHERE username = ?', [username]);
    const userId = userResult[0].values[0][0];

    // Send verification email
    const emailResult = await sendVerificationEmail(email, username, verificationCode);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Return error if email fails
      return res.status(500).json({ error: 'Failed to send verification email. Please check server configuration.' });
    }

    console.log(`✅ Verification email sent to ${email}`);

    res.status(201).json({
      message: 'Registration successful. Please check your email for verification code.',
      userId,
      email,
      requiresVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username or email
    const userResult = db.exec('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);

    if (!userResult[0] || userResult[0].values.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const columns = userResult[0].columns;
    const values = userResult[0].values[0];
    const user = {};
    columns.forEach((col, idx) => {
      user[col] = values[idx];
    });

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email is verified
    if (user.email_verified !== 1) {
      return res.status(403).json({
        error: `Email not verified. Please check ${user.email} for the verification code.`,
        requiresVerification: true,
        userId: user.id,
        email: user.email
      });
    }

    // Update last login
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    saveDatabase();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile (protected route)
app.get('/api/profile', authenticateToken, (req, res) => {
  try {
    const userResult = db.exec('SELECT id, username, email, created_at, last_login FROM users WHERE id = ?', [req.user.userId]);

    if (!userResult[0] || userResult[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const columns = userResult[0].columns;
    const values = userResult[0].values[0];
    const user = {};
    columns.forEach((col, idx) => {
      user[col] = values[idx];
    });

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save user progress (protected route)
app.post('/api/progress', authenticateToken, (req, res) => {
  try {
    const { circuitData, challengesCompleted, lecturesViewed } = req.body;

    const existingProgress = db.exec('SELECT * FROM user_progress WHERE user_id = ?', [req.user.userId]);

    if (existingProgress[0]?.values.length > 0) {
      db.run(`
        UPDATE user_progress
        SET circuit_data = ?,
            challenges_completed = ?,
            lectures_viewed = ?,
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [
        JSON.stringify(circuitData),
        JSON.stringify(challengesCompleted),
        JSON.stringify(lecturesViewed),
        req.user.userId
      ]);
    } else {
      db.run(`
        INSERT INTO user_progress (user_id, circuit_data, challenges_completed, lectures_viewed)
        VALUES (?, ?, ?, ?)
      `, [
        req.user.userId,
        JSON.stringify(circuitData),
        JSON.stringify(challengesCompleted),
        JSON.stringify(lecturesViewed)
      ]);
    }

    saveDatabase();
    res.json({ message: 'Progress saved successfully' });
  } catch (error) {
    console.error('Progress save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user progress (protected route)
app.get('/api/progress', authenticateToken, (req, res) => {
  try {
    const progressResult = db.exec('SELECT * FROM user_progress WHERE user_id = ?', [req.user.userId]);

    if (!progressResult[0] || progressResult[0].values.length === 0) {
      return res.json({
        circuitData: null,
        challengesCompleted: [],
        lecturesViewed: []
      });
    }

    const columns = progressResult[0].columns;
    const values = progressResult[0].values[0];
    const progress = {};
    columns.forEach((col, idx) => {
      progress[col] = values[idx];
    });

    res.json({
      circuitData: progress.circuit_data ? JSON.parse(progress.circuit_data) : null,
      challengesCompleted: JSON.parse(progress.challenges_completed),
      lecturesViewed: JSON.parse(progress.lectures_viewed),
      lastUpdated: progress.last_updated
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
app.get('/api/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Verify email endpoint
app.post('/api/verify-email', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and verification code are required' });
    }

    // Get user
    const userResult = db.exec('SELECT * FROM users WHERE id = ?', [userId]);

    if (!userResult[0] || userResult[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const columns = userResult[0].columns;
    const values = userResult[0].values[0];
    const user = {};
    columns.forEach((col, idx) => {
      user[col] = values[idx];
    });

    // Check if already verified
    if (user.email_verified === 1) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Check if code matches
    if (user.verification_code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Check if code expired
    const now = new Date();
    const expires = new Date(user.verification_expires);
    if (now > expires) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Mark as verified
    db.run('UPDATE users SET email_verified = 1, verification_code = NULL, verification_expires = NULL WHERE id = ?', [userId]);
    saveDatabase();

    // Initialize user progress
    db.run('INSERT INTO user_progress (user_id) VALUES (?)', [userId]);
    saveDatabase();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email verified successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend verification code endpoint
app.post('/api/resend-verification', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user
    const userResult = db.exec('SELECT * FROM users WHERE id = ?', [userId]);

    if (!userResult[0] || userResult[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const columns = userResult[0].columns;
    const values = userResult[0].values[0];
    const user = {};
    columns.forEach((col, idx) => {
      user[col] = values[idx];
    });

    // Check if already verified
    if (user.email_verified === 1) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Update user with new code
    db.run(
      'UPDATE users SET verification_code = ?, verification_expires = ? WHERE id = ?',
      [verificationCode, verificationExpires, userId]
    );
    saveDatabase();

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.username, verificationCode);

    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.json({ message: 'Verification code resent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Quantum Learning Platform server running on http://localhost:${PORT}`);
  console.log(`📊 Database: quantum-learning.db`);
});
