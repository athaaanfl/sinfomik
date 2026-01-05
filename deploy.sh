#!/bin/bash

# Deployment script untuk Azure App Service
echo "🚀 Starting deployment..."

# Install dependencies untuk backend
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Build script jika ada
echo "🔨 Running build..."
npm run build 2>/dev/null || echo "No build script found, skipping..."

echo "✅ Deployment complete!"
