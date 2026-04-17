const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, company, phone }])
      .select()
      .single();
    
    if (error) throw error;
    
    const token = jwt.sign({ id: data.id, email, role: 'user' }, JWT_SECRET);
    
    res.json({ token, user: { id: data.id, name: data.name, email: data.email, company: data.company, phone: data.phone } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET);
    
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, company: user.company, phone: user.phone }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate reset token (random 32 char string)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
    
    // Save token to database
    const { error: tokenError } = await supabase
      .from('password_resets')
      .insert([{ 
        user_id: user.id, 
        email: user.email, 
        token: resetToken, 
        expires_at: expiresAt 
      }]);
    
    if (tokenError) throw tokenError;
    
    res.json({ 
      success: true, 
      message: 'Password reset token generated',
      token: resetToken,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Validate token and check expiry
    const { data: resetRecord, error: tokenError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .single();
    
    if (tokenError || !resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Check if token expired
    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', resetRecord.user_id);
    
    if (updateError) throw updateError;
    
    // Delete used token
    await supabase
      .from('password_resets')
      .delete()
      .eq('token', token);
    
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
