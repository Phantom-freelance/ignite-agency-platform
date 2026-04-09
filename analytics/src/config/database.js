const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function getMetrics() {
  const result = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM jobs) as total_jobs,
      (SELECT COUNT(*) FROM proposals) as total_proposals,
      (SELECT COUNT(*) FROM va_users) as total_vas,
      (SELECT SUM(amount) FROM escrow_payments WHERE status = 'confirmed') as total_revenue
  `);
  return result.rows[0];
}

async function getRevenue(startDate, endDate) {
  const result = await pool.query(`
    SELECT 
      DATE(created_at) as date,
      SUM(amount) as revenue
    FROM escrow_payments
    WHERE created_at BETWEEN $1 AND $2
    GROUP BY DATE(created_at)
    ORDER BY date
  `, [startDate, endDate]);
  return result.rows;
}

async function getVAPerformance() {
  const result = await pool.query(`
    SELECT 
      va.name,
      COUNT(p.id) as projects_completed,
      AVG(p.rating) as avg_rating,
      SUM(p.amount) as total_earned
    FROM va_users va
    LEFT JOIN projects p ON p.va_id = va.id
    WHERE p.status = 'completed'
    GROUP BY va.id, va.name
    ORDER BY total_earned DESC
  `);
  return result.rows;
}

async function getConversionRates() {
  const result = await pool.query(`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'applied') as applied,
      COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
      ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'accepted') / NULLIF(COUNT(*) FILTER (WHERE status = 'applied'), 0), 2) as conversion_rate
    FROM proposals
  `);
  return result.rows[0];
}

module.exports = { 
  getMetrics, 
  getRevenue, 
  getVAPerformance, 
  getConversionRates 
};
