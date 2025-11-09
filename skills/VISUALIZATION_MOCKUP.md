# Data Center Simulation - Visualization Mockup - For SARVESH our FRONTEND

This document shows ASCII wireframes and detailed specifications for each visualization component.

---

## 📊 Dashboard Layout (Desktop)

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    DATA CENTER IMPACT SIMULATION REPORT                          ║
║  📍 San Francisco, CA  |  Grid: CAISO  |  Simulated: Jan 1 - Dec 31, 2025      ║
╚══════════════════════════════════════════════════════════════════════════════════╝

┌────────────────────┬────────────────────┬────────────────────┬────────────────────┐
│   PEAK POWER       │   AVG POWER        │   ANNUAL ENERGY    │   AVG EFFICIENCY   │
│   ⚡ 15.3 MW       │   ⚡ 12.6 MW       │   🔋 110 GWh       │   ❄️ PUE 1.38     │
│   ▂▃▅▇▆▄▃▂▁       │   ▃▃▃▄▄▄▃▃▃       │   ▁▂▃▅▇▇▅▃▂▁       │   🟢 Good          │
└────────────────────┴────────────────────┴────────────────────┴────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│  POWER CONSUMPTION OVER TIME (kW)                                      [⬇️ Export]│
│                                                                                   │
│  16,000 ┤                    ╭──────╮                                            │
│         │                 ╭──╯      ╰──╮                                         │
│  14,000 ┤              ╭──╯            ╰──╮                                      │
│         │           ╭──╯                  ╰──╮                                   │
│  12,000 ┤        ╭──╯                        ╰──╮                                │
│         │     ╭──╯                              ╰──╮                             │
│  10,000 ┤  ╭──╯                                    ╰──╮                          │
│         └──┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴             │
│          Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec             │
│                                                                                   │
│  💡 Higher in summer due to increased cooling demands                            │
└──────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┬────────────────────────────────────────┐
│  SERVER UTILIZATION (%)       [Toggle] │  COOLING EFFICIENCY (PUE) [Toggle]     │
│                                         │                                        │
│  100 ┤         ╭╮                       │  2.0 ┤ ╭─ POOR                        │
│      │      ╭─╮││╭╮                     │      │ │                              │
│   80 ┤    ╭─╯ ╰╯╰╯╰╮                    │  1.6 ┤ ├─ FAIR ─────╮                │
│      │  ╭─╯        ╰─╮                  │      │ │         ╭───╯╰─╮             │
│   60 ┤╭─╯            ╰─╮                │  1.4 ┤ ├─ GOOD ──╯      ╰─╮          │
│      ││                ╰╮               │      │ │                  ╰─╮         │
│   40 ┤╯                 ╰─              │  1.2 ┤ ├─ EXCELLENT         ╰─        │
│      └──────────────────────            │      └──────────────────────           │
│      Jan    Apr    Jul    Oct           │      Jan    Apr    Jul    Oct         │
│                                         │                                        │
│  💡 Higher utilization during business  │  💡 PUE increases during hot summer   │
│     hours and peak seasons              │     months (July-August)              │
└─────────────────────────────────────────┴────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════════╗
║                            🏘️  COMMUNITY IMPACT                                  ║
╚══════════════════════════════════════════════════════════════════════════════════╝

┌───────────────────────┬───────────────────────┬──────────────────────────────────┐
│  GRID IMPACT          │  HOUSEHOLD BILLS      │  STABILITY RISK                  │
│                       │                       │                                  │
│      +2.35%          │      +$11.88/mo      │      ⚠️  MODERATE                │
│                       │                       │                                  │
│  ╭────────╮           │  ▓▓▓▓▓▓▓▓░░░         │  ┌─────────────────┐            │
│  │  ████  │           │  $120 → $131.88      │  │  LOW    ● MODERATE │          │
│  │ ██████ │           │                       │  │         │        │            │
│  │████████│           │  +9.9% increase      │  │    HIGH   CRITICAL │          │
│  ╰────────╯           │                       │  └─────────────────┘            │
│  Regional demand      │  Per household impact │  Grid stability assessment      │
└───────────────────────┴───────────────────────┴──────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE INVESTMENT REQUIRED            Total: $5.7M (amortized over 15y) │
│                                                                                   │
│  Transmission  ████████░░░░░░░░░░░  $1.25M                                       │
│  Distribution  ██████████████████░  $2.80M                                       │
│  Substation    ██████████░░░░░░░░░  $1.65M                                       │
│                                                                                   │
│  💰 These costs are passed to households: $142.50/year per household             │
└──────────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════════╗
║                        🌍  ENVIRONMENTAL IMPACT                                   ║
╚══════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────┬────────────────────────────────────────┐
│  CARBON EMISSIONS                       │  EQUIVALENCIES                         │
│                                         │                                        │
│  40,384 tons CO₂/year                  │  🚗 8,780 cars                         │
│                                         │     driven for a year                  │
│  ╭─────────────────────────╮           │                                        │
│  │   ██████████████████    │           │  🏠 11,020 homes                       │
│  │    Annual Emissions     │           │     powered for a year                 │
│  ╰─────────────────────────╯           │                                        │
│                                         │  🌳 66,300 trees                       │
│  Carbon intensity: 0.367 kg CO₂/kWh   │     needed to offset                   │
│  (PJM grid mix)                        │                                        │
└─────────────────────────────────────────┴────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│  CUMULATIVE CARBON EMISSIONS OVER TIME                                           │
│                                                                                   │
│  50,000 ┤                                                            ╭────       │
│         │                                                    ╭───────╯            │
│  40,000 ┤                                           ╭────────╯                    │
│         │                                   ╭───────╯                             │
│  30,000 ┤                          ╭────────╯                                     │
│         │                  ╭───────╯                                              │
│  20,000 ┤         ╭────────╯                                                      │
│         │ ╭───────╯                                                               │
│  10,000 ┤─╯                                                                       │
│         └──┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴             │
│          Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec             │
│   tons                                                                            │
└──────────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════════╗
║                          💰  FINANCIAL ANALYSIS                                   ║
╚══════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────┬────────────────────────────────────────┐
│  ANNUAL OPERATING COST                  │  COST BREAKDOWN                        │
│                                         │                                        │
│      $13,545,000                       │  Base rate:    ████████████  $9.9M     │
│                                         │  Peak charges: ████░░░░░░░░  $3.6M     │
│  Per kWh: $0.123 avg                   │                                        │
│  (Grid base: $0.09/kWh)                │  Peak hours cost 2.5x more             │
│                                         │  (California CAISO grid)               │
└─────────────────────────────────────────┴────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════════╗
║                          🤖  AI ANALYSIS & INSIGHTS                               ║
╚══════════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────────┐
│  This data center would represent a moderate impact on the California CAISO      │
│  grid. The 2.35% increase in regional demand requires infrastructure upgrades    │
│  costing $5.7M, which translates to approximately $11.88/month per household.    │
│                                                                                   │
│  KEY CONCERNS:                                                                    │
│  • Summer peak demand: The facility's peak load of 15.3 MW coincides with        │
│    California's peak solar generation drop-off (duck curve effect)               │
│  • Water usage: 300,000 gallons/day during California drought conditions         │
│  • Grid stability: Moderate risk - would require utility coordination            │
│                                                                                   │
│  OPPORTUNITIES:                                                                   │
│  • CAISO region has high renewable penetration (60% target by 2030)              │
│  • Potential for demand response programs to reduce peak load                    │
│  • Location near existing transmission infrastructure reduces upgrade costs      │
│                                                                                   │
│  RECOMMENDATIONS:                                                                 │
│  1. Consider liquid cooling to reduce PUE and water consumption                  │
│  2. Implement battery storage for peak shaving (reduce grid impact by 15-20%)    │
│  3. Participate in CAISO demand response programs for cost savings               │
│  4. Schedule batch workloads during off-peak hours (late night/early morning)    │
│                                                                                   │
│  REGULATORY CONSIDERATIONS:                                                       │
│  • California Title 24 energy efficiency requirements                            │
│  • Water Rights: Requires permit from State Water Resources Control Board        │
│  • Environmental Impact Report (EIR) likely required due to scale                │
│  • AB 2127: Data center energy reporting to California Energy Commission         │
└──────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────┐
│  [🔄 Run New Simulation]  [📊 Compare Locations]  [📥 Download Report (PDF)]     │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Mobile Layout

```
╔═══════════════════════════════════════╗
║    DATA CENTER SIMULATION REPORT      ║
║  📍 San Francisco, CA                 ║
║  Grid: CAISO                          ║
╚═══════════════════════════════════════╝

┌─────────────────────────────────────┐
│  PEAK POWER                         │
│  ⚡ 15.3 MW                         │
│  ▂▃▅▇▆▄▃▂▁                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  AVG POWER                          │
│  ⚡ 12.6 MW                         │
│  ▃▃▃▄▄▄▃▃▃                          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  COMMUNITY IMPACT                   │
│  💰 +$11.88/month per household     │
│  ⚠️  MODERATE RISK                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  POWER OVER TIME                    │
│                                     │
│  16k ┤      ╭──────╮                │
│      │   ╭──╯      ╰──╮             │
│  12k ┤╭──╯            ╰──╮          │
│      └┴────┴────┴────┴───┴          │
│      Jan  Apr  Jul  Oct             │
│                                     │
│  [View Details →]                   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  CARBON EMISSIONS                   │
│  40,384 tons CO₂/year              │
│                                     │
│  Equivalent to:                     │
│  🚗 8,780 cars                      │
│  🏠 11,020 homes                    │
│  🌳 66,300 trees needed             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  AI ANALYSIS                        │
│  [Expand to read full analysis ▼]   │
└─────────────────────────────────────┘

[🔄 New Simulation] [📥 Download]
```

---

## 🎨 Color Specifications

### Status Colors
```css
/* Efficiency/Risk levels */
.excellent    { color: #22c55e; background: rgba(34, 197, 94, 0.1); }
.good         { color: #84cc16; background: rgba(132, 204, 22, 0.1); }
.fair         { color: #eab308; background: rgba(234, 179, 8, 0.1); }
.poor         { color: #f97316; background: rgba(249, 115, 22, 0.1); }
.critical     { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

/* Chart colors */
.chart-power        { color: #3b82f6; } /* Blue */
.chart-utilization  { color: #8b5cf6; } /* Purple */
.chart-pue          { color: #ec4899; } /* Pink */
.chart-carbon       { color: #64748b; } /* Gray */
.chart-cost         { color: #f59e0b; } /* Amber */
```

### Typography
```css
.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}
```

---

## 📊 Specific Chart Configurations

### 1. Power Consumption Line Chart

```javascript
{
  type: 'line',
  data: {
    labels: dates,  // Array of Date objects
    datasets: [{
      label: 'Power Consumption (kW)',
      data: power_kw,  // Array of numbers
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,  // Smooth curves
      pointRadius: 0,  // Hide points for cleaner look
      pointHoverRadius: 5
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            return `${context.parsed.y.toLocaleString()} kW`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: {
            month: 'MMM'
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => {
            return (value / 1000).toFixed(1) + ' MW';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }
}
```

### 2. PUE Efficiency with Color Zones

```javascript
{
  type: 'line',
  data: {
    labels: dates,
    datasets: [
      {
        label: 'PUE',
        data: pue_data,
        borderColor: '#ec4899',
        borderWidth: 3,
        fill: false,
        tension: 0.4
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      annotation: {
        annotations: {
          excellent: {
            type: 'box',
            yMin: 1.0,
            yMax: 1.2,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 0,
            label: {
              content: 'Excellent',
              enabled: true,
              position: 'left'
            }
          },
          good: {
            type: 'box',
            yMin: 1.2,
            yMax: 1.4,
            backgroundColor: 'rgba(132, 204, 22, 0.1)',
            borderWidth: 0,
            label: {
              content: 'Good',
              enabled: true,
              position: 'left'
            }
          },
          fair: {
            type: 'box',
            yMin: 1.4,
            yMax: 1.6,
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            borderWidth: 0,
            label: {
              content: 'Fair',
              enabled: true,
              position: 'left'
            }
          },
          poor: {
            type: 'box',
            yMin: 1.6,
            yMax: 2.0,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 0,
            label: {
              content: 'Poor',
              enabled: true,
              position: 'left'
            }
          }
        }
      }
    },
    scales: {
      y: {
        min: 1.0,
        max: 2.0,
        ticks: {
          stepSize: 0.2
        }
      }
    }
  }
}
```

### 3. Infrastructure Cost Breakdown

```javascript
{
  type: 'bar',
  data: {
    labels: ['Transmission', 'Distribution', 'Substation'],
    datasets: [{
      label: 'Infrastructure Cost',
      data: [1250000, 2800000, 1650000],
      backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899'],
      borderRadius: 8
    }]
  },
  options: {
    indexAxis: 'y',  // Horizontal bars
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return '$' + context.parsed.x.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          callback: (value) => {
            return '$' + (value / 1000000).toFixed(1) + 'M';
          }
        }
      }
    }
  }
}
```

### 4. Grid Impact Gauge

```javascript
{
  type: 'doughnut',
  data: {
    labels: ['Data Center', 'Remaining Capacity'],
    datasets: [{
      data: [2.35, 97.65],  // impact_percent, remaining
      backgroundColor: [
        getRiskColor(2.35),  // Dynamic color based on impact
        '#e5e7eb'
      ],
      borderWidth: 0
    }]
  },
  options: {
    responsive: true,
    circumference: 180,  // Semi-circle
    rotation: -90,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return context.parsed + '% of grid capacity';
          }
        }
      }
    }
  }
}

// Helper function
function getRiskColor(percent) {
  if (percent < 0.5) return '#22c55e';
  if (percent < 2.0) return '#eab308';
  if (percent < 5.0) return '#f97316';
  return '#ef4444';
}
```

### 5. Carbon Comparison Chart

```javascript
{
  type: 'bar',
  data: {
    labels: ['🚗 Cars', '🏠 Homes', '🌳 Trees'],
    datasets: [{
      label: 'Equivalencies',
      data: [8780, 11020, 66300],
      backgroundColor: ['#ef4444', '#f59e0b', '#22c55e']
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Carbon Impact Equivalencies'
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const labels = {
              '🚗 Cars': 'Equivalent passenger vehicles for a year',
              '🏠 Homes': 'Homes powered for a year',
              '🌳 Trees': 'Trees needed to offset emissions'
            };
            return labels[context[0].label];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString()
        }
      }
    }
  }
}
```

---

## 🎭 Interactive Elements

### Stat Card with Sparkline
```html
<div class="stat-card">
  <div class="stat-header">
    <span class="stat-icon">⚡</span>
    <span class="stat-label">Peak Power</span>
  </div>
  <div class="stat-value">15.3 MW</div>
  <div class="stat-sparkline">
    <canvas id="sparkline-peak"></canvas>
  </div>
  <div class="stat-footer">
    <span class="stat-change positive">+8% vs avg</span>
  </div>
</div>
```

### Risk Badge
```html
<div class="risk-badge risk-moderate">
  <span class="risk-icon">⚠️</span>
  <span class="risk-label">MODERATE</span>
  <span class="risk-tooltip">
    Grid stability risk is moderate. Infrastructure upgrades recommended.
  </span>
</div>
```

### Timeline Scrubber
```html
<div class="timeline-scrubber">
  <div class="timeline-labels">
    <span>Jan</span>
    <span>Apr</span>
    <span>Jul</span>
    <span>Oct</span>
  </div>
  <input 
    type="range" 
    min="0" 
    max="365" 
    value="0"
    class="timeline-slider"
    oninput="updateCharts(this.value)"
  />
  <div class="timeline-value">
    Day <span id="current-day">1</span> of 365
  </div>
</div>
```

### Expandable Section
```html
<div class="expandable-section">
  <button class="expand-toggle" onclick="toggleSection(this)">
    <span class="toggle-icon">▼</span>
    <span class="toggle-text">View Detailed Analysis</span>
  </button>
  <div class="expandable-content" style="display: none;">
    <!-- AI analysis text here -->
  </div>
</div>
```

---

## 🌈 Animations & Transitions

### Counter Animation (for big numbers)
```javascript
function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.innerHTML = value.toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Usage:
animateValue(document.getElementById('peak-power'), 0, 15250, 2000);
```

### Chart Entrance Animation
```javascript
const chartConfig = {
  // ... other config
  options: {
    animation: {
      onComplete: () => {
        // Fade in tooltips or labels
      },
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  }
};
```

### Pulse Effect for Critical Values
```css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.critical-value {
  animation: pulse 2s ease-in-out infinite;
}
```

---

## 🔔 User Notifications

### Alert Banners
```html
<!-- Critical impact warning -->
<div class="alert alert-critical">
  <span class="alert-icon">🚨</span>
  <div class="alert-content">
    <strong>Critical Grid Impact</strong>
    This data center would severely strain the local grid. Consider alternative locations.
  </div>
</div>

<!-- Recommendation -->
<div class="alert alert-info">
  <span class="alert-icon">💡</span>
  <div class="alert-content">
    <strong>Optimization Opportunity</strong>
    Liquid cooling could reduce your PUE by 20% and save $2.1M annually.
  </div>
</div>
```

---

## 📥 Export Options

### Report Download Button
```html
<button class="btn-export" onclick="exportReport()">
  <span class="btn-icon">📥</span>
  <span class="btn-text">Download Report</span>
  <select class="export-format" onclick="event.stopPropagation()">
    <option value="pdf">PDF</option>
    <option value="csv">CSV (Data)</option>
    <option value="png">PNG (Charts)</option>
    <option value="json">JSON (Raw)</option>
  </select>
</button>
```

---

## 🧩 Component Hierarchy

```
App
├── Header
│   ├── Title
│   ├── Location Badge
│   └── Grid Region Badge
├── Summary Cards (4)
│   ├── Peak Power Card
│   ├── Avg Power Card
│   ├── Annual Energy Card
│   └── Efficiency Card
├── Time Series Section
│   ├── Power Chart
│   └── Utilization + PUE Charts (side by side)
├── Community Impact Section
│   ├── Grid Impact Gauge
│   ├── Household Cost Card
│   ├── Stability Risk Badge
│   └── Infrastructure Cost Chart
├── Environmental Section
│   ├── Carbon Stats
│   ├── Equivalencies Display
│   └── Cumulative Emissions Chart
├── Financial Section
│   └── Cost Breakdown
├── AI Analysis Section
│   └── Expandable Text Block
└── Actions Footer
    ├── New Simulation Button
    ├── Compare Button
    └── Export Button
```

---

## 🎯 Accessibility Notes

1. **Color alone should not convey information** - use icons/text labels too
2. **All charts need alt text** - describe trend in words
3. **Keyboard navigation** - all interactive elements reachable via Tab
4. **Screen reader announcements** - ARIA labels for dynamic updates
5. **Sufficient contrast** - minimum 4.5:1 for text
6. **Responsive text sizing** - use rem units, not px

```html
<!-- Example: Accessible stat card -->
<div class="stat-card" role="region" aria-label="Peak power consumption">
  <h3 id="peak-power-label">Peak Power</h3>
  <p class="stat-value" aria-describedby="peak-power-label">
    15.3 <abbr title="megawatts">MW</abbr>
  </p>
  <div class="sparkline" 
       role="img" 
       aria-label="Sparkline showing power trend increasing from 10MW to 15.3MW over time">
  </div>
</div>
```

---

## ✅ Final Checklist

- [ ] All charts have titles and axis labels
- [ ] Large numbers are formatted with commas/units
- [ ] Color coding is consistent (green=good, red=bad)
- [ ] Mobile responsive (stack vertically)
- [ ] Loading states for async data
- [ ] Error states if API fails
- [ ] Tooltips on hover for more info
- [ ] Export functionality works
- [ ] Performance: Charts render in < 1 second
- [ ] Accessibility: Can navigate with keyboard
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

---

Happy coding! 🚀

