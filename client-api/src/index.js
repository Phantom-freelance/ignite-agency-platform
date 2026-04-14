const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const billingRoutes = require('./routes/billing');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Client API running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Client API running on port ${PORT}`);
});
