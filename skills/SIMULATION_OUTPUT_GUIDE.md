# Data Center Simulation Output - Frontend For SARVESH our FRONTEND

## Overview
This guide explains the simulation output data structure and provides recommendations for visualizing the temporal and community effects of a data center. The simulation runs an hour-by-hour analysis over a full year (8,760 hours) to model realistic power consumption, cooling efficiency, and community impact.

---

## API Endpoint

### `/api/forecast` (POST)
Returns a comprehensive simulation report with hourly data sampled every 24 hours.

### `/api/forecast/stream` (POST)
Streams simulation progress in real-time with Server-Sent Events (SSE).

---

## Data Structure

```json
{
  "timestamp": "ISO-8601 timestamp",
  "location": { ... },
  "datacenter": { ... },
  "climate": { ... },
  "simulation": { ... },
  "energy": { ... },
  "carbon": { ... },
  "community_impact": { ... },
  "analysis": "LLM-generated text analysis"
}
```

---

## Key Sections for Visualization

## 1. **Time-Series Data** (`simulation.hourly_data`)

### Structure
```json
"hourly_data": {
  "hours": [0, 24, 48, 72, ...],           // Hour indices (sampled every 24 hours)
  "power_kw": [12500, 13200, ...],         // Power consumption in kilowatts
  "utilization": [65.5, 72.3, ...],        // Server utilization (0-100%)
  "pue": [1.35, 1.42, ...]                 // Power Usage Effectiveness
}
```

### What It Means
- **hours**: Array of hour indices (0-8760 for a full year), sampled every 24 hours (365 data points)
- **power_kw**: Total facility power consumption including IT load + cooling overhead
- **utilization**: Percentage of servers actively processing workloads (affected by time of day, day of week, season)
- **pue**: Ratio of total facility power to IT equipment power (lower = more efficient cooling)

### Visualization Ideas

#### A. Power Consumption Over Time
**Chart Type**: Line chart or area chart
- **X-axis**: Time (convert hours to dates/months)
- **Y-axis**: Power (kW or MW)
- **Purpose**: Show seasonal patterns, peak usage times, and overall trend
- **Key Insights**: Higher in summer (more cooling needed), peaks during business hours for enterprise data centers

```javascript
// Example: Convert hours to dates
const startDate = new Date();
const dates = hourly_data.hours.map(hour => {
  const date = new Date(startDate);
  date.setHours(date.getHours() + hour);
  return date;
});

// Chart config
{
  type: 'line',
  data: {
    labels: dates,
    datasets: [{
      label: 'Power Consumption (kW)',
      data: hourly_data.power_kw,
      borderColor: '#ff6b6b',
      fill: true,
      backgroundColor: 'rgba(255, 107, 107, 0.1)'
    }]
  }
}
```

#### B. Server Utilization Pattern
**Chart Type**: Line chart with dual Y-axis (utilization + power)
- **Purpose**: Correlate workload patterns with power consumption
- **Key Insights**: Enterprise centers have weekday peaks, cloud centers have evening peaks, AI training centers have constant high utilization

#### C. Cooling Efficiency (PUE) Over Time
**Chart Type**: Line chart with color zones
- **Color Zones**: 
  - Green (< 1.2): Excellent efficiency
  - Yellow (1.2-1.4): Good efficiency
  - Orange (1.4-1.6): Fair efficiency
  - Red (> 1.6): Poor efficiency
- **Purpose**: Show how weather affects cooling efficiency
- **Key Insights**: PUE increases during hot summer months

---

## 2. **Summary Metrics** (`simulation`)

### Structure
```json
"simulation": {
  "hours_simulated": 8760,              // Total hours (1 year = 8760)
  "peak_power_kw": 15250.5,            // Maximum power draw
  "average_power_kw": 12580.3,         // Mean power consumption
  "annual_consumption_mwh": 110203.7,  // Total energy used in a year
  "average_utilization": 67.8,         // Mean server utilization %
  "peak_utilization": 98.2,            // Maximum utilization %
  "average_pue": 1.38,                 // Mean cooling efficiency
  "best_pue": 1.15,                    // Best cooling efficiency (cool days)
  "worst_pue": 1.85                    // Worst cooling efficiency (hot days)
}
```

### Visualization Ideas

#### D. Key Metrics Dashboard
**Chart Type**: Stat cards with sparklines
- **Peak vs Average Power**: Show baseline with peak indicator
- **Utilization Range**: Display min/avg/max with bar indicator
- **PUE Rating**: Color-coded badge with explanation

```javascript
// Example stat card
<div class="metric-card">
  <div class="metric-value">12,580 kW</div>
  <div class="metric-label">Average Power</div>
  <div class="metric-range">Peak: 15,250 kW</div>
  <div class="sparkline">[mini chart of hourly_data.power_kw]</div>
</div>
```

---

## 3. **Energy Impact** (`energy`)

### Structure
```json
"energy": {
  "annual_mwh": 110203.7,              // Megawatt-hours per year
  "annual_kwh": 110203700,             // Kilowatt-hours per year
  "annual_cost": 13545000,             // Total electricity cost ($)
  "grid_region": "PJM",                // Grid operator region
  "base_rate": 0.09,                   // $/kWh base rate
  "peak_multiplier": 2.0,              // Peak pricing multiplier
  "percent_increase": 2.35             // % increase in regional demand
}
```

### Visualization Ideas

#### E. Cost Breakdown
**Chart Type**: Donut chart or stacked bar
- **Segments**: Base cost vs peak cost
- **Purpose**: Show financial impact over time
- **Add-on**: Monthly cost projection

#### F. Grid Impact Gauge
**Chart Type**: Radial gauge or thermometer
- **Value**: `percent_increase` (2.35%)
- **Zones**: 
  - 0-0.5%: Low impact (green)
  - 0.5-2%: Moderate impact (yellow)
  - 2-5%: High impact (orange)
  - >5%: Critical impact (red)

---

## 4. **Carbon Emissions** (`carbon`)

### Structure
```json
"carbon": {
  "annual_tons_co2": 40384.2,          // CO2 emissions per year (US tons)
  "carbon_intensity_kg_kwh": 0.367,    // kg CO2 per kWh (grid-specific)
  "equivalent_cars": 8779.6,           // Equivalent passenger vehicles
  "equivalent_homes": 11020.4          // Equivalent homes powered
}
```

### Visualization Ideas

#### G. Environmental Impact Comparison
**Chart Type**: Horizontal bar chart with icons
- **Comparisons**: 
  - 🚗 X,XXX cars driven for a year
  - 🏠 X,XXX homes powered for a year
  - 🌳 X,XXX trees needed to offset
- **Purpose**: Make carbon impact relatable

#### H. Carbon Timeline
**Chart Type**: Area chart
- **X-axis**: Time (months)
- **Y-axis**: Cumulative CO2 (tons)
- **Purpose**: Show emissions accumulation over time

---

## 5. **Community Impact** (`community_impact`)

### Structure
```json
"community_impact": {
  "peak_impact_percent": 2.35,         // % of regional grid capacity at peak
  "average_impact_percent": 1.94,      // % of regional grid capacity average
  "stability_risk": "moderate",        // low | moderate | high | critical
  "grid_classification": "moderate",   // negligible | low | moderate | high | critical
  
  "household_impact": {
    "annual_cost_per_household": 142.50,
    "monthly_cost_per_household": 11.88,
    "percentage_increase": 9.9,        // % increase in electricity bill
    "total_community_cost": 5700000    // Total infrastructure cost to community
  },
  
  "infrastructure_cost": {
    "transmission": 1250000,           // Transmission line upgrades
    "distribution": 2800000,           // Distribution network upgrades
    "substation": 1650000,             // Substation capacity expansion
    "total": 5700000,                  // Total infrastructure investment needed
    "required": true                   // Whether upgrades are required
  }
}
```

### Visualization Ideas

#### I. Community Impact Dashboard
**Chart Type**: Multi-panel dashboard

**Panel 1: Grid Stability Risk**
- Circular indicator with color-coded risk level
- Risk levels: Low (green) → Moderate (yellow) → High (orange) → Critical (red)

**Panel 2: Household Bill Impact**
```
┌─────────────────────────────────────┐
│ Average Bill Impact                 │
│ +$11.88/month (+9.9%)              │
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░ 9.9%         │
└─────────────────────────────────────┘
```

**Panel 3: Infrastructure Investment**
- Stacked bar showing cost breakdown:
  - Transmission
  - Distribution
  - Substation
- Total amortized over 15 years

#### J. Regional Grid Impact Map
**Chart Type**: Animated map visualization
- **Show**: Data center location with "heat radius" indicating grid impact
- **Color intensity**: Based on `peak_impact_percent`
- **Popup info**: Stability risk, household impact

---

## 6. **Comparison Views** (Multiple Data Centers)

If users simulate multiple scenarios or locations, create comparison charts:

### K. Side-by-Side Comparison
**Chart Type**: Grouped bar chart
- **Categories**: Power, Cost, Carbon, Community Impact
- **Groups**: Location A vs Location B

### L. Decision Matrix
**Chart Type**: Scatter plot
- **X-axis**: Community Impact (household cost increase %)
- **Y-axis**: Carbon Emissions (tons CO2/year)
- **Bubble size**: Total cost
- **Color**: Cooling efficiency (PUE)

---

## Advanced Visualizations

### M. Interactive Timeline Scrubber
Allow users to "scrub" through the year and see how metrics change hour by hour or day by day.

```javascript
// Pseudo-code
<input type="range" min="0" max="8760" 
       onChange={(hour) => {
         updateCharts({
           power: hourly_data.power_kw[hour/24],
           utilization: hourly_data.utilization[hour/24],
           pue: hourly_data.pue[hour/24]
         });
       }} />
```

### N. Seasonal Heatmap
**Chart Type**: Calendar heatmap (like GitHub contributions)
- **X-axis**: Weeks of the year
- **Y-axis**: Days of the week
- **Color**: Power consumption intensity
- **Purpose**: Identify seasonal patterns and anomalies

### O. Animated Gauge Cluster
Show real-time simulation progress with animated gauges:
- Power draw
- Server utilization
- Cooling efficiency (PUE)
- Grid impact

---

## Data Interpretation Guide

### Power Usage Effectiveness (PUE)
- **1.0**: Theoretical perfect (no cooling overhead)
- **1.02-1.2**: Excellent (liquid cooling, optimal climate)
- **1.2-1.4**: Good (efficient air/water cooling)
- **1.4-1.6**: Fair (standard air cooling)
- **1.6+**: Poor (hot climate, inefficient cooling)

### Server Utilization Patterns
- **Enterprise**: 35% average, peaks 9am-5pm weekdays
- **Cloud Compute**: 65% average, peaks 7pm-11pm
- **AI Training**: 85% average, constant load
- **Gaming**: 45% average, peaks evenings/weekends

### Grid Regions (US)
The simulation uses real grid data from:
- **CAISO** (California): High renewable energy, duck curve pricing
- **ERCOT** (Texas): Volatile pricing, isolated grid
- **PJM** (Mid-Atlantic): Stable market, nuclear + gas mix
- **NYISO** (New York): Cleanest grid in US (hydro + nuclear)
- **SPP** (Plains): High wind penetration, seasonal variation
- **ISONE** (New England): Highest prices in US
- **MISO** (Midwest): Coal + wind mix
- **SERC** (Southeast): Gas + nuclear
- **PACNW** (Pacific Northwest): Hydro-dominated, very clean
- **WEST** (Mountain): Solar potential, coal transition

---

## Example Visualization Layout

```
┌─────────────────────────────────────────────────────────┐
│  DATA CENTER SIMULATION REPORT                          │
│  Location: [City, State]  |  Grid: [REGION]            │
└─────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│  Peak Power      │  Avg Power       │  Annual Energy   │
│  15,250 kW       │  12,580 kW       │  110,204 MWh    │
│  [sparkline]     │  [sparkline]     │  [sparkline]    │
└──────────────────┴──────────────────┴──────────────────┘

┌───────────────────────────────────────────────────────┐
│  Power Consumption Over Time                          │
│  [Line chart: power_kw vs hours, spanning 1 year]   │
└───────────────────────────────────────────────────────┘

┌─────────────────────────┬─────────────────────────────┐
│  Server Utilization     │  Cooling Efficiency (PUE)  │
│  [Line chart: util %]   │  [Line chart: PUE with     │
│                         │   color zones]             │
└─────────────────────────┴─────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│  Community Impact                                     │
│  ┌──────────────────┬──────────────────┬───────────┐ │
│  │ Grid Impact      │ Household Bills  │ Risk      │ │
│  │ +2.35%          │ +$11.88/mo       │ MODERATE  │ │
│  │ [gauge]         │ [bar]            │ [badge]   │ │
│  └──────────────────┴──────────────────┴───────────┘ │
└───────────────────────────────────────────────────────┘

┌─────────────────────────┬─────────────────────────────┐
│  Carbon Emissions       │  Infrastructure Cost       │
│  40,384 tons CO2/yr    │  $5.7M total               │
│  ≈ 8,780 cars          │  [breakdown chart]         │
│  [comparison chart]     │                            │
└─────────────────────────┴─────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│  AI Analysis                                          │
│  [LLM-generated insights and recommendations]        │
└───────────────────────────────────────────────────────┘
```

---

## Implementation Tips

### 1. **Progressive Loading**
- Show summary metrics immediately
- Load charts progressively as data is processed
- Use the `/api/forecast/stream` endpoint to show real-time progress

### 2. **Responsive Design**
- Mobile: Stack charts vertically, show key metrics first
- Desktop: Use grid layout with multiple panels
- Tablet: 2-column layout

### 3. **Interactivity**
- Hovering on charts shows exact values
- Click on time periods to zoom in
- Toggle between different metrics (power/cost/carbon)
- Export data as CSV or PNG

### 4. **Performance**
- The API samples hourly data every 24 hours (365 points instead of 8760)
- Use canvas-based charting for large datasets (Chart.js, D3.js)
- Implement virtualization for table views

### 5. **Data Updates**
- Cache simulation results (they're deterministic for given inputs)
- Show "last updated" timestamp
- Allow users to re-run simulations with different parameters

---

## Chart Library Recommendations

### For Quick Implementation:
- **Chart.js**: Easy to use, good defaults
- **Recharts**: React-friendly, declarative API
- **ApexCharts**: Modern, interactive, great mobile support

### For Advanced Visualizations:
- **D3.js**: Maximum flexibility and customization
- **Plotly.js**: Scientific charts, 3D support
- **Highcharts**: Professional dashboards (commercial license)

---

## Sample Code Snippets

### Fetch and Display Simulation

```javascript
// Fetch simulation data
const response = await fetch('/api/forecast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    latitude: 40.7128,
    longitude: -74.0060,
    size: 'medium',
    simulation_hours: 8760
  })
});

const data = await response.json();

// Transform hourly data for charting
const chartData = data.simulation.hourly_data.hours.map((hour, index) => ({
  hour: hour,
  date: new Date(data.timestamp).getTime() + (hour * 60 * 60 * 1000),
  power: data.simulation.hourly_data.power_kw[index],
  utilization: data.simulation.hourly_data.utilization[index],
  pue: data.simulation.hourly_data.pue[index]
}));

// Create Chart.js line chart
new Chart(ctx, {
  type: 'line',
  data: {
    labels: chartData.map(d => new Date(d.date)),
    datasets: [{
      label: 'Power (kW)',
      data: chartData.map(d => d.power),
      borderColor: '#3b82f6',
      tension: 0.1
    }]
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: { unit: 'month' }
      },
      y: {
        title: { display: true, text: 'Power (kW)' }
      }
    }
  }
});
```

### Real-Time Streaming Progress

```javascript
const eventSource = new EventSource('/api/forecast/stream', {
  method: 'POST',
  body: JSON.stringify({ /* params */ })
});

eventSource.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  if (update.status === 'progress' && update.simulation_progress) {
    const progress = update.simulation_progress;
    updateProgressBar(progress.percent_complete);
    updateLiveMetrics({
      avgPower: progress.current_avg_power_kw,
      avgUtil: progress.current_avg_utilization,
      avgPUE: progress.current_avg_pue
    });
  }
  
  if (update.status === 'complete') {
    displayFinalResults(update.data);
    eventSource.close();
  }
};
```

---

## Key Takeaways for Frontend Dev

1. **The simulation generates hourly data for an entire year** (8,760 hours)
2. **Data is sampled every 24 hours** in the API response to reduce payload size
3. **Three main time-series**: Power consumption, server utilization, cooling efficiency (PUE)
4. **Community impact is the most important metric** for stakeholders (household bills, grid stability)
5. **Use color coding consistently**: Green = good, Yellow = moderate, Orange = concerning, Red = critical
6. **Make it interactive**: Let users explore different time periods and scenarios
7. **Tell a story**: Show how the data center affects the community over time, not just numbers

---

## Questions?

If you need clarification on any data fields or visualization approaches, refer to:
- **Simulation code**: `backend/services/simulate.py`
- **API endpoint**: `backend/app.py` (line 850+)
- **Example output**: Check `backend/forecast_report.json` after running a simulation

