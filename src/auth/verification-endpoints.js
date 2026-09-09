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
