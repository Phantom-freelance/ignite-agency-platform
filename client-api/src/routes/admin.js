const express = require('express');
const supabase = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('jobnme_users').select('id, name, email, company, phone, created_at').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('*, users(name, email)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

router.get('/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { count: totalUsers } = await supabase.from('jobnme_users').select('*', { count: 'exact', head: true });
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    const { count: pendingOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { data: revenueData } = await supabase.from('orders').select('amount').eq('status', 'completed');
    const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;
    res.json({ totalUsers, totalOrders, totalRevenue, pendingOrders });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

module.exports = router;
