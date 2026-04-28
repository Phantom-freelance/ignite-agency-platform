const express = require('express');
const supabase = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('jobnme_invoices').select('*, orders(title)').eq('user_id', req.user.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ invoices: data, paymentMethods: [] });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.get('/invoices', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('jobnme_invoices').select('*, orders(title)').eq('user_id', req.user.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

module.exports = router;
