const express = require('express');
const supabase = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobnme_users')
      .select('id, name, email, company, phone, created_at')
      .eq('id', req.user.id)
      .single();
    
    if (error) return res.status(404).json({ error: 'User not found' });
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, company, phone } = req.body;
    
    const { data, error } = await supabase
      .from('jobnme_users')
      .update({ name, company, phone, updated_at: new Date() })
      .eq('id', req.user.id)
      .select('id, name, email, company, phone')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get current user
    const { data: user, error: fetchError } = await supabase
      .from('jobnme_users')
      .select('password')
      .eq('id', req.user.id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error: updateError } = await supabase
      .from('jobnme_users')
      .update({ password: hashedPassword, updated_at: new Date() })
      .eq('id', req.user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete account
router.delete('/', authMiddleware, async (req, res) => {
  try {
    // Delete user's orders first (foreign key constraint)
    await supabase
      .from('jobnme_orders')
      .delete()
      .eq('user_id', req.user.id);

    // Delete user's invoices
    await supabase
      .from('jobnme_invoices')
      .delete()
      .eq('user_id', req.user.id);

    // Delete user account
    const { error } = await supabase
      .from('jobnme_users')
      .delete()
      .eq('id', req.user.id);

    if (error) throw error;

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
