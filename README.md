# EVOLV
Dive Deep. See Clear.

Analyze the environmental and economic impact of data centers across the United States. Place a data center anywhere on the map, customize its specifications, and receive detailed AI-powered impact reports.

## ✨ Features

- 🗺️ **Interactive Mapbox Map** - Click anywhere in the USA to place a data center
- ⚙️ **Customizable Configurations** - 4 presets (Small to Mega) or fully custom
- 📊 **Comprehensive Analysis** - Energy, water, carbon, and economic impact
- 🤖 **AI-Powered Insights** - Claude generates detailed analysis and recommendations
- 🎨 **Modern UI** - Clean, modular, responsive design

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- API Keys (free tiers available):
  - [Mapbox](https://account.mapbox.com/access-tokens/)
  - [Anthropic Claude](https://console.anthropic.com/)
  - [US Census Bureau](https://api.census.gov/data/key_signup.html)
  - [EIA](https://www.eia.gov/opendata/register.php)
  - [OpenWeatherMap](https://openweathermap.org/api)

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure Mapbox token:**

Edit `frontend/js/config.js` and replace the Mapbox token:
```javascript
export const MAPBOX_CONFIG = {
    accessToken: 'YOUR_MAPBOX_TOKEN_HERE',
    // ...
};
```

3. **Start the frontend:**
```bash
npm start
```

Visit: **http://localhost:3000**

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Create `.env` file:**
```bash
# backend/.env
ANTHROPIC_API_KEY=your_anthropic_key
MAPBOX_TOKEN=your_mapbox_token
CENSUS_API_KEY=your_census_key
EIA_API_KEY=your_eia_key
OPENWEATHER_API_KEY=your_openweather_key
```

3. **Start the backend:**
```bash
python app.py
```

Backend runs on: **http://localhost:5000**

## 📁 Project Structure

```
HackPrinceton25/
├── frontend/
│   ├── index.html          # Main HTML
│   ├── styles.css          # All CSS styles
│   ├── js/
│   │   ├── app.js         # Main application
│   │   ├── config.js      # Configuration
│   │   ├── map.js         # Map functionality
│   │   ├── ui.js          # UI management
│   │   └── api.js         # Backend API calls
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app.py             # Flask server + API
│   └── requirements.txt
├── README.md
└── LICENSE
```

## 🎮 Usage

1. **Open the app** at http://localhost:3000
2. **Select a data center size** or customize your own
3. **Click on the map** to place the data center
4. **Click "Analyze Impact"** to generate the report
5. **View results** with AI-powered insights

## 📊 What Gets Analyzed

### Energy Impact
- Annual consumption (MWh)
- Regional demand increase (%)
- Cost per household
- Equivalent homes powered

### Carbon Footprint
- Annual CO₂ emissions (tons)
- Equivalent cars on the road
- Environmental comparisons

### Water Resources
- Daily/annual usage (gallons)
- Regional water strain (%)
- Olympic pool equivalents

### Economic Impact
- Jobs created
- Construction costs
- Annual operating costs

## 🛠️ Tech Stack

**Frontend:**
- Pure JavaScript (ES6 modules)
- Mapbox GL JS
- Vite dev server

**Backend:**
- Python Flask
- Anthropic Claude API
- Multiple data APIs (Census, EIA, OpenWeather)

## 💰 API Costs

All APIs have generous free tiers:

| API | Free Tier | Est. Monthly Cost |
|-----|-----------|-------------------|
| Mapbox | 50k loads/month | Free |
| Census | Unlimited | Free |
| EIA | Unlimited | Free |
| OpenWeatherMap | 60 calls/min | Free |
| Anthropic | Pay-as-you-go | ~$0.30/month (100 analyses) |

## 📝 API Endpoints

### POST `/api/analyze`
Analyze data center impact at a location.

**Request:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "size": "medium",
  "custom": false
}
```

**Response:** Full impact report with AI analysis

### GET `/api/datacenter-types`
Get available data center presets.

### GET `/health`
Health check endpoint.

## 🧪 Development

**Frontend:**
```bash
cd frontend
npm run dev    # Start dev server
npm run build  # Build for production
```

**Backend:**
```bash
cd backend
python app.py  # Start Flask server
```

## 🤝 Contributing

Built for **HackPrinceton 2025**

Feel free to open issues or submit PRs!

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Data sources: US Census Bureau, EIA, USGS
- Mapping: Mapbox
- AI Analysis: Anthropic Claude

---

Made with ❤️ to promote awareness about data center environmental impacts
