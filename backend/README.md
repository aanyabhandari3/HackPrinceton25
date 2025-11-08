# Data Center Impact Analysis - Backend

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with the following API keys:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
MAPBOX_TOKEN=your_mapbox_token_here
CENSUS_API_KEY=your_census_api_key_here
EIA_API_KEY=your_eia_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### Where to Get API Keys:

- **Anthropic/Claude API**: https://console.anthropic.com/ (for LLM analysis)
- **Mapbox Token**: https://account.mapbox.com/ (for maps)
- **US Census Bureau API**: https://api.census.gov/data/key_signup.html (for population data)
- **Energy Information Administration (EIA) API**: https://www.eia.gov/opendata/register.php (for energy prices)
- **OpenWeatherMap API**: https://openweathermap.org/api (for climate data)

## Running the Server

```bash
python app.py
```

Server will run on `http://localhost:5000`

## API Endpoints

### POST /api/analyze
Analyze data center impact at a specific location.

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "size": "medium",
  "custom": false
}
```

Or with custom configuration:
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "custom": true,
  "name": "My Custom Data Center",
  "power_mw": 25,
  "servers": 2500,
  "square_feet": 100000,
  "water_gallons_per_day": 500000,
  "employees": 100
}
```

**Response:** Full impact report with LLM analysis

### GET /api/datacenter-types
Get available data center presets and their specifications.

### GET /health
Health check endpoint.

## Data Center Tiers

- **Small**: 1 MW, 100 servers, 5,000 sq ft
- **Medium**: 10 MW, 1,000 servers, 50,000 sq ft
- **Large**: 50 MW, 10,000 servers, 250,000 sq ft
- **Mega**: 150 MW, 50,000 servers, 750,000 sq ft

