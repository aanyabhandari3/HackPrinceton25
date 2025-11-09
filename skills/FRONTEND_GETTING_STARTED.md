# Frontend Developer - Getting Started Guide - For SARVESH our FRONTEND

Welcome! This guide will help you quickly understand and visualize the data center simulation output.

## 📚 Documentation Overview

We've created three comprehensive guides for you:

### 1. 🚀 **START HERE**: [SIMULATION_QUICK_REF.md](./SIMULATION_QUICK_REF.md)
- **What it is**: Quick reference with annotated JSON examples
- **When to use**: When you need to quickly look up a field or see example code
- **Reading time**: 10-15 minutes

### 2. 📖 **Deep Dive**: [SIMULATION_OUTPUT_GUIDE.md](./SIMULATION_OUTPUT_GUIDE.md)
- **What it is**: Complete technical documentation
- **When to use**: When you need detailed explanations of visualization approaches
- **Reading time**: 30-45 minutes

### 3. 🎨 **Visual Reference**: [VISUALIZATION_MOCKUP.md](./VISUALIZATION_MOCKUP.md)
- **What it is**: ASCII wireframes and chart specifications
- **When to use**: When you're implementing the UI and need design guidance
- **Reading time**: 20-30 minutes

---

## ⚡ Quick Start (5 minutes)

### Step 1: Start the Backend
```bash
cd backend
python app.py
# Backend runs on http://localhost:5001
```

### Step 2: Make a Test Request
```bash
curl -X POST http://localhost:5001/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.7749,
    "longitude": -122.4194,
    "size": "medium",
    "simulation_hours": 8760
  }'
```

### Step 3: Examine the Response
The response will be a JSON object with this structure:

```javascript
{
  "simulation": {
    "hourly_data": {
      "hours": [0, 24, 48, ...],      // 365 data points
      "power_kw": [12500, 13200, ...], // Power consumption
      "utilization": [65.5, 72.3, ...], // Server utilization
      "pue": [1.35, 1.42, ...]         // Cooling efficiency
    },
    "average_power_kw": 12580.3,
    "peak_power_kw": 15250.5,
    // ... more metrics
  },
  "community_impact": {
    "household_impact": {
      "monthly_cost_per_household": 11.88  // ⭐ KEY METRIC
    },
    "stability_risk": "moderate"  // ⭐ KEY METRIC
  },
  "carbon": {
    "annual_tons_co2": 40384.2  // ⭐ KEY METRIC
  }
  // ... more data
}
```

---

## 🎯 What to Visualize (Priority Order)

### Priority 1: Must-Have (MVP)
1. **Power consumption over time** - Line chart
2. **Monthly household cost impact** - Big number display
3. **Grid stability risk** - Color-coded badge
4. **Carbon emissions comparison** - Icon-based display

### Priority 2: Should-Have
5. **Server utilization pattern** - Line chart
6. **Cooling efficiency (PUE)** - Line chart with zones
7. **Infrastructure cost breakdown** - Horizontal bar chart

### Priority 3: Nice-to-Have
8. **Seasonal heatmap** - Calendar view
9. **Interactive timeline scrubber** - Range slider
10. **Multi-location comparison** - Side-by-side view

---

## 🛠️ Recommended Tech Stack

### Charting Libraries

**Option 1: Chart.js** (Recommended for beginners)
```bash
npm install chart.js
```
- ✅ Easy to learn
- ✅ Great documentation
- ✅ Responsive out of the box
- ❌ Less customization

**Option 2: Recharts** (Recommended for React)
```bash
npm install recharts
```
- ✅ React-friendly (declarative)
- ✅ Clean API
- ✅ Built-in animations
- ❌ React-only

**Option 3: D3.js** (For advanced visualizations)
```bash
npm install d3
```
- ✅ Maximum flexibility
- ✅ Beautiful animations
- ❌ Steeper learning curve
- ❌ More code required

### UI Framework

**Tailwind CSS** (Recommended)
```bash
npm install -D tailwindcss
```
- Rapid prototyping
- Consistent design system
- Responsive utilities

---

## 📊 Example Implementation (React + Chart.js)

### Install Dependencies
```bash
npm install chart.js react-chartjs-2 axios
```

### Fetch and Display Simulation

```javascript
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

function SimulationDashboard() {
  const [simData, setSimData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch simulation data
    axios.post('http://localhost:5001/api/forecast', {
      latitude: 37.7749,
      longitude: -122.4194,
      size: 'medium',
      simulation_hours: 8760
    })
    .then(response => {
      setSimData(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching simulation:', error);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading simulation...</div>;
  if (!simData) return <div>Error loading data</div>;

  // Transform data for Chart.js
  const powerChartData = {
    labels: simData.simulation.hourly_data.hours.map(hour => {
      const date = new Date(simData.timestamp);
      date.setHours(date.getHours() + hour);
      return date;
    }),
    datasets: [{
      label: 'Power Consumption (kW)',
      data: simData.simulation.hourly_data.power_kw,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: { unit: 'month' }
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => (value / 1000).toFixed(1) + ' MW'
        }
      }
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <h1>Data Center Impact Simulation</h1>
        <p>{simData.location.name} | {simData.location.grid_region}</p>
      </header>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Peak Power</h3>
          <p className="big-number">
            {(simData.simulation.peak_power_kw / 1000).toFixed(1)} MW
          </p>
        </div>
        
        <div className="card">
          <h3>Household Impact</h3>
          <p className="big-number">
            +${simData.community_impact.household_impact.monthly_cost_per_household.toFixed(2)}/mo
          </p>
        </div>

        <div className="card">
          <h3>Grid Risk</h3>
          <p className={`risk-badge risk-${simData.community_impact.stability_risk}`}>
            {simData.community_impact.stability_risk.toUpperCase()}
          </p>
        </div>

        <div className="card">
          <h3>Carbon Emissions</h3>
          <p className="big-number">
            {simData.carbon.annual_tons_co2.toLocaleString()} tons CO₂
          </p>
          <p className="subtext">
            ≈ {Math.round(simData.carbon.equivalent_cars).toLocaleString()} cars
          </p>
        </div>
      </div>

      {/* Power Chart */}
      <div className="chart-container">
        <h2>Power Consumption Over Time</h2>
        <div style={{ height: '400px' }}>
          <Line data={powerChartData} options={chartOptions} />
        </div>
      </div>

      {/* AI Analysis */}
      <div className="analysis-section">
        <h2>AI Analysis</h2>
        <p>{simData.analysis}</p>
      </div>
    </div>
  );
}

export default SimulationDashboard;
```

### Add Styles (Tailwind or CSS)

```css
/* Basic styling */
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 1rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.big-number {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.risk-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.risk-low { background: #22c55e; color: white; }
.risk-moderate { background: #eab308; color: white; }
.risk-high { background: #f97316; color: white; }
.risk-critical { background: #ef4444; color: white; }

.chart-container {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.analysis-section {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  white-space: pre-wrap;
}
```

---

## 🔍 Key Data Fields Reference

### Most Important Fields to Display:

```javascript
// Power metrics
simulation.peak_power_kw              // Maximum power draw
simulation.average_power_kw           // Average power draw
simulation.annual_consumption_mwh     // Total annual energy

// Time-series data (for charts)
simulation.hourly_data.power_kw       // Array of 365 values
simulation.hourly_data.utilization    // Array of 365 values
simulation.hourly_data.pue            // Array of 365 values

// Community impact (VERY IMPORTANT)
community_impact.household_impact.monthly_cost_per_household
community_impact.stability_risk
community_impact.peak_impact_percent

// Environmental
carbon.annual_tons_co2
carbon.equivalent_cars
carbon.equivalent_homes

// Financial
energy.annual_cost
```

---

## 🎨 Design Tips

### 1. Use Color Coding Consistently
- 🟢 Green: Low impact, excellent efficiency
- 🟡 Yellow: Moderate impact, good efficiency
- 🟠 Orange: High impact, fair efficiency
- 🔴 Red: Critical impact, poor efficiency

### 2. Make Numbers Relatable
Instead of just "40,384 tons CO₂", show:
```
40,384 tons CO₂/year
≈ 8,780 cars driven for a year
≈ 11,020 homes powered
```

### 3. Emphasize Community Impact
Users care most about:
- How much will my electricity bill increase?
- Is this safe for the grid?
- What's the environmental impact?

Put these metrics prominently at the top.

### 4. Progressive Disclosure
- Show summary first (cards with big numbers)
- Then detailed charts (for exploration)
- Finally AI analysis (for context)

---

## 🧪 Testing with Different Scenarios

### Small Data Center (Edge/Retail)
```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "size": "small"
}
```

### Medium Data Center (Enterprise)
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "size": "medium"
}
```

### Mega Data Center (Hyperscale AI)
```json
{
  "latitude": 32.7767,
  "longitude": -96.7970,
  "size": "mega"
}
```

### Custom Data Center
```json
{
  "latitude": 47.6062,
  "longitude": -122.3321,
  "custom": true,
  "power_mw": 25,
  "servers": 2500,
  "cooling_type": "liquid_cooling",
  "server_type": "nvidia_h100",
  "datacenter_type": "ai_training"
}
```

---

## 📱 Responsive Design Checklist

### Mobile (< 640px)
- [ ] Stack all cards vertically
- [ ] Show summary metrics first
- [ ] Collapse/expand detailed charts
- [ ] Use horizontal scrolling for wide charts
- [ ] Simplify chart tooltips

### Tablet (640px - 1024px)
- [ ] 2-column grid for cards
- [ ] Full-width charts
- [ ] Show all sections

### Desktop (> 1024px)
- [ ] 3-4 column grid for cards
- [ ] Side-by-side chart comparisons
- [ ] Sticky header/navigation
- [ ] Show all details

---

## 🐛 Common Issues & Solutions

### Issue 1: Charts not rendering
**Symptom**: Blank canvas or error
**Solution**: Ensure Chart.js is registered properly

```javascript
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);
```

### Issue 2: CORS errors
**Symptom**: Network error in console
**Solution**: Backend already has CORS enabled. If still failing:

```javascript
// In backend/app.py (already configured)
from flask_cors import CORS
CORS(app)

// Or in frontend, use proxy (package.json for React)
"proxy": "http://localhost:5001"
```

### Issue 3: Dates showing incorrectly
**Symptom**: X-axis shows wrong dates
**Solution**: Ensure you're converting hour indices to dates

```javascript
const dates = hourly_data.hours.map(hour => {
  const date = new Date(timestamp);
  date.setHours(date.getHours() + hour);
  return date;
});
```

### Issue 4: Performance issues with large datasets
**Symptom**: Slow rendering, laggy interactions
**Solution**: Data is already sampled (365 points instead of 8760)

If still slow:
```javascript
// Reduce points further for mobile
const mobileData = isMobile() 
  ? data.filter((_, i) => i % 2 === 0)  // Show every other point
  : data;

// Disable animations for large datasets
options.animation = false;
```

---

## ✅ MVP Checklist (1-2 days of work)

### Day 1: Basic Dashboard
- [ ] Fetch data from API
- [ ] Display 4 summary cards (power, cost, risk, carbon)
- [ ] Show basic loading state
- [ ] Handle errors gracefully

### Day 2: Visualizations
- [ ] Add power consumption line chart
- [ ] Add utilization line chart
- [ ] Display AI analysis text
- [ ] Make responsive (mobile + desktop)

### Bonus (Day 3+)
- [ ] Add PUE efficiency chart with zones
- [ ] Add infrastructure cost breakdown
- [ ] Implement timeline scrubber
- [ ] Add export to PDF/CSV
- [ ] Multi-location comparison

---

## 🚀 Next Steps

1. **Read SIMULATION_QUICK_REF.md** (10 min) - Understand the data structure
2. **Copy the example code above** - Get basic dashboard working
3. **Reference VISUALIZATION_MOCKUP.md** - For design details
4. **Iterate and improve** - Add more charts, polish UI

---

## 💬 Questions?

If you're stuck:
1. Check the console for errors
2. Verify API is running: `curl http://localhost:5001/api/health`
3. Look at example output: `backend/forecast_report.json`
4. Read the detailed guides linked above

---

## 📚 Additional Resources

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [D3.js Gallery](https://observablehq.com/@d3/gallery)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

Good luck! You've got all the information you need. The simulation output is rich with data - your job is to make it digestible and beautiful. 🎨✨

