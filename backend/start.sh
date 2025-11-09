#!/bin/bash

# Data Center Impact Analyzer - Quick Start Script

echo "🌐 Data Center Impact Analyzer - Starting..."
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env file not found!"
    echo "Please create backend/.env with your API keys"
    echo "See SETUP_GUIDE.md for instructions"
    echo ""
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Warning: frontend/.env file not found!"
    echo "Please create frontend/.env with VITE_MAPBOX_TOKEN"
    echo "See SETUP_GUIDE.md for instructions"
    echo ""
fi

# Check if dependencies are installed
if [ ! -d "backend/venv" ] && [ ! command -v flask &> /dev/null ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    pip3 install -r requirements.txt
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

echo "✅ Dependencies ready!"
echo ""
echo "🚀 Starting servers..."
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
cd backend
python3 app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend in background
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup INT TERM

# Wait for both processes
wait

