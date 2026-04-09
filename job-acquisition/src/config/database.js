const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function saveJobs(jobs) {
  // Save jobs to database
  console.log(`Saving ${jobs.length} jobs`);
}

module.exports = { saveJobs };
