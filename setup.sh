#!/bin/bash

# Mindful Presence Frontend Setup Script
# This script installs dependencies and configures the environment

echo "🚀 Setting up Mindful Presence Frontend..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install AsyncStorage
echo "📦 Installing AsyncStorage..."
npx expo install @react-native-async-storage/async-storage

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1

# For physical device testing, replace localhost with your computer's IP:
# EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api/v1
EOF
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  Please update the API URL in .env if needed"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your backend is running at the configured URL"
echo "2. Update .env with the correct API URL if needed"
echo "3. Run 'npm start' or 'npx expo start' to start the app"
echo ""
echo "📚 Documentation:"
echo "- API_INTEGRATION_GUIDE.md - Complete integration guide"
echo "- QUICK_START.md - Quick start and testing guide"
echo "- CHANGES_SUMMARY.md - Summary of all changes"
echo ""
echo "Happy coding! 🚀"

