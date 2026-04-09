const express = require('express');
const db = require('./config/database');

const app = express();
app.use(require('cors')());
app.use(express.json());

// Get dashboard metrics
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await db.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue stats
app.get('/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const revenue = await db.getRevenue(startDate, endDate);
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get VA performance
app.get('/va-performance', async (req, res) => {
  try {
    const performance = await db.getVAPerformance();
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get job conversion rates
app.get('/conversion-rates', async (req, res) => {
  try {
    const rates = await db.getConversionRates();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'running', service: 'analytics' });
});

const PORT = process.env.PORT || 11000;
app.listen(PORT, () => console.log(`Analytics service on ${PORT}`));
