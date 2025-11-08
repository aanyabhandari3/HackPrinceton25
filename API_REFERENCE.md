# API Reference

Complete documentation of all available APIs used in the Data Center Impact Analyzer.

## Backend API Endpoints

Base URL: `http://localhost:5000/api`

### POST /api/analyze

Analyze the environmental and economic impact of a data center at a specific location.

**Request Body:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "size": "medium",
  "custom": false
}
```

**With Custom Configuration:**
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "custom": true,
  "name": "Custom Data Center",
  "power_mw": 25.0,
  "servers": 2500,
  "square_feet": 100000,
  "water_gallons_per_day": 500000,
  "employees": 100
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latitude | float | Yes | Latitude coordinate (-90 to 90) |
| longitude | float | Yes | Longitude coordinate (-180 to 180) |
| size | string | No | Preset size: 'small', 'medium', 'large', 'mega' |
| custom | boolean | No | Use custom configuration (default: false) |
| name | string | No* | Custom data center name |
| power_mw | float | No* | Power consumption in megawatts |
| servers | integer | No* | Number of servers |
| square_feet | integer | No* | Facility size in square feet |
| water_gallons_per_day | integer | No* | Daily water usage in gallons |
| employees | integer | No* | Number of employees |

*Required if `custom: true`

**Response:**
```json
{
  "timestamp": "2025-11-08T12:00:00.000000",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "name": "New York County, New York",
    "population": 1629054,
    "median_income": 75000
  },
  "datacenter": {
    "name": "Medium Enterprise Data Center",
    "power_mw": 10,
    "servers": 1000,
    "square_feet": 50000,
    "water_gallons_per_day": 300000,
    "employees": 50
  },
  "climate": {
    "temperature": 72.5,
    "humidity": 65,
    "description": "partly cloudy"
  },
  "energy_pricing": {
    "price_per_kwh": 0.12,
    "state": "36"
  },
  "impact": {
    "energy": {
      "annual_mwh": 87600,
      "annual_kwh": 87600000,
      "annual_cost": 10512000,
      "percent_increase": 1.35,
      "cost_per_household_annually": 16.13
    },
    "carbon": {
      "annual_tons_co2": 40348,
      "equivalent_cars": 8771,
      "equivalent_homes": 8760
    },
    "water": {
      "daily_gallons": 300000,
      "annual_gallons": 109500000,
      "percent_increase": 0.89,
      "olympic_pools_per_year": 165.9
    },
    "economic": {
      "jobs_created": 50,
      "estimated_construction_cost": 50000000,
      "annual_operating_cost": 15768000
    }
  },
  "analysis": "Comprehensive AI-generated analysis text..."
}
```

**Status Codes:**
- `200 OK` - Successful analysis
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error or API failure

---

### GET /api/datacenter-types

Get all available data center presets and their specifications.

**Response:**
```json
{
  "small": {
    "name": "Small Edge Data Center",
    "power_mw": 1,
    "servers": 100,
    "square_feet": 5000,
    "water_gallons_per_day": 25000,
    "employees": 10
  },
  "medium": {
    "name": "Medium Enterprise Data Center",
    "power_mw": 10,
    "servers": 1000,
    "square_feet": 50000,
    "water_gallons_per_day": 300000,
    "employees": 50
  },
  "large": {
    "name": "Large Hyperscale Data Center",
    "power_mw": 50,
    "servers": 10000,
    "square_feet": 250000,
    "water_gallons_per_day": 1500000,
    "employees": 200
  },
  "mega": {
    "name": "Mega Hyperscale Data Center",
    "power_mw": 150,
    "servers": 50000,
    "square_feet": 750000,
    "water_gallons_per_day": 5000000,
    "employees": 500
  }
}
```

**Status Codes:**
- `200 OK` - Success

---

### GET /health

Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T12:00:00.000000"
}
```

**Status Codes:**
- `200 OK` - Server is healthy

---

## External APIs Used

### 1. US Census Bureau API

**Base URL:** `https://api.census.gov/data`

**Endpoints Used:**
- Geocoding: `https://geocoding.geo.census.gov/geocoder/geographies/coordinates`
- Population Data: `https://api.census.gov/data/2021/acs/acs5`

**Rate Limits:** None (free, unlimited)

**Documentation:** https://www.census.gov/data/developers/guidance/api-user-guide.html

**Example:**
```bash
curl "https://api.census.gov/data/2021/acs/acs5?get=NAME,B01003_001E&for=county:061&in=state:06&key=YOUR_KEY"
```

---

### 2. Energy Information Administration (EIA) API

**Base URL:** `https://api.eia.gov/v2`

**Endpoints Used:**
- Electricity Retail Sales: `/electricity/retail-sales/data/`

**Rate Limits:** None specified

**Documentation:** https://www.eia.gov/opendata/documentation.php

**Example:**
```bash
curl "https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=YOUR_KEY&frequency=annual&data[0]=price&facets[stateid][]=CA"
```

---

### 3. OpenWeatherMap API

**Base URL:** `https://api.openweathermap.org/data/2.5`

**Endpoints Used:**
- Current Weather: `/weather`

**Rate Limits:** 
- Free: 60 calls/minute
- Paid: Higher limits available

**Documentation:** https://openweathermap.org/current

**Example:**
```bash
curl "https://api.openweathermap.org/data/2.5/weather?lat=40.7128&lon=-74.0060&appid=YOUR_KEY&units=imperial"
```

---

### 4. Mapbox API

**Base URL:** `https://api.mapbox.com`

**Used For:**
- Map tiles and visualization
- Geocoding (frontend)

**Rate Limits:**
- Free: 50,000 map loads/month
- Paid: Higher limits available

**Documentation:** https://docs.mapbox.com/api/

**Map Style Used:** `mapbox://styles/mapbox/streets-v12`

---

### 5. Anthropic Claude API

**Base URL:** `https://api.anthropic.com/v1`

**Model:** `claude-3-5-sonnet-20241022`

**Rate Limits:** Based on tier
- Tier 1: 50 requests/min
- Higher tiers: More capacity

**Documentation:** https://docs.anthropic.com/

**Request Format:**
```python
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 2000,
  "messages": [{
    "role": "user",
    "content": "Analysis prompt..."
  }]
}
```

**Pricing:**
- Input: $3.00 / million tokens
- Output: $15.00 / million tokens
- Typical analysis: ~$0.003/request

---

## Data Sources & Calculations

### Energy Calculations

**Formula:**
```
Annual kWh = Power (MW) × 1000 × 24 hours × 365 days
Annual Cost = Annual kWh × Local Electricity Rate
```

**Carbon Emissions:**
- US Grid Average: 0.92 lbs CO₂ per kWh
- Annual CO₂ (tons) = (Annual kWh × 0.92) / 2000

### Water Usage

**Factors:**
- Direct cooling water
- Evaporative cooling losses
- Humidity control
- Backup systems

**Comparison Metrics:**
- Average US resident: 82 gallons/day
- Olympic pool: 660,000 gallons

### Economic Impact

**Construction Cost:**
- Estimated at $1,000/sq ft
- Includes: building, equipment, infrastructure

**Operating Cost:**
- Energy: ~66% of operating costs
- Total = Energy Cost × 1.5

### Population Impact

**Data Points:**
- County/regional population from Census
- Average household size: 2.5 people
- Average household electricity: 10,000 kWh/year

**Calculations:**
```
Regional Energy = (Population / 2.5) × 10,000 kWh
Impact % = (Data Center kWh / Regional Energy) × 100
```

---

## Error Handling

### Common Error Responses

**Invalid Coordinates:**
```json
{
  "error": "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180."
}
```

**Missing API Key:**
```json
{
  "error": "API configuration error. Please contact administrator."
}
```

**Rate Limit Exceeded:**
```json
{
  "error": "Rate limit exceeded for external API. Please try again later."
}
```

**Invalid Configuration:**
```json
{
  "error": "Invalid data center configuration. Power must be greater than 0."
}
```

---

## Rate Limiting & Best Practices

### Recommended Usage

1. **Cache Results:** Don't re-analyze the same location with same config
2. **Batch Requests:** If comparing locations, space them out
3. **Handle Errors:** Implement retry logic with exponential backoff
4. **Monitor Usage:** Track API quotas for external services

### Sample Rate Limits

| API | Free Tier Limit | Recommended Max |
|-----|----------------|-----------------|
| Census | Unlimited | 100/min |
| EIA | Unlimited | 100/min |
| OpenWeatherMap | 60/min | 30/min |
| Mapbox | 50k loads/month | 1000/day |
| Anthropic | Varies by tier | Based on quota |

---

## Testing the API

### Using cURL

**Test Health:**
```bash
curl http://localhost:5000/health
```

**Get Data Center Types:**
```bash
curl http://localhost:5000/api/datacenter-types
```

**Analyze Location:**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194,
    "size": "medium",
    "custom": false
  }'
```

### Using Python

```python
import requests

response = requests.post(
    'http://localhost:5000/api/analyze',
    json={
        'latitude': 37.7749,
        'longitude': -122.4194,
        'size': 'large',
        'custom': False
    }
)

print(response.json())
```

### Using JavaScript (Frontend)

```javascript
const response = await axios.post('/api/analyze', {
  latitude: 37.7749,
  longitude: -122.4194,
  size: 'medium',
  custom: false
});

console.log(response.data);
```

---

## Security Considerations

1. **API Keys:** Never expose API keys in client-side code
2. **CORS:** Properly configured for development and production
3. **Input Validation:** All coordinates and configs are validated
4. **Rate Limiting:** Consider implementing server-side rate limiting
5. **HTTPS:** Use HTTPS in production deployment

---

## Support & Resources

- **Main Documentation:** [README.md](README.md)
- **Setup Guide:** [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **GitHub Issues:** Report bugs and request features

For API-specific questions, refer to the official documentation of each service.

