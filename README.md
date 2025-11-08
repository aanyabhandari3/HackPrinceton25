# 🌐 Data Center Impact Analyzer

A comprehensive web application that analyzes the environmental and economic impact of data centers across the United States. Place a data center anywhere on the map, customize its specifications, and receive detailed AI-powered impact reports.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![React](https://img.shields.io/badge/react-18.3-blue.svg)

## 🎯 Purpose

As data center construction accelerates across the USA, understanding their impact on local communities becomes crucial. This tool helps visualize and quantify:

- **Energy Consumption** - How much power will be consumed and impact on electricity bills
- **Carbon Emissions** - Environmental footprint in tons of CO₂
- **Water Usage** - Daily/annual water consumption and strain on local resources
- **Economic Impact** - Job creation, construction costs, and community benefits
- **Infrastructure Strain** - Impact on local utilities and resources

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
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your API keys:
```bash
ANTHROPIC_API_KEY=your_key_here
MAPBOX_TOKEN=your_token_here
CENSUS_API_KEY=your_key_here
EIA_API_KEY=your_key_here
OPENWEATHER_API_KEY=your_key_here
```

4. Run the Flask server:
```bash
python app.py
```

Backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

4. Run the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 🎮 Usage

1. **Select a Location**: Click anywhere on the map to place your data center
2. **Configure**: Choose a preset size or create a custom configuration
3. **Analyze**: Click "Analyze Impact" to generate the report
4. **Review**: Examine the detailed metrics and AI-generated insights
5. **Reset**: Start over with a new location or configuration

## 📊 Example Analysis

When you place a Medium (10 MW) data center in a typical US county:

- **Energy**: ~87,600 MWh/year (~0.5-2% regional increase)
- **Carbon**: ~40,000 tons CO₂/year (equivalent to ~8,700 cars)
- **Water**: ~110M gallons/year (~0.2-1% regional increase)
- **Economic**: 50 jobs, $50M construction, ~$13M annual operating cost

## 🔒 Privacy & Data

- No user data is stored
- All calculations happen in real-time
- API calls are made directly to public data sources
- No tracking or analytics beyond basic API usage

## 🛠️ Tech Stack Summary

**Backend:**
- Flask 3.0
- Anthropic Claude API
- Requests
- Python-dotenv

**Frontend:**
- React 18
- Mapbox GL JS
- Tailwind CSS
- Vite
- Axios

## 📝 API Endpoints

### `POST /api/analyze`
Analyze data center impact at a location

**Request:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "size": "medium",
  "custom": false
}
```

**Response:**
```json
{
  "timestamp": "2025-11-08T12:00:00",
  "location": { ... },
  "datacenter": { ... },
  "impact": {
    "energy": { ... },
    "carbon": { ... },
    "water": { ... },
    "economic": { ... }
  },
  "analysis": "AI-generated comprehensive analysis..."
}
```

### `GET /api/datacenter-types`
Get available data center presets

### `GET /health`
Health check endpoint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Data sources: US Census Bureau, Energy Information Administration, USGS
- Mapping: Mapbox
- AI Analysis: Anthropic Claude
- Icons: Lucide React

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built for HackPrinceton 2025** 🎓

Made with ❤️ to promote awareness about data center environmental impacts
