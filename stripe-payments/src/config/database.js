const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function saveVAAccount(data) {
  const query = `
    INSERT INTO va_stripe_accounts (stripe_account_id, email, status, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id
  `;
  const result = await pool.query(query, [data.stripe_account_id, data.email, data.status]);
  return result.rows[0];
}

async function saveEscrow(data) {
  const query = `
    INSERT INTO escrow_payments (payment_intent_id, amount, va_account_id, project_id, status, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id
  `;
  const result = await pool.query(query, [
    data.payment_intent_id,
    data.amount,
    data.va_account_id,
    data.project_id,
    data.status
  ]);
  return result.rows[0];
}

async function getEscrow(id) {
  const result = await pool.query('SELECT * FROM escrow_payments WHERE id = $1', [id]);
  return result.rows[0];
}

async function updateEscrowStatus(paymentIntentId, status) {
  await pool.query(
    'UPDATE escrow_payments SET status = $1 WHERE payment_intent_id = $2',
    [status, paymentIntentId]
  );
}

async function updateMilestone(data) {
  const query = `
    INSERT INTO milestone_releases (escrow_id, amount, transfer_id, released_at)
    VALUES ($1, $2, $3, $4)
  `;
  await pool.query(query, [data.escrow_id, data.amount, data.transfer_id, data.released_at]);
}

module.exports = { 
  saveVAAccount, 
  saveEscrow, 
  getEscrow, 
  updateEscrowStatus,
  updateMilestone 
};
