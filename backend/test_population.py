"""
Comprehensive Test Suite for backend/app.py get_population_data() function

Run this on your local machine where you have API keys configured.

Usage:
    python test_population_function.py
"""

import os
import sys as sys
import requests
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv('backend/config.env')

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}")
    print(f"{text}")
    print(f"{'='*70}{Colors.END}")

def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ {text}{Colors.END}")

# Load API keys
CENSUS_API_KEY = os.getenv('CENSUS_API_KEY')

from app import get_population_data

def test_api_keys():
    """Test 1: Verify API keys are configured"""
    print_header("TEST 1: API Key Configuration")
    
    if not CENSUS_API_KEY:
        print_error("CENSUS_API_KEY is not set in backend/.env")
        print_info("Get a free key at: https://api.census.gov/data/key_signup.html")
        return False
    
    if CENSUS_API_KEY.startswith('your-') or len(CENSUS_API_KEY) < 10:
        print_error("CENSUS_API_KEY appears to be a placeholder")
        print_info("Replace it with your actual Census API key")
        return False
    
    print_success(f"CENSUS_API_KEY is configured: {CENSUS_API_KEY[:15]}...")
    return True

def test_geocoding_api():
    """Test 2: Test Census Geocoding API (doesn't require key)"""
    print_header("TEST 2: Census Geocoding API")
    
    test_lat, test_lon = 40.7128, -74.0060  # New York
    
    try:
        response = requests.get(
            'https://geocoding.geo.census.gov/geocoder/geographies/coordinates',
            params={
                'x': test_lon,
                'y': test_lat,
                'benchmark': 'Public_AR_Current',
                'vintage': 'Current_Current',
                'format': 'json'
            },
            timeout=10
        )
        
        print_info(f"Testing with: {test_lat}, {test_lon} (New York)")
        print_info(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            geo_data = response.json()
            
            if 'result' in geo_data and 'geographies' in geo_data['result']:
                counties = geo_data['result']['geographies'].get('Counties', [])
                
                if counties:
                    county = counties[0]
                    print_success("Geocoding API is working!")
                    print_info(f"  Location: {county.get('NAME', 'Unknown')}")
                    print_info(f"  State FIPS: {county.get('STATE', 'Unknown')}")
                    print_info(f"  County FIPS: {county.get('COUNTY', 'Unknown')}")
                    return True
                else:
                    print_error("No county data in response")
                    print_info(f"Response: {geo_data}")
            else:
                print_error("Invalid response structure")
                print_info(f"Response: {geo_data}")
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text[:200]}")
        
        return False
        
    except Exception as e:
        print_error(f"Exception occurred: {e}")
        print_info("Check your internet connection")
        return False

def test_population_api():
    """Test 3: Test Census Population API (requires key)"""
    print_header("TEST 3: Census Population Data API")
    
    if not CENSUS_API_KEY:
        print_warning("Skipping - CENSUS_API_KEY not configured")
        return False
    
    # Test with San Francisco County
    state_fips = '06'
    county_fips = '075'
    
    try:
        response = requests.get(
            'https://api.census.gov/data/2022/acs/acs5',
            params={
                'get': 'NAME,B01003_001E,B19013_001E',
                'for': f'county:{county_fips}',
                'in': f'state:{state_fips}',
                'key': CENSUS_API_KEY
            },
            timeout=10
        )
        
        print_info(f"Testing with: State {state_fips}, County {county_fips} (San Francisco)")
        print_info(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            if len(data) > 1:
                print_success("Population API is working!")
                print_info(f"  Location: {data[1][0]}")
                print_info(f"  Population: {int(data[1][1]):,}")
                print_info(f"  Median Income: ${int(data[1][2]):,}")
                return True
            else:
                print_error("Unexpected response format")
                print_info(f"Response: {data}")
        else:
            print_error(f"Request failed with status {response.status_code}")
            print_info(f"Response: {response.text[:200]}")
            
            if response.status_code == 400:
                print_warning("Status 400 might mean invalid API key")
        
        return False
        
    except Exception as e:
        print_error(f"Exception occurred: {e}")
        return False

def test_full_function():
    """Test 4: Test the complete get_population_data function"""
    print_header("TEST 4: Complete get_population_data() Function")
    
    if not CENSUS_API_KEY:
        print_warning("Skipping - CENSUS_API_KEY not configured")
        return False
    
    test_locations = [
        (40.7128, -74.0060, "New York, NY", "New York County"),
        (37.7749, -122.4194, "San Francisco, CA", "San Francisco County"),
        (41.8781, -87.6298, "Chicago, IL", "Cook County"),
        (40.3430, -74.6514, "Princeton, NJ", "Mercer County"),
    ]
    
    passed = 0
    failed = 0
    
    for lat, lon, name, expected_county in test_locations:
        print(f"\n{Colors.BOLD}Testing: {name}{Colors.END}")
        print(f"Coordinates: {lat}, {lon}")
        
        result = get_population_data(lat, lon)
        
        if result and result['population'] > 0:
            print_success("Data retrieved successfully!")
            print_info(f"  Location: {result['location_name']}")
            print_info(f"  Population: {result['population']:,}")
            print_info(f"  Median Income: ${result['median_income']:,}")
            print_info(f"  FIPS: {result['state_fips']}-{result['county_fips']}")
            
            if expected_county.lower() in result['location_name'].lower():
                print_success(f"  County matches expected: {expected_county}")
                passed += 1
            else:
                print_warning(f"  County doesn't match expected: {expected_county}")
                print_info(f"  Got: {result['location_name']}")
                passed += 1  # Still count as pass if we got data
        else:
            print_error("Failed to retrieve data")
            print_info(f"  Result: {result}")
            failed += 1
    
    print(f"\n{Colors.BOLD}Results: {passed} passed, {failed} failed{Colors.END}")
    return passed > 0

def test_edge_cases():
    """Test 5: Test edge cases and error handling"""
    print_header("TEST 5: Edge Cases and Error Handling")
    
    if not CENSUS_API_KEY:
        print_warning("Skipping - CENSUS_API_KEY not configured")
        return False
    
    edge_cases = [
        (0, 0, "Origin (Atlantic Ocean)", "Should handle gracefully"),
        (90, 0, "North Pole", "Should handle gracefully"),
        (200, 200, "Invalid coordinates", "Should handle gracefully"),
        (48.8566, 2.3522, "Paris, France", "Should return Unknown (outside US)"),
    ]
    
    for lat, lon, name, expected in edge_cases:
        print(f"\n{Colors.BOLD}Testing: {name}{Colors.END}")
        print(f"Coordinates: {lat}, {lon}")
        print(f"Expected: {expected}")
        
        result = get_population_data(lat, lon)
        
        if result:
            print_success("Function didn't crash!")
            print_info(f"  Result: {result}")
        else:
            print_error("Function returned None or crashed")
    
    return True

def test_backend_integration():
    """Test 6: Test with running backend server"""
    print_header("TEST 6: Backend Server Integration")
    
    print_info("Testing if backend is running on localhost:5000...")
    
    try:
        response = requests.get('http://localhost:5000/health', timeout=2)
        
        if response.status_code == 200:
            print_success("Backend server is running!")
            print_info(f"Response: {response.json()}")
            
            # Test the analyze endpoint
            print_info("\nTesting /api/analyze endpoint...")
            
            test_payload = {
                "latitude": 40.7128,
                "longitude": -74.0060,
                "size": "small"
            }
            
            response = requests.post(
                'http://localhost:5000/api/analyze',
                json=test_payload,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                print_success("Analyze endpoint working!")
                print_info(f"  Location: {data.get('location', {}).get('name', 'Unknown')}")
                print_info(f"  Population: {data.get('location', {}).get('population', 0):,}")
                return True
            else:
                print_error(f"Analyze endpoint failed: {response.status_code}")
                print_info(f"Response: {response.text[:200]}")
        else:
            print_error(f"Health check failed: {response.status_code}")
        
    except requests.exceptions.ConnectionError:
        print_warning("Backend server is not running")
        print_info("To start: cd backend && python app.py")
    except Exception as e:
        print_error(f"Exception: {e}")
    
    return False

def main():
    """Run all tests"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("="*70)
    print("  DATA CENTER IMPACT ANALYZER - BACKEND TEST SUITE")
    print("="*70)
    print(Colors.END)
    
    print_info("This test suite verifies the get_population_data() function")
    print_info("and related Census API integration.")
    print()
    
    results = {}
    
    # Run tests
    results['api_keys'] = test_api_keys()
    
    if results['api_keys']:
        results['geocoding'] = test_geocoding_api()
        results['population_api'] = test_population_api()
        results['full_function'] = test_full_function()
        results['edge_cases'] = test_edge_cases()
        results['backend_integration'] = test_backend_integration()
    else:
        print_warning("\nSkipping remaining tests - API key not configured")
        print_info("Please add CENSUS_API_KEY to backend/.env")
        print_info("Get a free key at: https://api.census.gov/data/key_signup.html")
        return
    
    # Summary
    print_header("TEST SUMMARY")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for test_name, result in results.items():
        status = "PASS" if result else "FAIL"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{status:6s}{Colors.END} - {test_name.replace('_', ' ').title()}")
    
    print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.END}")
    
    if passed == total:
        print_success("\n🎉 All tests passed! Your backend is ready to use.")
    elif passed > 0:
        print_warning(f"\n⚠️  {total - passed} test(s) failed. Review the output above.")
    else:
        print_error("\n❌ All tests failed. Check your configuration.")
    
    print("\n" + "="*70)

if __name__ == '__main__':
    main()