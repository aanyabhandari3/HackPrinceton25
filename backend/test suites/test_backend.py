"""
Test script for Data Center Impact Analyzer Backend
Tests all API integrations and endpoints
"""

import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def test_env_variables():
    """Test if all required environment variables are set"""
    print("\n" + "="*50)
    print("Testing Environment Variables")
    print("="*50)
    
    required_vars = [
        'ANTHROPIC_API_KEY',
        'MAPBOX_TOKEN',
        'CENSUS_API_KEY',
        'EIA_API_KEY',
        'OPENWEATHER_API_KEY'
    ]
    
    all_set = True
    for var in required_vars:
        value = os.getenv(var)
        if value and value != f'your-{var.lower().replace("_", "-")}-here':
            print_success(f"{var} is set")
        else:
            print_error(f"{var} is NOT set or still has placeholder value")
            all_set = False
    
    return all_set

def test_health_endpoint():
    """Test the health check endpoint"""
    print("\n" + "="*50)
    print("Testing Health Endpoint")
    print("="*50)
    
    try:
        response = requests.get('http://localhost:5000/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Health endpoint is working")
            print_info(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print_error(f"Health endpoint returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to server. Is it running on port 5000?")
        return False
    except Exception as e:
        print_error(f"Error testing health endpoint: {e}")
        return False

def test_datacenter_types_endpoint():
    """Test the datacenter types endpoint"""
    print("\n" + "="*50)
    print("Testing Data Center Types Endpoint")
    print("="*50)
    
    try:
        response = requests.get('http://localhost:5000/api/datacenter-types', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Data center types endpoint is working")
            print_info(f"Available types: {', '.join(data.keys())}")
            return True
        else:
            print_error(f"Endpoint returned status {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error testing datacenter types: {e}")
        return False

def test_analyze_endpoint():
    """Test the analyze endpoint with a sample location"""
    print("\n" + "="*50)
    print("Testing Analyze Endpoint")
    print("="*50)
    
    # Test location: San Francisco, CA
    payload = {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "size": "medium",
        "custom": False
    }
    
    print_info("Testing with San Francisco, CA (Medium data center)")
    
    try:
        response = requests.post(
            'http://localhost:5000/api/analyze',
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Analyze endpoint is working!")
            
            # Print key results
            print("\n" + "-"*50)
            print("Sample Results:")
            print("-"*50)
            print_info(f"Location: {data['location']['name']}")
            print_info(f"Population: {data['location']['population']:,}")
            print_info(f"Annual Energy: {data['impact']['energy']['annual_mwh']:,.0f} MWh")
            print_info(f"Annual CO2: {data['impact']['carbon']['annual_tons_co2']:,.0f} tons")
            print_info(f"Jobs Created: {data['impact']['economic']['jobs_created']}")
            
            return True
        else:
            print_error(f"Endpoint returned status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print_error("Request timed out. Analysis takes time due to AI processing.")
        print_warning("This is normal if APIs are working but slow.")
        return False
    except Exception as e:
        print_error(f"Error testing analyze endpoint: {e}")
        return False

def test_census_api():
    """Test Census API directly"""
    print("\n" + "="*50)
    print("Testing US Census API")
    print("="*50)
    
    api_key = os.getenv('CENSUS_API_KEY')
    if not api_key:
        print_error("CENSUS_API_KEY not set")
        return False
    
    try:
        # Test geocoding
        response = requests.get(
            'https://geocoding.geo.census.gov/geocoder/geographies/coordinates',
            params={
                'x': -122.4194,
                'y': 37.7749,
                'benchmark': 'Public_AR_Current',
                'vintage': 'Current_Current',
                'format': 'json'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print_success("Census geocoding API is accessible")
            return True
        else:
            print_error(f"Census API returned status {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error testing Census API: {e}")
        return False

def test_eia_api():
    """Test EIA API directly"""
    print("\n" + "="*50)
    print("Testing EIA API")
    print("="*50)
    
    api_key = os.getenv('EIA_API_KEY')
    if not api_key:
        print_error("EIA_API_KEY not set")
        return False
    
    try:
        response = requests.get(
            'https://api.eia.gov/v2/electricity/retail-sales/data/',
            params={
                'api_key': api_key,
                'frequency': 'annual',
                'data[0]': 'price',
                'facets[stateid][]': 'CA',
                'facets[sectorid][]': 'IND',
                'sort[0][column]': 'period',
                'sort[0][direction]': 'desc',
                'length': 1
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print_success("EIA API is accessible")
            return True
        else:
            print_error(f"EIA API returned status {response.status_code}")
            print_warning(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Error testing EIA API: {e}")
        return False

def test_openweather_api():
    """Test OpenWeatherMap API directly"""
    print("\n" + "="*50)
    print("Testing OpenWeatherMap API")
    print("="*50)
    
    api_key = os.getenv('OPENWEATHER_API_KEY')
    if not api_key:
        print_error("OPENWEATHER_API_KEY not set")
        return False
    
    try:
        response = requests.get(
            'https://api.openweathermap.org/data/2.5/weather',
            params={
                'lat': 37.7749,
                'lon': -122.4194,
                'appid': api_key,
                'units': 'imperial'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print_success("OpenWeatherMap API is accessible")
            data = response.json()
            print_info(f"Sample data: {data['main']['temp']}°F, {data['weather'][0]['description']}")
            return True
        else:
            print_error(f"OpenWeatherMap API returned status {response.status_code}")
            print_warning(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Error testing OpenWeatherMap API: {e}")
        return False

def test_anthropic_api():
    """Test Anthropic API directly"""
    print("\n" + "="*50)
    print("Testing Anthropic Claude API")
    print("="*50)
    
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print_error("ANTHROPIC_API_KEY not set")
        return False
    
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": "Say 'API test successful' in 5 words or less."
            }]
        )
        
        print_success("Anthropic Claude API is accessible")
        print_info(f"Response: {message.content[0].text}")
        return True
        
    except Exception as e:
        print_error(f"Error testing Anthropic API: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*50)
    print("Data Center Impact Analyzer - Backend Tests")
    print("="*50)
    
    results = {}
    
    # Test environment variables
    results['env_vars'] = test_env_variables()
    
    # Test external APIs
    results['census'] = test_census_api()
    results['eia'] = test_eia_api()
    results['openweather'] = test_openweather_api()
    results['anthropic'] = test_anthropic_api()
    
    # Test server endpoints
    results['health'] = test_health_endpoint()
    if results['health']:
        results['datacenter_types'] = test_datacenter_types_endpoint()
        results['analyze'] = test_analyze_endpoint()
    else:
        print_warning("\nSkipping endpoint tests - server not running")
        results['datacenter_types'] = False
        results['analyze'] = False
    
    # Print summary
    print("\n" + "="*50)
    print("Test Summary")
    print("="*50)
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for test, result in results.items():
        status = "PASS" if result else "FAIL"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{status}{Colors.END} - {test.replace('_', ' ').title()}")
    
    print("\n" + "-"*50)
    print(f"Results: {passed}/{total} tests passed")
    print("-"*50)
    
    if passed == total:
        print_success("\nAll tests passed! Backend is ready to use.")
    else:
        print_warning(f"\n{total - passed} test(s) failed. Check the errors above.")
        print_info("\nCommon issues:")
        print("  - Ensure all API keys are set in .env file")
        print("  - Check that the Flask server is running (python app.py)")
        print("  - Verify API keys are valid and activated")
        print("  - Some APIs may take time to activate after signup")

if __name__ == '__main__':
    main()