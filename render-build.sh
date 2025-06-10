#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Build the application using npx
npx vite build

# Start the server
node server.js 