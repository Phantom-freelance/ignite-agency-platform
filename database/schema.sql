CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  client_name VARCHAR(255),
  skills TEXT[],
  url TEXT,
  fetched_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'new'
);
CREATE TABLE IF NOT EXISTS proposals (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id),
  job_description TEXT,
  proposal_text TEXT NOT NULL,
  client_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'draft'
);
CREATE TABLE IF NOT EXISTS va_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  skills TEXT[],
  hourly_rate DECIMAL(10,2),
  stripe_account_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS va_stripe_accounts (
  id SERIAL PRIMARY KEY,
  stripe_account_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS escrow_payments (
  id SERIAL PRIMARY KEY,
  payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  va_account_id VARCHAR(255) NOT NULL,
  project_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS milestone_releases (
  id SERIAL PRIMARY KEY,
  escrow_id INTEGER REFERENCES escrow_payments(id),
  amount DECIMAL(10,2) NOT NULL,
  transfer_id VARCHAR(255),
  released_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'sent'
);
CREATE TABLE IF NOT EXISTS social_posts (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  post_id VARCHAR(255),
  posted_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  va_id INTEGER REFERENCES va_users(id),
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active',
  rating DECIMAL(3,2),
  completed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_platform ON jobs(platform);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_payments(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(type);
