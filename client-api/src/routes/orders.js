const express = require('express');
const supabase = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('jobnme_orders').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('jobnme_orders').select('*').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (error) return res.status(404).json({ error: 'Order not found' });
    res.json(data);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { service_name, amount, notes } = req.body;
    const { data, error } = await supabase.from('jobnme_orders').insert([{ user_id: req.user.id, service_name, amount, notes, status: 'pending' }]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

module.exports = router;
