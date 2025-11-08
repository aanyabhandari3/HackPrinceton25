# Complete Setup Guide

This guide will walk you through setting up the Data Center Impact Analyzer from scratch.

## Prerequisites

Before you begin, ensure you have:
- Python 3.9 or higher
- Node.js 16 or higher
- npm (comes with Node.js)
- A text editor (VS Code recommended)
- Terminal/Command Prompt access

## Step 1: Clone or Download the Repository

If you haven't already, navigate to your project directory:
```bash
cd /Users/sarveshgade/Desktop/projects/HackPrinceton25
```

## Step 2: Obtain API Keys

You'll need to sign up for free accounts and get API keys from the following services:

### 2.1 Anthropic Claude API
1. Go to https://console.anthropic.com/
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

**Cost**: Pay-as-you-go, ~$0.003 per analysis request

### 2.2 Mapbox
1. Go to https://account.mapbox.com/
2. Sign up for a free account
3. Go to "Access tokens"
4. Copy your default public token (or create a new one)

**Cost**: Free tier includes 50,000 map loads/month

### 2.3 US Census Bureau API
1. Go to https://api.census.gov/data/key_signup.html
2. Fill out the form with your email
3. Check your email for the API key
4. Copy the key

**Cost**: Completely free

### 2.4 Energy Information Administration (EIA)
1. Go to https://www.eia.gov/opendata/register.php
2. Register with your email
3. Check your email for the API key
4. Copy the key

**Cost**: Completely free

### 2.5 OpenWeatherMap
1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Go to "API keys" in your account
4. Copy your default API key (or create a new one)

**Cost**: Free tier includes 60 calls/minute

## Step 3: Backend Setup

### 3.1 Install Python Dependencies

Open terminal and navigate to the backend directory:
```bash
cd backend
```

Install required packages:
```bash
pip install -r requirements.txt
```

Or if you prefer using pip3:
```bash
pip3 install -r requirements.txt
```

### 3.2 Configure Environment Variables

Create a new file called `.env` in the `backend` directory:
```bash
touch .env
```

Open `.env` in your text editor and add your API keys:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
MAPBOX_TOKEN=pk.your-mapbox-token-here
CENSUS_API_KEY=your-census-key-here
EIA_API_KEY=your-eia-key-here
OPENWEATHER_API_KEY=your-openweather-key-here
```

**Important**: Replace the placeholder values with your actual API keys!

### 3.3 Test the Backend

Run the Flask server:
```bash
python app.py
```

Or:
```bash
python3 app.py
```

You should see output like:
```
 * Running on http://127.0.0.1:5000
```

Test the health endpoint:
```bash
curl http://localhost:5000/health
```

You should get: `{"status":"healthy","timestamp":"..."}`

If everything works, press `Ctrl+C` to stop the server for now.

## Step 4: Frontend Setup

### 4.1 Navigate to Frontend Directory

Open a **new terminal window** and navigate to the frontend directory:
```bash
cd /Users/sarveshgade/Desktop/projects/HackPrinceton25/frontend
```

### 4.2 Install Dependencies

Install all Node.js packages:
```bash
npm install
```

This may take a few minutes. You'll see a progress bar.

### 4.3 Configure Environment Variables

Create a `.env` file in the `frontend` directory:
```bash
touch .env
```

Open it and add your Mapbox token:
```
VITE_MAPBOX_TOKEN=pk.your-mapbox-token-here
```

**Important**: Use the same Mapbox token from Step 2.2!

## Step 5: Running the Application

You need to run both the backend and frontend simultaneously.

### 5.1 Start the Backend

In your first terminal window (in the `backend` directory):
```bash
python app.py
```

Leave this running. You should see:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### 5.2 Start the Frontend

In your second terminal window (in the `frontend` directory):
```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in X ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5.3 Open the Application

Open your web browser and go to:
```
http://localhost:3000
```

## Step 6: Using the Application

1. **Click on the map** to place a data center anywhere in the USA
2. **Configure** the data center using the left sidebar:
   - Choose a preset size (Small, Medium, Large, Mega)
   - Or click "Custom Configuration" to set specific values
3. **Click "Analyze Impact"** to generate a report
4. **View the report** in the right sidebar:
   - See key metrics at a glance
   - Scroll down for detailed breakdowns
   - Read the AI-generated analysis at the bottom
5. **Click "Reset"** to start over with a new location

## Troubleshooting

### Backend Issues

**"Module not found" error**
```bash
pip install -r requirements.txt --upgrade
```

**"API key not found" error**
- Check that your `.env` file is in the `backend` directory
- Verify API keys are correct and have no extra spaces
- Make sure `.env` file starts each line with `KEY=value` (no spaces around =)

**Port 5000 already in use**
- On Mac, AirPlay Receiver uses port 5000
- Option 1: Disable AirPlay Receiver in System Preferences
- Option 2: Change port in `app.py`: `app.run(debug=True, port=5001)`
  - Then update frontend `vite.config.js` proxy target to match

### Frontend Issues

**"Cannot GET /" or blank page**
- Make sure you ran `npm install` first
- Check console for errors (F12 in browser)
- Verify `.env` file has `VITE_MAPBOX_TOKEN`

**Map not loading**
- Check browser console (F12) for Mapbox errors
- Verify your Mapbox token is correct
- Make sure token has no extra spaces or quotes

**"Network Error" when clicking Analyze**
- Ensure backend is running on port 5000
- Check backend terminal for error messages
- Try restarting both servers

### API Issues

**Census API "invalid key"**
- Some Census API keys take 15-30 minutes to activate
- Try again after waiting

**Rate limiting errors**
- OpenWeatherMap free tier: 60 calls/minute
- Solution: Wait a minute before retrying
- Or upgrade to a paid tier

## Next Steps

### Optional Enhancements

1. **Deploy the Backend**
   - Use services like Heroku, Railway, or Render
   - Set environment variables in the hosting platform
   - Update frontend API endpoint

2. **Deploy the Frontend**
   - Use Vercel, Netlify, or GitHub Pages
   - Build with `npm run build`
   - Deploy the `dist` folder

3. **Add More Features**
   - Save reports to database
   - Compare multiple locations
   - Export reports as PDF
   - Add more data sources

## Cost Breakdown

Estimated costs for moderate usage (100 analyses/month):

| Service | Free Tier | Est. Cost |
|---------|-----------|-----------|
| Anthropic Claude | N/A | ~$0.30/month |
| Mapbox | 50k loads | Free |
| Census API | Unlimited | Free |
| EIA API | Unlimited | Free |
| OpenWeatherMap | 60/min | Free |
| **Total** | | **~$0.30/month** |

## Support

If you encounter issues:
1. Check the error message in browser console (F12)
2. Check backend terminal for Python errors
3. Verify all API keys are correctly set
4. Make sure both servers are running
5. Try the troubleshooting steps above

## Success Checklist

- [ ] All API keys obtained
- [ ] Backend `.env` file created with all 5 keys
- [ ] Frontend `.env` file created with Mapbox token
- [ ] Python dependencies installed (`pip install -r requirements.txt`)
- [ ] Node dependencies installed (`npm install`)
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can see map in browser
- [ ] Can click on map to place marker
- [ ] Can generate report successfully

If all items are checked, you're ready to go! 🎉

## Quick Reference

**Start Backend:**
```bash
cd backend && python app.py
```

**Start Frontend:**
```bash
cd frontend && npm run dev
```

**Stop Servers:**
Press `Ctrl+C` in each terminal window

**Update Dependencies:**
```bash
# Backend
pip install -r requirements.txt --upgrade

# Frontend
npm update
```

Happy analyzing! 🌐📊

