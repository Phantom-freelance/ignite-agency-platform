const express = require('express');
const supabase = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

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

router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, company, phone } = req.body;
    
    const { data, error } = await supabase
      .from('jobnme_users')
      .update({ name, company, phone })
      .eq('id', req.user.id)
      .select('id, name, email, company, phone')
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
