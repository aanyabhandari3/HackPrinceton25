# Simulation Data Quick Reference - For SARVESH our FRONTEND

## TL;DR for Frontend Dev

**What you get**: A year-long (8,760 hours) simulation of data center operations sampled every 24 hours (365 data points).

**Key time-series arrays to visualize**:
```javascript
simulation.hourly_data.power_kw       // Power consumption over time
simulation.hourly_data.utilization    // Server workload patterns
simulation.hourly_data.pue            // Cooling efficiency
```

**Most important metrics for users**:
```javascript
community_impact.household_impact.monthly_cost_per_household  // How much bills increase
community_impact.stability_risk                               // Grid stability risk
carbon.annual_tons_co2                                        // Environmental impact
```

---

## Annotated JSON Response

```javascript
{
  // ==========================================
  // METADATA
  // ==========================================
  "timestamp": "2025-01-15T10:30:00.000Z",  // When simulation was run
  
  // ==========================================
  // LOCATION INFO
  // ==========================================
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "name": "New York, NY",            // City name
    "state": "New York",
    "state_fips": "36",
    "grid_region": "NYISO",            // Which power grid (CAISO, ERCOT, PJM, etc.)
    "population": 8336817,             // Local population
    "median_income": 67046             // Median household income ($)
  },
  
  // ==========================================
  // DATA CENTER SPECS
  // ==========================================
  "datacenter": {
    "name": "Medium Enterprise Data Center",
    "power_mw": 10,                    // Rated power capacity (megawatts)
    "servers": 1000,                   // Number of servers
    "square_feet": 50000,              // Facility size
    "water_gallons_per_day": 300000,   // Water usage for cooling
    "employees": 50,
    "cooling_type": "air_cooled",      // air_cooled | water_cooled | evaporative | liquid_cooling
    "server_type": "enterprise",       // enterprise | gpu_compute | nvidia_h100 | tpu_v4
    "datacenter_type": "enterprise"    // enterprise | cloud_compute | ai_training | gaming
  },
  
  // ==========================================
  // CURRENT WEATHER (for cooling calculations)
  // ==========================================
  "climate": {
    "temperature": 45.2,               // Current temp (°F)
    "humidity": 65,                    // Current humidity (%)
    "description": "Partly cloudy",
    "wind_speed": 8.5                  // mph
  },
  
  // ==========================================
  // ⭐ SIMULATION RESULTS (MAIN DATA) ⭐
  // ==========================================
  "simulation": {
    "hours_simulated": 8760,           // Always 8760 for 1 year
    
    // Summary statistics
    "peak_power_kw": 15250.5,         // Maximum power draw (kW)
    "average_power_kw": 12580.3,      // Mean power draw (kW)
    "annual_consumption_mwh": 110203.7, // Total energy used (MWh)
    
    "average_utilization": 67.8,      // Mean server utilization (0-100%)
    "peak_utilization": 98.2,         // Max utilization (%)
    
    "average_pue": 1.38,              // Mean cooling efficiency (lower is better)
    "best_pue": 1.15,                 // Best PUE (cool weather)
    "worst_pue": 1.85,                // Worst PUE (hot weather)
    
    // ⭐ TIME-SERIES DATA - VISUALIZE THESE ⭐
    "hourly_data": {
      "hours": [0, 24, 48, 72, ...],           // 365 elements (every 24th hour)
      "power_kw": [12500, 13200, 11800, ...],  // 365 power readings
      "utilization": [65.5, 72.3, 58.9, ...],  // 365 utilization readings
      "pue": [1.35, 1.42, 1.28, ...]          // 365 PUE readings
    }
    // ℹ️ Use hours[i] as X-axis, convert to dates for display
    // ℹ️ Use power_kw[i], utilization[i], pue[i] as Y-axis values
  },
  
  // ==========================================
  // ENERGY COSTS & GRID IMPACT
  // ==========================================
  "energy": {
    "annual_mwh": 110203.7,           // Energy consumed per year (MWh)
    "annual_kwh": 110203700,          // Same in kWh
    "annual_cost": 13545000,          // Total electricity cost ($)
    "grid_region": "NYISO",           // Power grid region
    "base_rate": 0.11,                // $/kWh base rate
    "peak_multiplier": 2.2,           // Peak pricing multiplier
    "percent_increase": 2.35          // % increase in regional energy demand
    // ℹ️ Show percent_increase as a gauge: <0.5% = low, 0.5-2% = moderate, 2-5% = high, >5% = critical
  },
  
  // ==========================================
  // CARBON EMISSIONS
  // ==========================================
  "carbon": {
    "annual_tons_co2": 40384.2,       // CO2 emissions (US tons/year)
    "carbon_intensity_kg_kwh": 0.178, // Grid carbon intensity (kg CO2 per kWh)
    "equivalent_cars": 8779.6,        // ≈ driving X cars for a year
    "equivalent_homes": 11020.4       // ≈ powering X homes for a year
    // ℹ️ Use comparisons to make it relatable: "Equivalent to 8,780 cars"
  },
  
  // ==========================================
  // ⭐ COMMUNITY IMPACT (MOST IMPORTANT) ⭐
  // ==========================================
  "community_impact": {
    // Grid impact percentages
    "peak_impact_percent": 2.35,      // % of regional grid at peak demand
    "average_impact_percent": 1.94,   // % of regional grid on average
    
    // Risk assessment
    "stability_risk": "moderate",     // low | moderate | high | critical
    "grid_classification": "moderate", // negligible | low | moderate | high | critical
    // ℹ️ Color code these: low=green, moderate=yellow, high=orange, critical=red
    
    // Effect on households
    "household_impact": {
      "annual_cost_per_household": 142.50,      // Extra $ per household per year
      "monthly_cost_per_household": 11.88,      // Extra $ per household per month
      "percentage_increase": 9.9,               // % increase in electricity bills
      "total_community_cost": 5700000           // Total infrastructure cost
      // ℹ️ Highlight monthly_cost_per_household - users care about $/month
    },
    
    // Infrastructure upgrades required
    "infrastructure_cost": {
      "transmission": 1250000,         // Transmission line upgrades ($)
      "distribution": 2800000,         // Distribution network upgrades ($)
      "substation": 1650000,           // Substation expansion ($)
      "total": 5700000,                // Total infrastructure investment ($)
      "required": true                 // true = upgrades needed, false = fits in existing capacity
      // ℹ️ If required=false, show "No major upgrades needed" in green
    }
  },
  
  // ==========================================
  // AI ANALYSIS (for display)
  // ==========================================
  "analysis": "This data center would represent a moderate impact on the New York grid..."
  // ℹ️ This is a multi-paragraph text analysis from Claude. Display in a text box.
}
```

---

## Chart Recommendations by Priority

### 🔴 Must-Have Charts (Priority 1)

1. **Power Over Time** - Line chart of `simulation.hourly_data.power_kw`
2. **Community Cost Impact** - Big number display of `community_impact.household_impact.monthly_cost_per_household`
3. **Grid Stability Badge** - Color-coded badge for `community_impact.stability_risk`
4. **Carbon Comparison** - Icon-based display of `carbon.equivalent_cars` and `carbon.equivalent_homes`

### 🟡 Nice-to-Have Charts (Priority 2)

5. **Utilization Pattern** - Line chart of `simulation.hourly_data.utilization`
6. **PUE Efficiency** - Line chart of `simulation.hourly_data.pue` with color zones
7. **Infrastructure Cost Breakdown** - Stacked bar of `community_impact.infrastructure_cost`

### 🟢 Optional Advanced (Priority 3)

8. **Seasonal Heatmap** - Calendar view of power consumption
9. **Cost Calculator** - Interactive slider showing how cost scales with size
10. **Multi-location Comparison** - Side-by-side comparison of multiple simulations

---

## Common Calculations

### Convert hours to dates
```javascript
const startDate = new Date(data.timestamp);
const dates = data.simulation.hourly_data.hours.map(hour => {
  const d = new Date(startDate);
  d.setHours(d.getHours() + hour);
  return d;
});
```

### Calculate monthly values from annual
```javascript
const monthlyPowerMWh = data.simulation.annual_consumption_mwh / 12;
const monthlyCost = data.energy.annual_cost / 12;
const monthlyCO2 = data.carbon.annual_tons_co2 / 12;
```

### Format large numbers
```javascript
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toFixed(0);
}

// Usage:
formatNumber(12580000)  // "12.6M"
formatNumber(15250)     // "15.3K"
```

### Color coding for risk levels
```javascript
const riskColors = {
  'low': '#22c55e',         // green
  'negligible': '#22c55e',  // green
  'moderate': '#eab308',    // yellow
  'high': '#f97316',        // orange
  'critical': '#ef4444'     // red
};

const riskColor = riskColors[data.community_impact.stability_risk];
```

### PUE efficiency rating
```javascript
function getPUErating(pue) {
  if (pue < 1.2) return { rating: 'Excellent', color: '#22c55e' };
  if (pue < 1.4) return { rating: 'Good', color: '#84cc16' };
  if (pue < 1.6) return { rating: 'Fair', color: '#eab308' };
  return { rating: 'Poor', color: '#ef4444' };
}

const pueRating = getPUErating(data.simulation.average_pue);
// { rating: 'Good', color: '#84cc16' }
```

---

## Responsive Layout Example

```html
<!-- Mobile: Stack vertically -->
<div class="mobile-view">
  <div class="summary-cards">
    <div class="card">
      <h3>Monthly Bill Impact</h3>
      <div class="big-number">+$11.88</div>
      <div class="subtext">per household</div>
    </div>
    <!-- More cards... -->
  </div>
  
  <div class="chart-container">
    <canvas id="powerChart"></canvas>
  </div>
  
  <!-- More charts... -->
</div>

<!-- Desktop: Grid layout -->
<div class="desktop-view">
  <div class="grid grid-cols-3 gap-4">
    <div class="col-span-2">
      <canvas id="powerChart"></canvas>
    </div>
    <div class="col-span-1">
      <div class="summary-cards">...</div>
    </div>
    <div class="col-span-3">
      <canvas id="utilizationChart"></canvas>
    </div>
  </div>
</div>
```

---

## API Usage Examples

### Basic Request
```javascript
const response = await fetch('http://localhost:5001/api/forecast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    latitude: 37.7749,
    longitude: -122.4194,
    size: 'medium',              // small | medium | large | mega
    simulation_hours: 8760       // 8760 = 1 year
  })
});

const data = await response.json();
```

### Custom Data Center
```javascript
const response = await fetch('http://localhost:5001/api/forecast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    latitude: 37.7749,
    longitude: -122.4194,
    custom: true,                // Enable custom mode
    name: 'My Custom DC',
    power_mw: 25,
    servers: 2500,
    square_feet: 100000,
    cooling_type: 'water_cooled',
    server_type: 'nvidia_h100',
    datacenter_type: 'ai_training',
    simulation_hours: 8760
  })
});
```

### Streaming (Real-time Progress)
```javascript
const eventSource = new EventSource('/api/forecast/stream?' + new URLSearchParams({
  latitude: 37.7749,
  longitude: -122.4194,
  size: 'medium'
}));

eventSource.addEventListener('message', (e) => {
  const update = JSON.parse(e.data);
  
  switch(update.status) {
    case 'started':
      console.log('Simulation started');
      break;
    case 'progress':
      if (update.simulation_progress) {
        updateProgressBar(update.simulation_progress.percent_complete);
      }
      break;
    case 'complete':
      displayResults(update.data);
      eventSource.close();
      break;
  }
});
```

---

## Testing Data

For development/testing, you can use these sample locations:

```javascript
// San Francisco (CAISO grid - expensive, clean energy)
{ latitude: 37.7749, longitude: -122.4194 }

// Dallas, TX (ERCOT grid - volatile pricing)
{ latitude: 32.7767, longitude: -96.7970 }

// New York, NY (NYISO grid - cleanest in US)
{ latitude: 40.7128, longitude: -74.0060 }

// Seattle, WA (PACNW grid - cheap hydro power)
{ latitude: 47.6062, longitude: -122.3321 }
```

---

## Common Issues & Solutions

### Issue: Charts rendering blank
**Solution**: Make sure arrays are the same length and not undefined
```javascript
// Check data before rendering
if (!data.simulation.hourly_data.power_kw || 
    data.simulation.hourly_data.power_kw.length === 0) {
  console.error('No power data available');
  return;
}
```

### Issue: Dates showing incorrectly
**Solution**: Convert hour indices to proper dates
```javascript
// ❌ Wrong - using hour indices directly
labels: data.simulation.hourly_data.hours

// ✅ Correct - convert to dates
labels: data.simulation.hourly_data.hours.map(hour => {
  const date = new Date(data.timestamp);
  date.setHours(date.getHours() + hour);
  return date;
})
```

### Issue: Large numbers overflowing UI
**Solution**: Format with K/M suffixes
```javascript
function formatCurrency(value) {
  if (value >= 1000000) return `$${(value/1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value/1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}
```

---

## Color Palette Suggestion

```css
:root {
  /* Status colors */
  --status-excellent: #22c55e;  /* Green */
  --status-good: #84cc16;       /* Light green */
  --status-fair: #eab308;       /* Yellow */
  --status-poor: #f97316;       /* Orange */
  --status-critical: #ef4444;   /* Red */
  
  /* Data viz colors */
  --chart-power: #3b82f6;       /* Blue */
  --chart-utilization: #8b5cf6; /* Purple */
  --chart-pue: #ec4899;         /* Pink */
  --chart-carbon: #64748b;      /* Gray */
  
  /* Background zones */
  --zone-excellent: rgba(34, 197, 94, 0.1);
  --zone-good: rgba(132, 204, 22, 0.1);
  --zone-fair: rgba(234, 179, 8, 0.1);
  --zone-poor: rgba(239, 68, 68, 0.1);
}
```

---

## Resources

- **Full Documentation**: See `SIMULATION_OUTPUT_GUIDE.md`
- **Backend Code**: `backend/services/simulate.py`
- **API Endpoints**: `backend/app.py`
- **Example Output**: `backend/forecast_report.json` (generated after running simulation)

---

## Questions?

Ask yourself:
1. Can a non-technical user understand this visualization?
2. Does it show change over time clearly?
3. Is the community impact obvious?
4. Can they compare different scenarios?

If yes to all → you're good! 🎉

