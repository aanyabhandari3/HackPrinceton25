# EVOLV - *Dive Deep. See Clear.*

Analyze the environmental and economic impact of data centers across the United States. Place a data center anywhere on the map, customize its specifications, and receive detailed AI-powered impact reports.

## ✨ Features

### 🗺️ Interactive Mapping
- Click anywhere in the USA to place a data center
- Real-time location selection with Mapbox integration
- Visual marker placement with smooth animations

### ⚙️ Customizable Data Centers
- **4 Preset Sizes**:
  - Small (1 MW, 100 servers)
  - Medium (10 MW, 1,000 servers)
  - Large (50 MW, 10,000 servers)
  - Mega (150 MW, 50,000 servers)
- **Custom Configuration** - Define your own specifications:
  - Power consumption (MW)
  - Number of servers
  - Facility size (sq ft)
  - Water usage (gallons/day)
  - Employee count

### 📊 Comprehensive Analysis
- **Energy Impact**:
  - Annual kWh consumption
  - Cost per household increase
  - Regional demand impact percentage
  - Equivalent homes powered

- **Carbon Footprint**:
  - Annual CO₂ emissions in tons
  - Equivalent number of cars
  - Environmental comparisons

- **Water Resources**:
  - Daily and annual water usage
  - Regional water strain percentage
  - Olympic pool equivalents

- **Economic Metrics**:
  - Jobs created
  - Construction cost estimates
  - Annual operating costs

### 🤖 AI-Powered Insights
Powered by Claude (Anthropic), the app generates detailed analysis including:
- Overall environmental impact assessment
- Energy infrastructure capacity concerns
- Water resource implications
- Community impact (bills, health, quality of life)
- Climate considerations for cooling efficiency
- Mitigation recommendations
- Regulatory and permitting considerations

## 🏗️ Architecture

### Backend (Python/Flask)
- **API Integrations**:
  - **US Census Bureau API** - Population and demographic data
  - **EIA (Energy Information Administration)** - Electricity pricing by region
  - **OpenWeatherMap** - Local climate data for cooling calculations
  - **Anthropic Claude API** - AI-powered analysis and report generation
  
- **Impact Calculator** - Sophisticated algorithms for calculating:
  - Energy consumption and costs
  - Carbon emissions (US grid average)
  - Water usage and regional strain
  - Economic impact metrics
  - Climate-adjusted cooling requirements

### Frontend (React)
- **React 18** with modern hooks
- **Mapbox GL JS** for interactive mapping
- **Tailwind CSS** for beautiful, responsive design
- **Axios** for API communication
- **React Markdown** for formatted AI reports

## 💧 Water Usage Calculation (Technical Detail)

**Formula:** `water_gallons = cooling_power_kw × factor × temp_multiplier`

| Cooling Type | Factor (gal/kWh) | Why? |
|--------------|------------------|------|
| **Air-Cooled** | 0.2 | Minimal - uses air, not water evaporation |
| **Water-Cooled** | 1.8 | Highest - cooling towers evaporate + blowdown losses |
| **Evaporative** | 1.0 | Moderate - direct evaporation, no blowdown |
| **Liquid** | 0.3 | Low - closed loop, only heat rejection uses water |

**Temperature Adjustment:** +2% water use per °F above 70°F (hotter = more evaporation needed)

**Example:** 1 MW water-cooled DC at 90°F:
- Cooling load: 250 kW (PUE 1.25)
- Temp multiplier: 1.4 (90-70=20°F × 0.02)
- Daily water: 250 × 1.8 × 1.4 × 24 = **15,120 gallons/day**

*Factors based on thermodynamics (heat of vaporization) + industry benchmarks (Google, Microsoft, ASHRAE)*

## 📡 APIs Used

| API | Purpose | Free Tier |
|-----|---------|-----------|
| [US Census Bureau](https://www.census.gov/data/developers/data-sets.html) | Population, demographics, geographic data | Yes |
| [EIA](https://www.eia.gov/opendata/) | Energy consumption, electricity rates | Yes |
| [OpenWeatherMap](https://openweathermap.org/api) | Climate data for cooling calculations | 60 calls/min free |
| [Mapbox](https://www.mapbox.com/) | Interactive maps, geocoding | 50k loads/month free |
| [Anthropic Claude](https://www.anthropic.com/) | AI analysis and insights | Pay-as-you-go |

## 🚀 Getting Started

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
