#!/bin/bash

echo "🚀 Setting up Calendar Application..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.10.0"
    exit 1
fi

# Check for NVM and use correct version
if command -v nvm &> /dev/null; then
    echo "📦 Using Node.js version from .nvmrc..."
    nvm use
fi

echo "📥 Installing root dependencies..."
npm install

echo "📥 Installing server dependencies..."
cd server
npm install
cd .. 

echo "📥 Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "🔧 Setting up environment files..."

# Create server .env file
if [ ! -f "server/.env" ]; then
    echo "📄 Creating server/.env from server/env.example..."
    cp server/env.example server/.env
else
    echo "📄 server/.env already exists, skipping..."
fi

# Create client .env file
if [ ! -f "client/.env" ]; then
    echo "📄 Creating client/.env from client/env.example..."
    cp client/env.example client/.env
else
    echo "📄 client/.env already exists, skipping..."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Available commands:"
echo ""
echo "  Development:"
echo "    npm run dev              - Start both server & client"
echo "    npm run dev:server       - Start server only (port 3001)"
echo "    npm run dev:client       - Start client only (port 5173)"
echo ""
echo "  Production:"
echo "    npm run build            - Build both server & client"
echo "    npm run start            - Start production server"
echo ""
echo "  Testing:"
echo "    npm test                 - Run all tests"
echo "    npm run test:watch       - Run tests in watch mode"
echo ""
echo "  Linting:"
echo "    npm run lint             - Lint both server & client"
echo ""
echo "📝 Environment files created:"
echo "  ✅ server/.env (from server/env.example)"
echo "  ✅ client/.env (from client/env.example)"
echo ""
echo "⚠️  Next steps:"
echo "  1. Edit server/.env to configure your email settings"
echo "  2. Edit client/.env to configure API URL if needed"
echo "  3. Run 'npm run dev' to start the application"
echo ""
