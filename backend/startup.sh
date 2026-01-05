#!/bin/bash

# Navigate to backend directory
cd /home/site/wwwroot/backend

# Install dependencies if needed
npm install --production

# Initialize database if not exists
if [ ! -f "/home/data/academic_dashboard.db" ]; then
    echo "Initializing database..."
    node src/init_db.js
fi

# Start the server
echo "Starting Node.js server..."
node src/server.js
