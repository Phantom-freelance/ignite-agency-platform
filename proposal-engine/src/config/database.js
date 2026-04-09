const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function saveProposal(data) {
  const query = `
    INSERT INTO proposals (job_description, proposal_text, client_name, created_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const result = await pool.query(query, [
    data.job_description,
    data.proposal_text,
    data.client_name,
    data.created_at
  ]);
  return result.rows[0];
}

module.exports = { saveProposal };
