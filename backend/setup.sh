#!/bin/bash

# Data Center Impact Analyzer - Backend Setup Script

echo "🌐 Data Center Impact Analyzer - Backend Setup"
echo "=============================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

echo "✓ Python 3 detected: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip."
    exit 1
fi

echo "✓ pip3 detected"
echo ""

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt --quiet

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: You must edit .env and add your API keys!"
    echo ""
    echo "Required API keys:"
    echo "  1. ANTHROPIC_API_KEY - https://console.anthropic.com/"
    echo "  2. MAPBOX_TOKEN - https://account.mapbox.com/"
    echo "  3. CENSUS_API_KEY - https://api.census.gov/data/key_signup.html"
    echo "  4. EIA_API_KEY - https://www.eia.gov/opendata/register.php"
    echo "  5. OPENWEATHER_API_KEY - https://openweathermap.org/api"
    echo ""
    echo "Edit the .env file now and replace placeholder values with your actual keys."
    echo ""
else
    echo "✓ .env file found"
    
    # Check if API keys are set (simple check for placeholder text)
    if grep -q "your-.*-here" .env; then
        echo "⚠️  Warning: .env file still contains placeholder values"
        echo "Please edit .env and add your actual API keys"
    else
        echo "✓ .env file appears to be configured"
    fi
fi

echo ""
echo "=============================================="
echo "Setup complete! 🎉"
echo "=============================================="
echo ""
echo "Next steps:"
echo "  1. Make sure all API keys are set in .env"
echo "  2. Run the server: python3 app.py"
echo "  3. Test the setup: python3 test_backend.py"
echo ""
echo "The server will run on: http://localhost:5000"
echo ""