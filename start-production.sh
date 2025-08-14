#!/bin/bash
# EshoTry Production Startup Script

set -e

echo "Starting EshoTry Production Server..."

# Check environment
if [ "$NODE_ENV" != "production" ]; then
    echo "Warning: NODE_ENV is not set to production"
fi

# Check required environment variables
required_vars=("DATABASE_URL" "SESSION_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: Required environment variable $var is not set"
        exit 1
    fi
done

# Run database migrations if needed
echo "Checking database..."
npm run db:push

# Start the application
echo "Starting application server..."
exec node dist/index.js