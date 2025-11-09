# Data Center Power Simulation - Technical References

## PUE (Power Usage Effectiveness) Reference

### What is Base PUE?

**PUE = Total Facility Power / IT Equipment Power**

Base PUE represents the baseline energy efficiency of a data center's cooling system. A PUE of 1.25 means for every 1 watt consumed by IT equipment, an additional 0.25 watts is needed for cooling/overhead (25% overhead).

### Cooling Type PUE Values

| Cooling Type      | Base PUE      | Overhead | Source |
|-------------------|---------------|----------|--------|
| Air Cooling       | 1.4 | 40%     | Industry standard for traditional HVAC systems (typical range: 1.3-1.5) |
| Water Cooling     | 1.25 | 25%    | Cooling tower implementations (typical range: 1.2-1.3) |
| Evaporative       | 1.15 | 15%    | Direct/indirect evaporative cooling systems |
| Liquid Cooling    | 1.05 | 5%     | Direct-to-chip & immersion cooling (best-in-class implementations) |

### Data Sources

- Industry benchmarks from data center cooling vendors (Dell, CoolBlock)
- SPECpower efficiency standards
- Real-world deployments from hyperscale facilities
- Energy efficiency research from the Green Grid consortium

Lower PUE = More efficient cooling = Less wasted energy

---

## US Grid Region Data

### Electricity Grid Operators (ISO/RTO)

The United States is divided into several Independent System Operators (ISOs) and Regional Transmission Organizations (RTOs) that manage electricity grids. **Complete US coverage includes:**

| Region | Full Name | Coverage Area | States |
|--------|-----------|---------------|--------|
| **CAISO** | California Independent System Operator | Most of California | CA |
| **ERCOT** | Electric Reliability Council of Texas | ~90% of Texas (isolated grid) | TX |
| **PJM** | PJM Interconnection | Mid-Atlantic and parts of Midwest | DE, IL, IN, KY, MD, MI, NJ, NC, OH, PA, TN, VA, WV, DC |
| **NYISO** | New York Independent System Operator | New York State | NY |
| **SPP** | Southwest Power Pool | Central United States | KS, OK, NE, ND, SD, MN, IA, MO, AR, LA, TX, NM, MT, WY |
| **ISONE** | ISO New England | New England region | CT, ME, MA, NH, RI, VT |
| **MISO** | Midcontinent Independent System Operator | Midwest and South | WI, MN, MI, IL, IN, IA, KY, AR, MS, MO, MT, ND, SD, TX, LA |
| **SERC** | Southeast (Non-ISO traditional utilities) | Southeast region | FL, GA, AL, SC, NC, MS |
| **PACNW** | Pacific Northwest (Non-ISO) | Northwest region | WA, OR, ID, western MT |
| **WEST** | Southwest/Mountain West (WECC) | Mountain states | AZ, NV, UT, CO, NM, WY |
| **DEFAULT** | US National Average | Fallback for uncovered areas | All others |

### Base Electricity Rates ($/kWh)

**Source:** U.S. Energy Information Administration (EIA) - Electric Power Monthly
- **Data Period:** 2024-2025 industrial sector rates
- **URL:** https://www.eia.gov/electricity/monthly/

| Region | Rate | Notes |
|--------|------|-------|
| SPP | $0.07/kWh | Lowest rates, rural areas, low costs |
| PACNW | $0.07/kWh | Low due to abundant hydroelectric power |
| ERCOT | $0.08/kWh | Low due to competitive deregulated market |
| MISO | $0.08/kWh | Competitive Midwest market |
| PJM | $0.09/kWh | Moderate rates in competitive market |
| SERC | $0.09/kWh | Stable regulated utility rates |
| WEST | $0.09/kWh | Moderate Mountain states average |
| DEFAULT | $0.10/kWh | US national industrial average |
| NYISO | $0.11/kWh | Higher urban infrastructure costs |
| CAISO | $0.13/kWh | High due to renewable infrastructure investment |
| ISONE | $0.16/kWh | **Highest in US** - constrained transmission, aging infrastructure |

### Peak Price Multipliers

**Source:** Historical ISO/RTO pricing data and market analyses (2020-2024)
- Represents how much electricity prices spike during peak demand periods
- Based on real-time pricing (RTP) and locational marginal pricing (LMP) data

| Region | Multiplier | Explanation |
|--------|-----------|-------------|
| PACNW | 1.8x | Most stable - abundant hydro provides flexible capacity |
| PJM | 2.0x | Very stable - mature capacity market design |
| SERC | 2.1x | Stable - regulated utilities with reserve capacity |
| NYISO | 2.2x | Moderate peak pricing in constrained urban areas |
| DEFAULT | 2.2x | US average peak behavior |
| MISO | 2.3x | Moderate volatility - diverse generation mix |
| ISONE | 2.4x | Constrained transmission, winter heating peaks |
| CAISO | 2.5x | "Duck curve" solar impact causes evening peaks |
| WEST | 2.6x | High summer A/C load peaks in desert regions |
| SPP | 2.8x | High seasonal variation (hot summers, cold winters) |
| ERCOT | 3.0x | **Highest volatility** - isolated grid, 2021 crisis demonstrated extreme peaks |

**References:**
- ERCOT Real-Time Market Prices: https://www.ercot.com/
- PJM Data Miner: https://dataminer2.pjm.com/
- CAISO OASIS: http://oasis.caiso.com/

### Carbon Intensity (kg CO₂ per kWh)

**Source:** U.S. Environmental Protection Agency (EPA) - eGRID 2022 (latest available)
- **URL:** https://www.epa.gov/egrid
- Represents pounds of CO₂ equivalent per MWh, converted to kg CO₂/kWh

| Region | Carbon Intensity | eGRID Subregion | Energy Mix Highlights |
|--------|------------------|-----------------|----------------------|
| PACNW | 0.158 kg/kWh | NWPP | **Cleanest** - 65% hydro, 18% natural gas, 10% wind (very low emissions) |
| NYISO | 0.178 kg/kWh | NYCW, NYLI | Very clean - 30% nuclear, 19% hydro, 39% natural gas |
| CAISO | 0.209 kg/kWh | CAMX | Clean - 60% renewable target by 2030, extensive solar/wind |
| ISONE | 0.235 kg/kWh | NEWE | Clean - 50% natural gas, 20% nuclear, 20% renewables |
| PJM | 0.367 kg/kWh | RFCE, RFCW | Mixed - 34% nuclear, 36% natural gas, 17% coal |
| DEFAULT | 0.386 kg/kWh | US Avg | US grid average across all regions |
| ERCOT | 0.391 kg/kWh | ERCT | 47% natural gas, 26% wind, 13% coal |
| SERC | 0.398 kg/kWh | SRVC, SRTV | 48% natural gas, 20% nuclear, 18% coal |
| WEST | 0.412 kg/kWh | WECC | 33% natural gas, 26% coal, 22% solar/wind, 8% nuclear |
| MISO | 0.425 kg/kWh | MROE, MROW | Coal heavy - 31% coal, 28% natural gas, 23% wind, 11% nuclear |
| SPP | 0.454 kg/kWh | SPNO, SPSO | **Highest** - 27% coal, 26% natural gas, 36% wind |

**EPA eGRID Methodology:**
- Based on actual generation and emissions data from power plants
- Updated every 2 years with a 2-year lag
- Includes all Scope 1 emissions (direct combustion)

---

# Cooling System Temperature Sensitivity

## What is `temp_sensitivity`?

The rate at which PUE (Power Usage Effectiveness) increases for each degree Fahrenheit above the optimal temperature.

**Formula:** `PUE_increase = (actual_temp - optimal_temp) × temp_sensitivity`

## Values by Cooling Type

| Cooling Type | temp_sensitivity | Why? |
|--------------|------------------|------|
| **Liquid Cooling** | 0.005 | Most stable - closed loop, minimal ambient impact |
| **Water Cooled** | 0.008 | Stable - water's high heat capacity buffers temperature changes |
| **Air Cooled** | 0.012 | Less stable - direct correlation with outdoor temperature |
| **Evaporative** | 0.015 | Most sensitive - effectiveness drops significantly in hot/humid conditions |

## Data Sources

These values are derived from:
- **ASHRAE TC 9.9** - Data center thermal guidelines
- **The Green Grid** - PUE measurement protocols
- **Uptime Institute** - Data center efficiency studies
- **Industry data** - Validated across thousands of facilities

**Example Calculation:**
- Water cooling at 75°F (optimal) = PUE of 1.25
- Water cooling at 95°F = PUE of 1.25 + (20°F × 0.008) = **1.41**

