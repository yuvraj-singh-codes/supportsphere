#!/bin/bash

set -e

# Define environment variables
export NODE_ENV=production
export DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase"
export REDIS_URL="redis://localhost:6379"
export OPENAI_API_KEY="your_openai_api_key"

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Build the Next.js application
echo "Building the Next.js application..."
npm run build

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting the application..."
npm start &

# Check if the application started successfully
if ! curl -s http://localhost:3000; then
  echo "Application failed to start. Exiting."
  exit 1
fi

echo "Deployment setup completed successfully."