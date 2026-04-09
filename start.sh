#!/bin/bash

echo "🚀 Starting Ignite Agency Platform..."

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  Creating .env file from .env.example..."
  cp .env.example .env
  echo "✅ Please edit .env with your API keys before continuing!"
  exit 1
fi

# Start services
echo "📦 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Initialize database
echo "🗄️  Initializing database schema..."
docker-compose exec -T postgres psql -U ignite_user -d ignite_platform < database/schema.sql

echo "✅ Platform is running!"
echo ""
echo "Services available at:"
echo "  - Job Acquisition: http://localhost:6000"
echo "  - Proposal Engine: http://localhost:7000"
echo "  - Stripe Payments: http://localhost:8000"
echo "  - Email Automation: http://localhost:9000"
echo "  - Social Media: http://localhost:10000"
echo "  - Analytics: http://localhost:11000"
