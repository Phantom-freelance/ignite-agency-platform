const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function logPost(data) {
  const query = `
    INSERT INTO social_posts (platform, content, post_id, posted_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const result = await pool.query(query, [
    data.platform,
    data.content,
    data.post_id,
    data.posted_at
  ]);
  return result.rows[0];
}

module.exports = { logPost };
