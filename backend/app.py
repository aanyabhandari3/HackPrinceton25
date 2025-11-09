from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS, cross_origin
import os
import json
import time
import sys
from dotenv import load_dotenv
import anthropic
import requests
import numpy as np
from datetime import datetime
from services.simulate import (
    run_full_simulation,
    create_climate_data_from_api,
    create_datacenter_specs_from_config,
    create_grid_info_from_location,
    GridImpactCalculator
)

load_dotenv('config.env')

app = Flask(__name__)
CORS(app)

# API Keys
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
MAPBOX_TOKEN = os.getenv('MAPBOX_TOKEN')
CENSUS_API_KEY = os.getenv('CENSUS_API_KEY')
EIA_API_KEY = os.getenv('EIA_API_KEY')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')

if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY not found in environment variables")

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# Data center specifications mapping
DATA_CENTER_TIERS = {
    'small': {
        'name': 'Small Edge Data Center',
        'power_mw': 1,  # Megawatts
        'servers': 100,
        'square_feet': 5000,
        'water_gallons_per_day': 25000,
        'employees': 10,
        'cooling_type': 'air_cooled',        # For CoolingEfficiencyModel
        'server_type': 'enterprise',         # For ServerPowerModel
        'datacenter_type': 'enterprise'      # For WorkloadSimulator
    },
    'medium': {
        'name': 'Medium Enterprise Data Center',
        'power_mw': 10,
        'servers': 1000,
        'square_feet': 50000,
        'water_gallons_per_day': 300000,
        'employees': 50,
        'cooling_type': 'air_cooled',
        'server_type': 'enterprise',
        'datacenter_type': 'enterprise'
    },
    'large': {
        'name': 'Large Hyperscale Data Center',
        'power_mw': 50,
        'servers': 10000,
        'square_feet': 250000,
        'water_gallons_per_day': 1500000,
        'employees': 200,
        'cooling_type': 'water_cooled',      # Larger facilities often use water cooling
        'server_type': 'enterprise',
        'datacenter_type': 'cloud_compute'   # Hyperscale typically runs cloud services
    },
    'mega': {
        'name': 'Mega Hyperscale Data Center',
        'power_mw': 150,
        'servers': 50000,
        'square_feet': 750000,
        'water_gallons_per_day': 5000000,
        'employees': 500,
        'cooling_type': 'liquid_cooling',    # Most efficient for massive scale
        'server_type': 'nvidia_h100',        # Mega centers often have AI/GPU compute
        'datacenter_type': 'ai_training'     # High utilization AI training workload
    }
}

# New 
def map_state_to_grid_region(state_fips: str) -> str:
   
    
    # Comprehensive mapping of all 50 states + DC to grid regions
    state_to_grid = {
        # CAISO - California Independent System Operator
        '06': 'CAISO',  # California
        
        # ERCOT - Texas (isolated grid)
        '48': 'ERCOT',  # Texas
        
        # PJM - Mid-Atlantic and parts of Midwest
        '10': 'PJM',    # Delaware
        '11': 'PJM',    # District of Columbia
        '17': 'PJM',    # Illinois (northern/eastern parts)
        '18': 'PJM',    # Indiana (parts)
        '21': 'PJM',    # Kentucky (eastern)
        '24': 'PJM',    # Maryland
        '26': 'PJM',    # Michigan (parts)
        '34': 'PJM',    # New Jersey
        '37': 'PJM',    # North Carolina (northern)
        '39': 'PJM',    # Ohio
        '42': 'PJM',    # Pennsylvania
        '47': 'PJM',    # Tennessee (eastern)
        '51': 'PJM',    # Virginia
        '54': 'PJM',    # West Virginia
        
        # NYISO - New York
        '36': 'NYISO',  # New York
        
        # SPP - Southwest Power Pool (Central/Plains states)
        '20': 'SPP',    # Kansas
        '31': 'SPP',    # Nebraska
        '38': 'SPP',    # North Dakota
        '40': 'SPP',    # Oklahoma
        '46': 'SPP',    # South Dakota
        '29': 'SPP',    # Missouri (western)
        '19': 'SPP',    # Iowa (parts)
        '27': 'SPP',    # Minnesota (parts)
        '05': 'SPP',    # Arkansas (western)
        '22': 'SPP',    # Louisiana (parts)
        '28': 'SPP',    # Mississippi (parts)
        
        # ISONE - ISO New England
        '09': 'ISONE',  # Connecticut
        '23': 'ISONE',  # Maine
        '25': 'ISONE',  # Massachusetts
        '33': 'ISONE',  # New Hampshire
        '44': 'ISONE',  # Rhode Island
        '50': 'ISONE',  # Vermont
        
        # MISO - Midcontinent Independent System Operator
        '55': 'MISO',   # Wisconsin
        '27': 'MISO',   # Minnesota (override SPP for primary coverage)
        '19': 'MISO',   # Iowa (override SPP for primary coverage)
        '17': 'MISO',   # Illinois (parts not in PJM)
        '18': 'MISO',   # Indiana (parts not in PJM)
        '26': 'MISO',   # Michigan (parts not in PJM)
        '29': 'MISO',   # Missouri (eastern)
        '05': 'MISO',   # Arkansas (eastern)
        '22': 'MISO',   # Louisiana (parts)
        
        # SERC - Southeast (non-ISO regulated utilities)
        '12': 'SERC',   # Florida
        '13': 'SERC',   # Georgia
        '01': 'SERC',   # Alabama
        '45': 'SERC',   # South Carolina
        '37': 'SERC',   # North Carolina (southern - override PJM)
        '28': 'SERC',   # Mississippi (eastern - override)
        '47': 'SERC',   # Tennessee (western - override)
        
        # PACNW - Pacific Northwest
        '53': 'PACNW',  # Washington
        '41': 'PACNW',  # Oregon
        '16': 'PACNW',  # Idaho
        '30': 'PACNW',  # Montana (western)
        
        # WEST - Southwest/Mountain West (WECC non-CAISO)
        '04': 'WEST',   # Arizona
        '32': 'WEST',   # Nevada
        '49': 'WEST',   # Utah
        '08': 'WEST',   # Colorado
        '35': 'WEST',   # New Mexico
        '56': 'WEST',   # Wyoming
        '30': 'WEST',   # Montana (eastern - override)
        
        # Alaska and Hawaii - Use DEFAULT (isolated grids)
        '02': 'DEFAULT', # Alaska
        '15': 'DEFAULT', # Hawaii
    }
    
    # Return mapped region or DEFAULT if not found
    region = state_to_grid.get(state_fips, 'DEFAULT')
    
    # Log the mapping for debugging
    print(f"Mapped state FIPS '{state_fips}' to grid region '{region}'")
    
    return region

# New
def get_state_name_from_fips(state_fips: str) -> str:
    """
    Helper function to convert FIPS code to state name for debugging.
    Optional - useful for logging.
    """
    fips_to_state = {
        '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas',
        '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware',
        '11': 'District of Columbia', '12': 'Florida', '13': 'Georgia', '15': 'Hawaii',
        '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa',
        '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine',
        '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
        '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska',
        '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
        '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
        '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island',
        '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas',
        '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
        '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming'
    }
    return fips_to_state.get(state_fips, 'Unknown')

def get_population_data(lat, lon):
    """Fetch population and median income from Census API given coordinates."""
    try:
        print("✅ Running get_population_data from:", __file__, file=sys.stderr)

        # Step 1: Get state/county FIPS from coordinates
        geo_url = "https://geocoding.geo.census.gov/geocoder/geographies/coordinates"
        geo_params = {
            "x": lon,
            "y": lat,
            "benchmark": "Public_AR_Current",
            "vintage": "Current_Current",
            "format": "json"
        }
        geo_resp = requests.get(geo_url, params=geo_params)
        geo_json = geo_resp.json() if geo_resp.status_code == 200 else {}

        counties = geo_json.get("result", {}).get("geographies", {}).get("Counties", [])
        if not counties:
            return {"location_name": "Unknown", "population": 0, "median_income": 0,
                    "state_fips": "", "county_fips": ""}

        county = counties[0]
        state_fips = county.get("STATE", "")
        county_fips = county.get("COUNTY", "")

        # Step 2: Get population data from Census API
        pop_url = "https://api.census.gov/data/2021/acs/acs5"
        pop_params = {
            "get": "NAME,B01003_001E,B19013_001E",
            "for": f"county:{county_fips}",
            "in": f"state:{state_fips}",
            "key": CENSUS_API_KEY
        }
        pop_resp = requests.get(pop_url, params=pop_params)
        print("DEBUG: Census URL =", pop_resp.url, file=sys.stderr)
        print("DEBUG: Status =", pop_resp.status_code, file=sys.stderr)

        if pop_resp.status_code != 200:
            print("DEBUG: Bad Census response:", pop_resp.text[:200], file=sys.stderr)
            return {
                "location_name": "Unknown",
                "population": 0,
                "median_income": 0,
                "state_fips": state_fips,
                "county_fips": county_fips
            }

        try:
            pop_data = pop_resp.json()
        except Exception as e:
            print("DEBUG: JSON decode error:", e, file=sys.stderr)
            print("DEBUG: Response text:", pop_resp.text[:200], file=sys.stderr)
            return {
                "location_name": "Unknown",
                "population": 0,
                "median_income": 0,
                "state_fips": state_fips,
                "county_fips": county_fips
            }

        if isinstance(pop_data, list) and len(pop_data) >= 2:
            row = pop_data[1]
            population = int(row[1]) if row[1].isdigit() else 0
            try:
                median_income = int(row[2])
            except:
                median_income = 0
            return {
                "location_name": row[0],
                "population": population,
                "median_income": median_income,
                "state_fips": state_fips,
                "county_fips": county_fips
            }

        return {
            "location_name": "Unknown",
            "population": 0,
            "median_income": 0,
            "state_fips": state_fips,
            "county_fips": county_fips
        }

    except Exception as e:
        print("DEBUG: Exception in get_population_data:", e, file=sys.stderr)
        return {
            "location_name": "Unknown",
            "population": 0,
            "median_income": 0
        }


def get_energy_data(state_code):
    """Get energy cost data from EIA API"""
    try:
        # Get state electricity prices
        response = requests.get(
            f'https://api.eia.gov/v2/electricity/retail-sales/data/',
            params={
                'api_key': EIA_API_KEY,
                'frequency': 'annual',
                'data[0]': 'price',
                'facets[stateid][]': state_code,
                'facets[sectorid][]': 'IND',  # Industrial sector
                'sort[0][column]': 'period',
                'sort[0][direction]': 'desc',
                'length': 1
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'response' in data and 'data' in data['response'] and len(data['response']['data']) > 0:
                price_cents_kwh = float(data['response']['data'][0]['price'])
                return {
                    'price_per_kwh': price_cents_kwh / 100,  # Convert to dollars
                    'state': state_code
                }
        
        # Default to national average if API fails
        return {
            'price_per_kwh': 0.11,  # National average
            'state': state_code
        }
    except Exception as e:
        print(f"Error fetching energy data: {e}")
        return {
            'price_per_kwh': 0.11,
            'state': state_code
        }

def get_climate_data(lat, lon):
    """Get climate data from OpenWeatherMap"""
    try:
        response = requests.get(
            'https://api.openweathermap.org/data/2.5/weather',
            params={
                'lat': lat,
                'lon': lon,
                'appid': OPENWEATHER_API_KEY,
                'units': 'imperial'
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            return {
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'description': data['weather'][0]['description']
            }
        
        return {
            'temperature': 70,
            'humidity': 50,
            'description': 'Unknown'
        }
    except Exception as e:
        print(f"Error fetching climate data: {e}")
        return {
            'temperature': 70,
            'humidity': 50,
            'description': 'Unknown'
        }

def calculate_impact(datacenter_config, location_data, energy_data, climate_data):
    """Calculate the environmental and economic impact"""
    
    dc = datacenter_config
    power_mw = dc['power_mw']
    water_gpd = dc['water_gallons_per_day']
    
    # Energy calculations
    annual_kwh = power_mw * 1000 * 24 * 365  # Convert MW to kWh annually
    annual_energy_cost = annual_kwh * energy_data['price_per_kwh']
    
    # Carbon emissions (US average: 0.92 lbs CO2 per kWh)
    annual_co2_tons = (annual_kwh * 0.92) / 2000  # Convert lbs to tons
    
    # Population impact
    population = location_data.get('population', 100000)
    households = population / 2.5  # Average household size
    avg_household_kwh = 10000  # Annual average
    regional_energy_consumption = households * avg_household_kwh
    percent_increase_energy = (annual_kwh / regional_energy_consumption) * 100 if regional_energy_consumption > 0 else 0
    
    # Water impact
    # Average per capita water use: 82 gallons/day
    regional_water_usage = population * 82
    percent_increase_water = (water_gpd / regional_water_usage) * 100 if regional_water_usage > 0 else 0
    
    # Cost impact per household
    cost_per_household = annual_energy_cost / households if households > 0 else 0
    
    # Cooling efficiency impact (higher temps = more cooling needed)
    temp = climate_data.get('temperature', 70)
    cooling_factor = 1 + ((temp - 70) / 100)  # 1% increase per degree above 70°F
    adjusted_power_usage = annual_kwh * cooling_factor
    
    return {
        'energy': {
            'annual_mwh': power_mw * 24 * 365,
            'annual_kwh': annual_kwh,
            'annual_cost': annual_energy_cost,
            'percent_increase': percent_increase_energy,
            'cost_per_household_annually': cost_per_household
        },
        'carbon': {
            'annual_tons_co2': annual_co2_tons,
            'equivalent_cars': annual_co2_tons / 4.6,  # Average car emits 4.6 tons/year
            'equivalent_homes': annual_kwh / 10000  # Average home uses 10,000 kWh/year
        },
        'water': {
            'daily_gallons': water_gpd,
            'annual_gallons': water_gpd * 365,
            'percent_increase': percent_increase_water,
            'olympic_pools_per_year': (water_gpd * 365) / 660000  # Olympic pool = 660,000 gallons
        },
        'economic': {
            'jobs_created': dc['employees'],
            'estimated_construction_cost': dc['square_feet'] * 1000,  # $1000 per sq ft estimate
            'annual_operating_cost': annual_energy_cost * 1.5  # Energy is ~66% of operating costs
        }
    }

def get_street_address(lat, lon):
    """Get street address from lat, lon"""
    try:
        gmaps = googlemaps.Client(key=os.getenv('MAPS_API_KEY'))
        reverse_geocode_result = gmaps.reverse_geocode((lat, lon))
        
        if not reverse_geocode_result:
            return "Address not found"
        
        # Try to find the most specific address
        # Priority: street_address > route > formatted_address of first result
        for result in reverse_geocode_result:
            if 'street_address' in result.get('types', []):
                return result.get('formatted_address', 'Address not found')
        
        # Fallback to route (street name)
        for result in reverse_geocode_result:
            if 'route' in result.get('types', []):
                return result.get('formatted_address', 'Address not found')
        
        # Last fallback: use first result's formatted address
        return reverse_geocode_result[0].get('formatted_address', 'Address not found')
    
    except Exception as e:
        print(f"Error getting street address: {e}")
        return "Address not found"

def generate_llm_analysis(datacenter_config, location_data, energy_data, climate_data, impact_data, lat, lon):
    """Use Claude to generate comprehensive analysis"""
    
    prompt = f"""You are an environmental impact analyst for data centers. Analyze the following data center proposal:

DATA CENTER SPECIFICATIONS:
- Type: {datacenter_config['name']}
- Power Consumption: {datacenter_config['power_mw']} MW
- Number of Servers: {datacenter_config['servers']}
- Size: {datacenter_config['square_feet']:,} square feet
- Daily Water Usage: {datacenter_config['water_gallons_per_day']:,} gallons
- Employees: {datacenter_config['employees']}

LOCATION DATA:
- Coordinates: {lat}, {lon}
- Location: {location_data.get('location_name', 'Unknown')}
- Population: {location_data.get('population', 0):,}
- Median Income: ${location_data.get('median_income', 0):,}

ENERGY DATA:
- Local Electricity Rate: ${energy_data['price_per_kwh']:.3f} per kWh
- State: {energy_data.get('state', 'Unknown')}

CLIMATE DATA:
- Temperature: {climate_data['temperature']}°F
- Humidity: {climate_data['humidity']}%
- Conditions: {climate_data['description']}

CALCULATED IMPACTS:
Energy Impact:
- Annual Energy Use: {impact_data['energy']['annual_mwh']:,.0f} MWh
- Annual Energy Cost: ${impact_data['energy']['annual_cost']:,.0f}
- Increase in Regional Energy Demand: {impact_data['energy']['percent_increase']:.2f}%
- Additional Cost Per Household: ${impact_data['energy']['cost_per_household_annually']:.2f}/year

Carbon Impact:
- Annual CO2 Emissions: {impact_data['carbon']['annual_tons_co2']:,.0f} tons
- Equivalent to {impact_data['carbon']['equivalent_cars']:,.0f} cars
- Equivalent to power for {impact_data['carbon']['equivalent_homes']:,.0f} homes

Water Impact:
- Daily Water Usage: {impact_data['water']['daily_gallons']:,} gallons
- Annual Water Usage: {impact_data['water']['annual_gallons']:,} gallons
- Increase in Regional Water Demand: {impact_data['water']['percent_increase']:.2f}%
- Equivalent to {impact_data['water']['olympic_pools_per_year']:.1f} Olympic pools per year

Economic Impact:
- Jobs Created: {impact_data['economic']['jobs_created']}
- Estimated Construction Cost: ${impact_data['economic']['estimated_construction_cost']:,.0f}
- Annual Operating Cost: ${impact_data['economic']['annual_operating_cost']:,.0f}

Please provide a comprehensive analysis covering:
1. **Overall Environmental Impact** - Summary of environmental concerns
2. **Energy Infrastructure** - Can the local grid handle this? Any concerns?
3. **Water Resources** - Impact on local water supply, thermal pollution concerns
4. **Community Impact** - Effects on residents (bills, health, quality of life)
5. **Climate Considerations** - How local climate affects efficiency and cooling needs
6. **Recommendations** - Mitigation strategies and whether this location is suitable
7. **Regulatory Considerations** - Potential legal/permitting challenges

Be specific, data-driven, and balanced (mention both concerns and benefits)."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=8192,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        return message.content[0].text
    except Exception as e:
        print(f"Error generating LLM analysis: {e}")
        return "Error generating analysis. Please check API configuration."


# New
def generate_llm_analysis_simulation(datacenter_config, location_data, climate_data, sim_result, grid_config, annual_cost, annual_co2_tons, state_name, region_code, lat, lon):
    """Use Claude to generate comprehensive analysis for simulation results"""
    
    prompt = f"""You are an environmental impact analyst for data centers. Analyze the following data center simulation results:

DATA CENTER SPECIFICATIONS:
- Type: {datacenter_config['name']}
- Power Capacity: {datacenter_config['power_mw']} MW
- Number of Servers: {datacenter_config['servers']:,}
- Size: {datacenter_config['square_feet']:,} square feet
- Cooling Type: {datacenter_config.get('cooling_type', 'air_cooled').replace('_', ' ').title()}
- Server Type: {datacenter_config.get('server_type', 'enterprise').replace('_', ' ').title()}
- Data Center Type: {datacenter_config.get('datacenter_type', 'enterprise').replace('_', ' ').title()}
- Employees: {datacenter_config['employees']}

LOCATION DATA:
- Coordinates: {lat}, {lon}
- Location: {location_data.get('location_name', 'Unknown')}, {state_name}
- Grid Region: {region_code}
- Population: {location_data.get('population', 0):,}
- Median Income: ${location_data.get('median_income', 0):,}

CLIMATE DATA:
- Temperature: {climate_data['temperature']}°F
- Humidity: {climate_data['humidity']}%
- Conditions: {climate_data['description']}

SIMULATION RESULTS (8760-hour annual simulation):
Energy Performance:
- Peak Power: {sim_result.peak_power_kw:,.0f} kW
- Average Power: {sim_result.average_power_kw:,.0f} kW
- Annual Consumption: {sim_result.annual_consumption_mwh:,.0f} MWh
- Annual Energy Cost: ${annual_cost:,.0f}
- Average PUE: {np.mean(sim_result.hourly_pue):.2f}
- Best PUE: {min(sim_result.hourly_pue):.2f}
- Worst PUE: {max(sim_result.hourly_pue):.2f}

Workload Characteristics:
- Average Utilization: {np.mean(sim_result.hourly_utilization):.1f}%
- Peak Utilization: {max(sim_result.hourly_utilization):.1f}%
- Minimum Utilization: {min(sim_result.hourly_utilization):.1f}%

Carbon Impact:
- Annual CO2 Emissions: {annual_co2_tons:,.0f} tons
- Grid Carbon Intensity: {grid_config['carbon_intensity']:.3f} kg CO₂/kWh
- Equivalent to {annual_co2_tons / 4.6:,.0f} cars
- Equivalent to power for {(sim_result.annual_consumption_mwh * 1000) / 10000:,.0f} homes

Community & Grid Impact:
- Peak Impact on Grid: {sim_result.community_impact['peak_impact_percent']:.2f}%
- Average Impact on Grid: {sim_result.community_impact['average_impact_percent']:.2f}%
- Grid Stability Risk: {sim_result.community_impact['stability_risk'].upper()}
- Grid Impact Classification: {sim_result.community_impact['grid_classification'].upper()}
- Monthly Cost Per Household: ${sim_result.community_impact['household_impact']['monthly_cost_per_household']:.2f}
- Household Bill Increase: {sim_result.community_impact['household_impact']['percentage_increase']:.2f}%
- Infrastructure Cost: ${sim_result.community_impact['infrastructure_cost']['total']:,.0f}
- Infrastructure Required: {sim_result.community_impact['infrastructure_cost']['required']}

Please provide a comprehensive analysis covering:
1. **Overall Performance Assessment** - How well does this data center perform based on the simulation?
2. **Energy Efficiency Analysis** - Assess PUE trends, cooling efficiency, and optimization opportunities
3. **Grid & Community Impact** - Detailed analysis of impact on local grid and households
4. **Workload Pattern Analysis** - What do the utilization patterns tell us about this facility?
5. **Environmental Concerns** - Carbon footprint and environmental sustainability analysis
6. **Infrastructure Requirements** - What grid infrastructure upgrades are needed?
7. **Cost-Benefit Analysis** - Economic impacts (jobs, costs to community, energy costs)
8. **Risk Assessment** - Grid stability risks, power supply concerns, regulatory challenges
9. **Recommendations** - Specific mitigation strategies, optimization opportunities, and site suitability

Be specific, data-driven, and balanced. Use the actual simulation data to support your analysis. Consider both technical performance and community impact."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=8192,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        return message.content[0].text
    except Exception as e:
        return f"Error generating LLM analysis for simulation: {e}"


def calculate_impact_with_simulation(datacenter_config, location_data, energy_data, climate_data):
    """Calculate impact using the sophisticated simulation models"""
    
    # Determine grid region based on location
    state_fips = location_data.get('state_fips', '')
    region_code = map_state_to_grid_region(state_fips)  # You'll need to create this
    
    # Convert API data to simulation inputs
    dc_specs = create_datacenter_specs_from_config(datacenter_config)
    climate = create_climate_data_from_api(climate_data)
    grid_info = create_grid_info_from_location(location_data, region_code)
    
    # Run simulation
    sim_result = run_full_simulation(dc_specs, climate, grid_info)
    
    # Convert simulation results to the format expected by frontend
    annual_kwh = sim_result.annual_consumption_mwh * 1000
    annual_cost = annual_kwh * energy_data['price_per_kwh']
    
    # Calculate carbon using grid-specific carbon intensity
    grid_calculator = GridImpactCalculator()
    grid_config = grid_calculator.grid_regions.get(region_code, grid_calculator.grid_regions['DEFAULT'])
    annual_co2_kg = annual_kwh * grid_config['carbon_intensity']
    annual_co2_tons = annual_co2_kg / 907.185  # kg to US tons
    
    return {
        'energy': {
            'annual_mwh': sim_result.annual_consumption_mwh,
            'annual_kwh': annual_kwh,
            'annual_cost': annual_cost,
            'peak_power_kw': sim_result.peak_power_kw,
            'average_power_kw': sim_result.average_power_kw,
            'average_pue': np.mean(sim_result.hourly_pue),
            'percent_increase': sim_result.community_impact['average_impact_percent']
        },
        'carbon': {
            'annual_tons_co2': annual_co2_tons,
            'carbon_intensity': grid_config['carbon_intensity'],
            'equivalent_cars': annual_co2_tons / 4.6,
            'equivalent_homes': annual_kwh / 10000
        },
        'grid_impact': sim_result.community_impact,
        'simulation': {
            'hourly_data_available': True,
            'hours_simulated': len(sim_result.hourly_power_kw)
        }
    }


@app.route('/api/analyze', methods=['POST'])
def analyze_datacenter():
    """Main endpoint to analyze data center impact"""
    try:
        data = request.json
        
        # Extract parameters
        lat = data['latitude']
        lon = data['longitude']
        dc_size = data.get('size', 'medium')
        
        # Custom configuration if provided
        if 'custom' in data and data['custom']:
            datacenter_config = {
                'name': data.get('name', 'Custom Data Center'),
                'power_mw': data.get('power_mw', 10),
                'servers': data.get('servers', 1000),
                'square_feet': data.get('square_feet', 50000),
                'water_gallons_per_day': data.get('water_gallons_per_day', 300000),
                'employees': data.get('employees', 50)
            }
        else:
            datacenter_config = DATA_CENTER_TIERS.get(dc_size, DATA_CENTER_TIERS['medium'])
        
        # Gather data from various APIs
        print(f"Fetching data for location: {lat}, {lon}")
        location_data = get_population_data(lat, lon)
        
        # Get state code for energy data
        state_code = location_data.get('state_fips', 'US')
        energy_data = get_energy_data(state_code)
        
        climate_data = get_climate_data(lat, lon)
        
        street_address = get_street_address(lat, lon)
        
        # Calculate impacts
        impact_data = calculate_impact(datacenter_config, location_data, energy_data, climate_data)
        
        # Generate LLM analysis
        llm_analysis = generate_llm_analysis(
            datacenter_config, 
            location_data, 
            energy_data, 
            climate_data, 
            impact_data,
            lat,
            lon
        )
        
        # Compile full report
        report = {
            'timestamp': datetime.utcnow().isoformat(),
            'location': {
                'latitude': lat,
                'longitude': lon,
                'address': street_address,
                'name': location_data.get('location_name', 'Unknown'),
                'population': location_data.get('population', 0),
                'median_income': location_data.get('median_income', 0)
            },
            'datacenter': datacenter_config,
            'climate': climate_data,
            'energy_pricing': energy_data,
            'impact': impact_data,
            'analysis': llm_analysis,
            'street_address': street_address
        }

        with open('latest_report.json', 'w') as f:
            import json
            json.dump(report, f, indent=2)
        
        return jsonify(report)
        
    except Exception as e:
        print(f"Error in analyze endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze/stream', methods=['POST'])
def stream_analyze_datacenter():
    """Analyze with real-time streaming updates"""
    
    # Extract ALL request data BEFORE generator
    data = request.json
    lat = data['latitude']
    lon = data['longitude']
    dc_size = data.get('size', 'medium')
    
    # Custom configuration if provided
    if 'custom' in data and data['custom']:
        datacenter_config = {
            'name': data.get('name', 'Custom Data Center'),
            'power_mw': data.get('power_mw', 10),
            'servers': data.get('servers', 1000),
            'square_feet': data.get('square_feet', 50000),
            'water_gallons_per_day': data.get('water_gallons_per_day', 300000),
            'employees': data.get('employees', 50)
        }
    else:
        datacenter_config = DATA_CENTER_TIERS.get(dc_size, DATA_CENTER_TIERS['medium'])
    
    def generate():
        try:
            # Step 1: Initial status
            yield f"data: {json.dumps({'status': 'started', 'step': 'initializing'})}\n\n"
            
            # Step 2: Gather location data
            yield f"data: {json.dumps({'status': 'progress', 'step': 'fetching_location_data'})}\n\n"
            location_data = get_population_data(lat, lon)
            yield f"data: {json.dumps({'status': 'progress', 'step': 'location_data_complete', 'data': location_data})}\n\n"
            
            # Step 3: Get energy data
            yield f"data: {json.dumps({'status': 'progress', 'step': 'fetching_energy_data'})}\n\n"
            state_code = location_data.get('state_fips', 'US')
            energy_data = get_energy_data(state_code)
            yield f"data: {json.dumps({'status': 'progress', 'step': 'energy_data_complete', 'data': energy_data})}\n\n"
            
            # Step 4: Get climate data
            yield f"data: {json.dumps({'status': 'progress', 'step': 'fetching_climate_data'})}\n\n"
            climate_data = get_climate_data(lat, lon)
            yield f"data: {json.dumps({'status': 'progress', 'step': 'climate_data_complete', 'data': climate_data})}\n\n"
            
            # Step 5: Calculate impacts
            yield f"data: {json.dumps({'status': 'progress', 'step': 'calculating_impacts'})}\n\n"
            impact_data = calculate_impact(datacenter_config, location_data, energy_data, climate_data)
            yield f"data: {json.dumps({'status': 'progress', 'step': 'impacts_complete', 'data': impact_data})}\n\n"
            
            # Step 6: Generate LLM analysis with streaming
            yield f"data: {json.dumps({'status': 'progress', 'step': 'generating_analysis'})}\n\n"
            
            # Build prompt
            prompt = f"""You are an environmental impact analyst for data centers. Analyze the following data center proposal:

DATA CENTER SPECIFICATIONS:
- Type: {datacenter_config['name']}
- Power Consumption: {datacenter_config['power_mw']} MW
- Number of Servers: {datacenter_config['servers']}
- Size: {datacenter_config['square_feet']:,} square feet
- Daily Water Usage: {datacenter_config['water_gallons_per_day']:,} gallons
- Employees: {datacenter_config['employees']}

LOCATION DATA:
- Coordinates: {lat}, {lon}
- Location: {location_data.get('location_name', 'Unknown')}
- Population: {location_data.get('population', 0):,}
- Median Income: ${location_data.get('median_income', 0):,}

ENERGY DATA:
- Local Electricity Rate: ${energy_data['price_per_kwh']:.3f} per kWh
- State: {energy_data.get('state', 'Unknown')}

CLIMATE DATA:
- Temperature: {climate_data['temperature']}°F
- Humidity: {climate_data['humidity']}%
- Conditions: {climate_data['description']}

CALCULATED IMPACTS:
Energy Impact:
- Annual Energy Use: {impact_data['energy']['annual_mwh']:,.0f} MWh
- Annual Energy Cost: ${impact_data['energy']['annual_cost']:,.0f}
- Increase in Regional Energy Demand: {impact_data['energy']['percent_increase']:.2f}%
- Additional Cost Per Household: ${impact_data['energy']['cost_per_household_annually']:.2f}/year

Carbon Impact:
- Annual CO2 Emissions: {impact_data['carbon']['annual_tons_co2']:,.0f} tons
- Equivalent to {impact_data['carbon']['equivalent_cars']:,.0f} cars
- Equivalent to power for {impact_data['carbon']['equivalent_homes']:,.0f} homes

Water Impact:
- Daily Water Usage: {impact_data['water']['daily_gallons']:,} gallons
- Annual Water Usage: {impact_data['water']['annual_gallons']:,} gallons
- Increase in Regional Water Demand: {impact_data['water']['percent_increase']:.2f}%
- Equivalent to {impact_data['water']['olympic_pools_per_year']:.1f} Olympic pools per year

Economic Impact:
- Jobs Created: {impact_data['economic']['jobs_created']}
- Estimated Construction Cost: ${impact_data['economic']['estimated_construction_cost']:,.0f}
- Annual Operating Cost: ${impact_data['economic']['annual_operating_cost']:,.0f}

Please provide a comprehensive analysis covering:
1. **Overall Environmental Impact** - Summary of environmental concerns
2. **Energy Infrastructure** - Can the local grid handle this? Any concerns?
3. **Water Resources** - Impact on local water supply, thermal pollution concerns
4. **Community Impact** - Effects on residents (bills, health, quality of life)
5. **Climate Considerations** - How local climate affects efficiency and cooling needs
6. **Recommendations** - Mitigation strategies and whether this location is suitable
7. **Regulatory Considerations** - Potential legal/permitting challenges

Be specific, data-driven, and balanced (mention both concerns and benefits)."""

            # Stream the LLM response
            llm_analysis_chunks = []
            try:
                with client.messages.stream(
                    model="claude-sonnet-4-5-20250929",
                    max_tokens=8192,
                    messages=[{"role": "user", "content": prompt}]
                ) as stream:
                    for text in stream.text_stream:
                        llm_analysis_chunks.append(text)
                        # Send each chunk as it arrives
                        yield f"data: {json.dumps({'status': 'analysis_chunk', 'text': text})}\n\n"
                
                # Combine all chunks for final report
                llm_analysis = ''.join(llm_analysis_chunks)
                
            except Exception as e:
                llm_analysis = f"Error generating LLM analysis: {e}"
                yield f"data: {json.dumps({'status': 'analysis_error', 'message': str(e)})}\n\n"
            
            # Step 7: Compile final report
            report = {
                'timestamp': datetime.utcnow().isoformat(),
                'location': {
                    'latitude': lat,
                    'longitude': lon,
                    'name': location_data.get('location_name', 'Unknown'),
                    'population': location_data.get('population', 0),
                    'median_income': location_data.get('median_income', 0)
                },
                'datacenter': datacenter_config,
                'climate': climate_data,
                'energy_pricing': energy_data,
                'impact': impact_data,
                'analysis': llm_analysis
            }
            
            # Step 8: Send final complete report
            yield f"data: {json.dumps({'status': 'complete', 'report': report})}\n\n"
            
        except Exception as e:
            import traceback
            error_detail = traceback.format_exc()
            print(f"Stream error: {error_detail}")
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"
    
    # Return streaming response
    response = Response(stream_with_context(generate()), mimetype='text/event-stream')
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['X-Accel-Buffering'] = 'no'
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/api/forecast', methods=['POST'])
def forecast_datacenter():
    """Forecast a data center with detailed simulation"""
    try:
        data = request.json
        
        # Extract parameters
        lat = data['latitude']
        lon = data['longitude']
        dc_size = data.get('size', 'medium')
        simulation_hours = data.get('simulation_hours', 8760)  # Default: 1 year
        
        # Custom configuration if provided
        if 'custom' in data and data['custom']:
            datacenter_config = {
                'name': data.get('name', 'Custom Data Center'),
                'power_mw': data.get('power_mw', 10),
                'servers': data.get('servers', 1000),
                'square_feet': data.get('square_feet', 50000),
                'water_gallons_per_day': data.get('water_gallons_per_day', 300000),
                'employees': data.get('employees', 50),
                'cooling_type': data.get('cooling_type', 'air_cooled'),
                'server_type': data.get('server_type', 'enterprise'),
                'datacenter_type': data.get('datacenter_type', 'enterprise')
            }
        else:
            datacenter_config = DATA_CENTER_TIERS.get(dc_size, DATA_CENTER_TIERS['medium'])
        
        # Gather data from various APIs
        print(f"Forecasting data center for location: {lat}, {lon}")
        location_data = get_population_data(lat, lon)
        
        # Get state code and map to grid region
        state_fips = location_data.get('state_fips', '')
        state_name = get_state_name_from_fips(state_fips)
        region_code = map_state_to_grid_region(state_fips)
        
        energy_data = get_energy_data(state_fips)
        climate_data = get_climate_data(lat, lon)
        
        # Convert API data to simulation inputs
        dc_specs = create_datacenter_specs_from_config(datacenter_config)
        climate = create_climate_data_from_api(climate_data)
        grid_info = create_grid_info_from_location(location_data, region_code)
        
        # Run full simulation
        print(f"Running simulation for {simulation_hours} hours...")
        sim_result = run_full_simulation(dc_specs, climate, grid_info, simulation_hours)
        
        # Calculate costs using grid-specific data
        grid_calculator = GridImpactCalculator()
        grid_config = grid_calculator.grid_regions.get(region_code, grid_calculator.grid_regions['DEFAULT'])
        
        annual_kwh = sim_result.annual_consumption_mwh * 1000
        annual_cost = annual_kwh * grid_config['base_rate']
        
        # Calculate carbon using grid-specific carbon intensity
        annual_co2_kg = annual_kwh * grid_config['carbon_intensity']
        annual_co2_tons = annual_co2_kg / 907.185  # kg to US tons
        
        # Sample hourly data for frontend (every 24th hour to reduce payload size)
        sampled_hours = list(range(0, len(sim_result.hourly_power_kw), 24))
        sampled_power = [sim_result.hourly_power_kw[i] for i in sampled_hours]
        sampled_utilization = [sim_result.hourly_utilization[i] for i in sampled_hours]
        sampled_pue = [sim_result.hourly_pue[i] for i in sampled_hours]
        
        # Generate LLM analysis for simulation results
        print("Generating AI analysis...")
        llm_analysis = generate_llm_analysis_simulation(
            datacenter_config,
            location_data,
            climate_data,
            sim_result,
            grid_config,
            annual_cost,
            annual_co2_tons,
            state_name,
            region_code,
            lat,
            lon
        )
        
        # Compile forecast report
        forecast_report = {
            'timestamp': datetime.utcnow().isoformat(),
            'location': {
                'latitude': lat,
                'longitude': lon,
                'name': location_data.get('location_name', 'Unknown'),
                'state': state_name,
                'state_fips': state_fips,
                'grid_region': region_code,
                'population': location_data.get('population', 0),
                'median_income': location_data.get('median_income', 0)
            },
            'datacenter': datacenter_config,
            'climate': climate_data,
            'simulation': {
                'hours_simulated': simulation_hours,
                'peak_power_kw': sim_result.peak_power_kw,
                'average_power_kw': sim_result.average_power_kw,
                'annual_consumption_mwh': sim_result.annual_consumption_mwh,
                'average_utilization': float(np.mean(sim_result.hourly_utilization)),
                'peak_utilization': float(max(sim_result.hourly_utilization)),
                'average_pue': float(np.mean(sim_result.hourly_pue)),
                'best_pue': float(min(sim_result.hourly_pue)),
                'worst_pue': float(max(sim_result.hourly_pue)),
                'hourly_data': {
                    'hours': sampled_hours,
                    'power_kw': sampled_power,
                    'utilization': sampled_utilization,
                    'pue': sampled_pue
                }
            },
            'energy': {
                'annual_mwh': sim_result.annual_consumption_mwh,
                'annual_kwh': annual_kwh,
                'annual_cost': annual_cost,
                'grid_region': region_code,
                'base_rate': grid_config['base_rate'],
                'peak_multiplier': grid_config['peak_multiplier'],
                'percent_increase': sim_result.community_impact['average_impact_percent']
            },
            'carbon': {
                'annual_tons_co2': annual_co2_tons,
                'carbon_intensity_kg_kwh': grid_config['carbon_intensity'],
                'equivalent_cars': annual_co2_tons / 4.6,
                'equivalent_homes': annual_kwh / 10000
            },
            'community_impact': {
                'peak_impact_percent': sim_result.community_impact['peak_impact_percent'],
                'average_impact_percent': sim_result.community_impact['average_impact_percent'],
                'stability_risk': sim_result.community_impact['stability_risk'],
                'grid_classification': sim_result.community_impact['grid_classification'],
                'household_impact': sim_result.community_impact['household_impact'],
                'infrastructure_cost': sim_result.community_impact['infrastructure_cost']
            },
            'analysis': llm_analysis
        }

        # Write the forecast report to a file for later retrieval or debugging
        with open("forecast_report.json", "w") as f:
            json.dump(forecast_report, f, indent=2, default=str)
        
        return jsonify(forecast_report)
        
    except KeyError as e:
        print(f"Missing required parameter in forecast endpoint: {e}")
        return jsonify({'error': f'Missing required parameter: {str(e)}'}), 400
    except Exception as e:
        print(f"Error in forecast endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/forecast/stream', methods=['POST'])
def stream_forecast_datacenter():
    """Forecast with real-time streaming updates"""
    
    # Extract ALL request data BEFORE generator
    data = request.json
    lat = data['latitude']
    lon = data['longitude']
    dc_size = data.get('size', 'medium')
    simulation_hours = data.get('simulation_hours', 8760)
    
    # Custom configuration if provided
    if 'custom' in data and data['custom']:
        datacenter_config = {
            'name': data.get('name', 'Custom Data Center'),
            'power_mw': data.get('power_mw', 10),
            'servers': data.get('servers', 1000),
            'square_feet': data.get('square_feet', 50000),
            'water_gallons_per_day': data.get('water_gallons_per_day', 300000),
            'employees': data.get('employees', 50),
            'cooling_type': data.get('cooling_type', 'air_cooled'),
            'server_type': data.get('server_type', 'enterprise'),
            'datacenter_type': data.get('datacenter_type', 'enterprise')
        }
    else:
        datacenter_config = DATA_CENTER_TIERS.get(dc_size, DATA_CENTER_TIERS['medium'])
    
    def generate():
        try:
            last_heartbeat = time.time()
            
            # Step 1: Initial status
            yield f"data: {json.dumps({'status': 'started', 'step': 'initializing'})}\n\n"
            
            # Step 2: Gather location data
            yield f"data: {json.dumps({'status': 'progress', 'step': 'fetching_location_data'})}\n\n"
            location_data = get_population_data(lat, lon)
            
            # Step 3: Get grid and energy data
            yield f"data: {json.dumps({'status': 'progress', 'step': 'fetching_energy_data'})}\n\n"
            state_fips = location_data.get('state_fips', '')
            state_name = get_state_name_from_fips(state_fips)
            region_code = map_state_to_grid_region(state_fips)
            energy_data = get_energy_data(state_fips)
            
            # Step 4: Get climate data
            yield f"data: {json.dumps({'status': 'progress', 'step': 'fetching_climate_data'})}\n\n"
            climate_data = get_climate_data(lat, lon)
            
            # Step 5: Prepare simulation
            yield f"data: {json.dumps({'status': 'progress', 'step': 'preparing_simulation', 'hours': simulation_hours})}\n\n"
            dc_specs = create_datacenter_specs_from_config(datacenter_config)
            climate = create_climate_data_from_api(climate_data)
            grid_info = create_grid_info_from_location(location_data, region_code)
            
            # Step 6: Run simulation with progress updates (inline loop for streaming)
            yield f"data: {json.dumps({'status': 'simulating', 'hours_total': simulation_hours})}\n\n"
            from services.simulate import (
                ServerPowerModel, WorkloadSimulator, CoolingEfficiencyModel, 
                GridImpactCalculator, PowerSimulationResult
            )
            from datetime import timedelta
            
            # Initialize models
            server_model = ServerPowerModel(server_type=dc_specs.server_type)
            workload_sim = WorkloadSimulator()
            cooling_model = CoolingEfficiencyModel(cooling_type=dc_specs.cooling_type)
            grid_calculator = GridImpactCalculator()
            
            hourly_power_kw = []
            hourly_utilization = []
            hourly_pue = []
            start_date = datetime.now()
            
            # Run simulation with inline progress updates
            for hour in range(simulation_hours):
                current_time = start_date + timedelta(hours=hour)
                day_of_week = current_time.weekday()
                month = current_time.month
                hour_of_day = current_time.hour
                
                # Get utilization
                utilization = workload_sim.simulate_utilization(
                    hour_of_day, day_of_week, dc_specs.datacenter_type, month
                )
                
                # Calculate power
                power_per_server_w = server_model.get_power_consumption(
                    dc_specs.max_power_per_server, utilization
                )
                total_power_w = power_per_server_w * dc_specs.server_count
                
                # Calculate PUE
                pue = cooling_model.calculate_pue(climate)
                total_power_kw = (total_power_w / 1000) * pue
                
                hourly_power_kw.append(total_power_kw)
                hourly_utilization.append(utilization)
                hourly_pue.append(pue)
                
                # Yield progress every 24 hours
                if (hour + 1) % 24 == 0:
                    progress_update = {
                        'status': 'simulation_progress',
                        'hours_completed': hour + 1,
                        'percent_complete': round(((hour + 1) / simulation_hours) * 100, 1),
                        'current_avg_power_kw': round(float(np.mean(hourly_power_kw)), 2),
                        'current_avg_utilization': round(float(np.mean(hourly_utilization)), 2),
                        'current_avg_pue': round(float(np.mean(hourly_pue)), 3)
                    }
                    yield f"data: {json.dumps(progress_update)}\n\n"
                    last_heartbeat = time.time()
                
                # Send heartbeat if needed (every 15 seconds)
                if time.time() - last_heartbeat > 15:
                    yield f"data: {json.dumps({'status': 'heartbeat'})}\n\n"
                    last_heartbeat = time.time()
            
            # Calculate grid impact
            community_impact = grid_calculator.calculate_grid_impact(
                hourly_power_kw, grid_info
            )
            
            # Build simulation result
            sim_result = PowerSimulationResult(
                hourly_power_kw=hourly_power_kw,
                hourly_utilization=hourly_utilization,
                hourly_pue=hourly_pue,
                peak_power_kw=max(hourly_power_kw),
                average_power_kw=np.mean(hourly_power_kw),
                annual_consumption_mwh=sum(hourly_power_kw) / 1000,
                community_impact=community_impact
            )
            
            # Step 7: Calculate costs
            yield f"data: {json.dumps({'status': 'calculating_costs'})}\n\n"
            grid_config = grid_calculator.grid_regions.get(region_code, grid_calculator.grid_regions['DEFAULT'])
            annual_kwh = sim_result.annual_consumption_mwh * 1000
            annual_cost = annual_kwh * grid_config['base_rate']
            annual_co2_kg = annual_kwh * grid_config['carbon_intensity']
            annual_co2_tons = annual_co2_kg / 907.185
            
            # Step 8: Sample data for frontend
            sampled_hours = list(range(0, len(sim_result.hourly_power_kw), 24))
            sampled_power = [sim_result.hourly_power_kw[i] for i in sampled_hours]
            sampled_utilization = [sim_result.hourly_utilization[i] for i in sampled_hours]
            sampled_pue = [sim_result.hourly_pue[i] for i in sampled_hours]
            
            # Step 9: Generate AI analysis with streaming
            yield f"data: {json.dumps({'status': 'generating_analysis'})}\n\n"
            
            # Build the prompt inline for streaming
            prompt = f"""You are an environmental impact analyst for data centers. Analyze the following data center simulation results:

DATA CENTER SPECIFICATIONS:
- Type: {datacenter_config['name']}
- Power Capacity: {datacenter_config['power_mw']} MW
- Number of Servers: {datacenter_config['servers']:,}
- Size: {datacenter_config['square_feet']:,} square feet
- Cooling Type: {datacenter_config.get('cooling_type', 'air_cooled').replace('_', ' ').title()}
- Server Type: {datacenter_config.get('server_type', 'enterprise').replace('_', ' ').title()}
- Data Center Type: {datacenter_config.get('datacenter_type', 'enterprise').replace('_', ' ').title()}
- Employees: {datacenter_config['employees']}

LOCATION DATA:
- Coordinates: {lat}, {lon}
- Location: {location_data.get('location_name', 'Unknown')}, {state_name}
- Grid Region: {region_code}
- Population: {location_data.get('population', 0):,}
- Median Income: ${location_data.get('median_income', 0):,}

CLIMATE DATA:
- Temperature: {climate_data['temperature']}°F
- Humidity: {climate_data['humidity']}%
- Conditions: {climate_data['description']}

SIMULATION RESULTS (8760-hour annual simulation):
Energy Performance:
- Peak Power: {sim_result.peak_power_kw:,.0f} kW
- Average Power: {sim_result.average_power_kw:,.0f} kW
- Annual Consumption: {sim_result.annual_consumption_mwh:,.0f} MWh
- Annual Energy Cost: ${annual_cost:,.0f}
- Average PUE: {np.mean(sim_result.hourly_pue):.2f}
- Best PUE: {min(sim_result.hourly_pue):.2f}
- Worst PUE: {max(sim_result.hourly_pue):.2f}

Workload Characteristics:
- Average Utilization: {np.mean(sim_result.hourly_utilization):.1f}%
- Peak Utilization: {max(sim_result.hourly_utilization):.1f}%
- Minimum Utilization: {min(sim_result.hourly_utilization):.1f}%

Carbon Impact:
- Annual CO2 Emissions: {annual_co2_tons:,.0f} tons
- Grid Carbon Intensity: {grid_config['carbon_intensity']:.3f} kg CO₂/kWh
- Equivalent to {annual_co2_tons / 4.6:,.0f} cars
- Equivalent to power for {(sim_result.annual_consumption_mwh * 1000) / 10000:,.0f} homes

Community & Grid Impact:
- Peak Impact on Grid: {sim_result.community_impact['peak_impact_percent']:.2f}%
- Average Impact on Grid: {sim_result.community_impact['average_impact_percent']:.2f}%
- Grid Stability Risk: {sim_result.community_impact['stability_risk'].upper()}
- Grid Impact Classification: {sim_result.community_impact['grid_classification'].upper()}
- Monthly Cost Per Household: ${sim_result.community_impact['household_impact']['monthly_cost_per_household']:.2f}
- Household Bill Increase: {sim_result.community_impact['household_impact']['percentage_increase']:.2f}%
- Infrastructure Required: {sim_result.community_impact['infrastructure_cost']['required']}

Please provide a comprehensive analysis covering:
1. **Overall Performance Assessment** - How well does this data center perform based on the simulation?
2. **Energy Efficiency Analysis** - Assess PUE trends, cooling efficiency, and optimization opportunities
3. **Grid & Community Impact** - Detailed analysis of impact on local grid and households
4. **Workload Pattern Analysis** - What do the utilization patterns tell us about this facility?
5. **Environmental Concerns** - Carbon footprint and environmental sustainability analysis
6. **Infrastructure Requirements** - What grid infrastructure upgrades are needed?
7. **Cost-Benefit Analysis** - Economic impacts (jobs, costs to community, energy costs)
8. **Risk Assessment** - Grid stability risks, power supply concerns, regulatory challenges
9. **Recommendations** - Specific mitigation strategies, optimization opportunities, and site suitability

Be specific, data-driven, and balanced. Use the actual simulation data to support your analysis. Consider both technical performance and community impact."""

            # Stream the LLM response
            llm_analysis_chunks = []
            try:
                with client.messages.stream(
                    model="claude-sonnet-4-5-20250929",
                    max_tokens=8192,
                    messages=[{"role": "user", "content": prompt}]
                ) as stream:
                    for text in stream.text_stream:
                        llm_analysis_chunks.append(text)
                        # Send each chunk as it arrives
                        yield f"data: {json.dumps({'status': 'analysis_chunk', 'text': text})}\n\n"
                
                # Combine all chunks for final report
                llm_analysis = ''.join(llm_analysis_chunks)
                
            except Exception as e:
                llm_analysis = f"Error generating LLM analysis: {e}"
                yield f"data: {json.dumps({'status': 'analysis_error', 'message': str(e)})}\n\n"
            
            # Step 10: Compile final report
            forecast_report = {
                'timestamp': datetime.utcnow().isoformat(),
                'location': {
                    'latitude': lat,
                    'longitude': lon,
                    'name': location_data.get('location_name', 'Unknown'),
                    'state': state_name,
                    'state_fips': state_fips,
                    'grid_region': region_code,
                    'population': location_data.get('population', 0),
                    'median_income': location_data.get('median_income', 0)
                },
                'datacenter': datacenter_config,
                'climate': climate_data,
                'simulation': {
                    'hours_simulated': simulation_hours,
                    'peak_power_kw': sim_result.peak_power_kw,
                    'average_power_kw': sim_result.average_power_kw,
                    'annual_consumption_mwh': sim_result.annual_consumption_mwh,
                    'average_utilization': float(np.mean(sim_result.hourly_utilization)),
                    'peak_utilization': float(max(sim_result.hourly_utilization)),
                    'average_pue': float(np.mean(sim_result.hourly_pue)),
                    'best_pue': float(min(sim_result.hourly_pue)),
                    'worst_pue': float(max(sim_result.hourly_pue)),
                    'hourly_data': {
                        'hours': sampled_hours,
                        'power_kw': sampled_power,
                        'utilization': sampled_utilization,
                        'pue': sampled_pue
                    }
                },
                'energy': {
                    'annual_mwh': sim_result.annual_consumption_mwh,
                    'annual_kwh': annual_kwh,
                    'annual_cost': annual_cost,
                    'grid_region': region_code,
                    'base_rate': grid_config['base_rate'],
                    'peak_multiplier': grid_config['peak_multiplier'],
                    'percent_increase': sim_result.community_impact['average_impact_percent']
                },
                'carbon': {
                    'annual_tons_co2': annual_co2_tons,
                    'carbon_intensity_kg_kwh': grid_config['carbon_intensity'],
                    'equivalent_cars': annual_co2_tons / 4.6,
                    'equivalent_homes': annual_kwh / 10000
                },
                'community_impact': {
                    'peak_impact_percent': sim_result.community_impact['peak_impact_percent'],
                    'average_impact_percent': sim_result.community_impact['average_impact_percent'],
                    'stability_risk': sim_result.community_impact['stability_risk'],
                    'grid_classification': sim_result.community_impact['grid_classification'],
                    'household_impact': sim_result.community_impact['household_impact'],
                    'infrastructure_cost': sim_result.community_impact['infrastructure_cost']
                },
                'analysis': llm_analysis
            }
            
            # Step 11: Send final complete report
            yield f"data: {json.dumps({'status': 'complete', 'report': forecast_report})}\n\n"
            
        except Exception as e:
            import traceback
            error_detail = traceback.format_exc()
            print(f"Stream error: {error_detail}")
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"
    
    # Return streaming response
    response = Response(stream_with_context(generate()), mimetype='text/event-stream')
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['X-Accel-Buffering'] = 'no'  # Disable nginx buffering
    response.headers['Access-Control-Allow-Origin'] = '*'  # Adjust for production
    return response

@app.route('/api/datacenter-types', methods=['GET'])
def get_datacenter_types():
    """Get available data center types and their specs"""
    return jsonify(DATA_CENTER_TIERS)

@app.route("/health", methods=["GET", "OPTIONS"])
@cross_origin()
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

