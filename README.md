# Ignite Agency Platform

Full-stack microservices platform for managing virtual assistants, job acquisition, proposals, payments, and automation.

## Architecture

- **Job Acquisition** (Port 6000): Upwork API + Fiverr scraping + filtering
- **Proposal Engine** (Port 7000): AI-powered proposal generation using Claude API
- **Stripe Payments** (Port 8000): Escrow + milestone payments + VA payouts
- **Email Automation** (Port 9000): SendGrid/Resend integration
- **Social Media** (Port 10000): LinkedIn + Twitter automation
- **Analytics** (Port 11000): Real-time metrics and reporting

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your API keys
3. Run `docker-compose up -d`
4. Initialize database: `docker-compose exec postgres psql -U ignite_user -d ignite_platform -f /database/schema.sql`

## API Endpoints

### Job Acquisition
- `GET /health` - Health check
- `POST /fetch-jobs` - Fetch jobs from Upwork/Fiverr

### Proposal Engine
- `POST /generate-proposal` - Generate AI proposal
- Body: `{ jobDescription, clientName, budget, skills }`

### Stripe Payments
- `POST /create-va-account` - Create VA Stripe account
- `POST /create-escrow` - Create escrow payment
- `POST /release-milestone` - Release milestone payment
- `POST /webhooks/stripe` - Stripe webhook handler

### Email Automation
- `POST /send-welcome` - Send welcome email
- `POST /notify-new-job` - Send job notification
- `POST /trigger-followup` - Trigger follow-up sequence

### Social Media
- `POST /tweet` - Post to Twitter
- `POST /linkedin-post` - Post to LinkedIn
- `POST /auto-post-success` - Auto-post success story

### Analytics
- `GET /metrics` - Dashboard metrics
- `GET /revenue` - Revenue stats
- `GET /va-performance` - VA performance data
- `GET /conversion-rates` - Proposal conversion rates

## Development

Run individual services:
```bash
cd job-acquisition && npm install && npm run dev
cd proposal-engine && npm install && npm run dev
# etc...
```

## Tech Stack

- Node.js + Express
- PostgreSQL
- Docker
- Anthropic Claude API
- Stripe Connect
- SendGrid/Resend
- Twitter/LinkedIn APIs

## License

MIT
