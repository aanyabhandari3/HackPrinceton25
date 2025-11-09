from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import anthropic
import requests
from datetime import datetime
import googlemaps

load_dotenv('config.env')

app = Flask(__name__)
CORS(app)

# API Keys
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
MAPBOX_TOKEN = os.getenv('MAPBOX_TOKEN')
CENSUS_API_KEY = os.getenv('CENSUS_API_KEY')
EIA_API_KEY = os.getenv('EIA_API_KEY')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
MAPS_API_KEY = os.getenv('MAPS_API_KEY')

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# Data center specifications mapping
DATA_CENTER_TIERS = {
    'small': {
        'name': 'Small Edge Data Center',
        'power_mw': 1,  # Megawatts
        'servers': 100,
        'square_feet': 5000,
        'water_gallons_per_day': 25000,
        'employees': 10
    },
    'medium': {
        'name': 'Medium Enterprise Data Center',
        'power_mw': 10,
        'servers': 1000,
        'square_feet': 50000,
        'water_gallons_per_day': 300000,
        'employees': 50
    },
    'large': {
        'name': 'Large Hyperscale Data Center',
        'power_mw': 50,
        'servers': 10000,
        'square_feet': 250000,
        'water_gallons_per_day': 1500000,
        'employees': 200
    },
    'mega': {
        'name': 'Mega Hyperscale Data Center',
        'power_mw': 150,
        'servers': 50000,
        'square_feet': 750000,
        'water_gallons_per_day': 5000000,
        'employees': 500
    }
}

def get_population_data(lat, lon, radius_miles=10):
    """Get population data from US Census API"""
    try:
        # Convert lat/lon to state and county FIPS codes
        # Using reverse geocoding first
        response = requests.get(
            f'https://geocoding.geo.census.gov/geocoder/geographies/coordinates',
            params={
                'x': lon,
                'y': lat,
                'benchmark': 'Public_AR_Current',
                'vintage': 'Current_Current',
                'format': 'json'
            }
        )
        
        if response.status_code == 200:
            geo_data = response.json()
            if 'result' in geo_data and 'geographies' in geo_data['result']:
                county_data = geo_data['result']['geographies'].get('Counties', [{}])[0]
                state_fips = county_data.get('STATE', '')
                county_fips = county_data.get('COUNTY', '')
                
                # Get population data
                pop_response = requests.get(
                    'https://api.census.gov/data/2021/acs/acs5',
                    params={
                        'get': 'NAME,B01003_001E,B19013_001E',  # Total population, Median income
                        'for': f'county:{county_fips}',
                        'in': f'state:{state_fips}',
                        'key': CENSUS_API_KEY
                    }
                )
                
                if pop_response.status_code == 200:
                    pop_data = pop_response.json()
                    if len(pop_data) > 1:
                        return {
                            'location_name': pop_data[1][0],
                            'population': int(pop_data[1][1]),
                            'median_income': int(pop_data[1][2]) if pop_data[1][2] not in ['-666666666', None] else 0,
                            'state_fips': state_fips,
                            'county_fips': county_fips
                        }
        
        return {
            'location_name': 'Unknown',
            'population': 0,
            'median_income': 0,
            'state_fips': '',
            'county_fips': ''
        }
    except Exception as e:
        print(f"Error fetching population data: {e}")
        return {
            'location_name': 'Unknown',
            'population': 0,
            'median_income': 0
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
    gmaps = googlemaps.Client(key=os.getenv('MAPS_API_KEY'))
    reverse_geocode_result = gmaps.reverse_geocode((lat, lon))
    return reverse_geocode_result

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
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        return message.content[0].text
    except Exception as e:
        print(f"Error generating LLM analysis: {e}")
        return "Error generating analysis. Please check API configuration."

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
        print(f"Street address: {street_address}")
        
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
        
        return jsonify(report)
        
    except Exception as e:
        print(f"Error in analyze endpoint: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/datacenter-types', methods=['GET'])
def get_datacenter_types():
    """Get available data center types and their specs"""
    return jsonify(DATA_CENTER_TIERS)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

