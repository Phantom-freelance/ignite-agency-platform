const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function logEmail(data) {
  const query = `
    INSERT INTO email_logs (type, recipient, sent_at, status)
    VALUES ($1, $2, $3, 'sent')
    RETURNING id
  `;
  const result = await pool.query(query, [data.type, data.recipient, data.sent_at]);
  return result.rows[0];
}

module.exports = { logEmail };
