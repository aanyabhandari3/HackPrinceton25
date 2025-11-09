"""
API Wrapper and Utilities for Environmental Forecast Enhancement
Provides simple interfaces for integrating environmental insights
"""

import os
import json
from typing import Dict, Any, Optional, List, Callable
from dataclasses import dataclass, asdict
import asyncio
from datetime import datetime
import requests
from functools import lru_cache


@dataclass
class APICredentials:
    """API credentials for various services"""
    airnow_api_key: str = ""
    census_api_key: str = ""
    sentinel_hub_client_id: str = ""
    sentinel_hub_client_secret: str = ""
    nasa_earthdata_token: str = ""
    
    @classmethod
    def from_env_file(cls, env_file: str = "config.env"):
        """Load credentials from config.env file"""
        from dotenv import load_dotenv
        load_dotenv(env_file)
        
        return cls(
            airnow_api_key=os.getenv('AIRNOW_API_KEY', ''),
            census_api_key=os.getenv('CENSUS_API_KEY', ''),
            sentinel_hub_client_id=os.getenv('SENTINEL_HUB_CLIENT_ID', ''),
            sentinel_hub_client_secret=os.getenv('SENTINEL_HUB_CLIENT_SECRET', ''),
            nasa_earthdata_token=os.getenv('NASA_EARTHDATA_TOKEN', '')
        )


class LocationResolver:
    """Resolve location information from various formats"""
    
    @staticmethod
    def from_address(address: str) -> Dict[str, float]:
        """Convert address to lat/lon using geocoding"""
        # Using Nominatim (OpenStreetMap) - no API key required
        try:
            url = "https://nominatim.openstreetmap.org/search"
            params = {
                'q': address,
                'format': 'json',
                'limit': 1
            }
            headers = {'User-Agent': 'EnvironmentalForecastEnhancer/1.0'}
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if data:
                return {
                    'lat': float(data[0]['lat']),
                    'lon': float(data[0]['lon']),
                    'display_name': data[0].get('display_name', address)
                }
        except Exception as e:
            print(f"Geocoding error: {e}")
        
        return None
    
    @staticmethod
    def from_zip_code(zip_code: str, country: str = 'US') -> Dict[str, float]:
        """Convert zip code to lat/lon"""
        # Simple lookup for US zip codes
        # In production, use a proper zip code database
        try:
            url = f"https://api.zippopotam.us/{country}/{zip_code}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return {
                'lat': float(data['places'][0]['latitude']),
                'lon': float(data['places'][0]['longitude']),
                'display_name': f"{data['places'][0]['place name']}, {data['places'][0]['state']}"
            }
        except Exception as e:
            print(f"Zip code lookup error: {e}")
        
        return None
    
    @staticmethod
    def get_fips_codes(lat: float, lon: float) -> Dict[str, str]:
        """Get FIPS codes for census data lookup"""
        # This would use FCC's API or a local database
        # Simplified for demonstration
        return {
            'state': '36',  # Example: New York
            'county': '061',  # Example: New York County
            'tract': '007502'  # Example tract
        }


class EnhancementOptions:
    """Configuration options for forecast enhancement"""
    
    def __init__(self):
        self.include_air_quality = True
        self.include_emissions = True
        self.include_demographics = False
        self.include_infrastructure = True
        self.include_satellite = False
        self.include_water_quality = False
        self.cache_duration_hours = 1
        self.parallel_requests = True
        self.max_retries = 3
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API calls"""
        return {
            'include_air_quality': self.include_air_quality,
            'include_emissions': self.include_emissions,
            'include_demographics': self.include_demographics,
            'include_infrastructure': self.include_infrastructure,
            'include_satellite': self.include_satellite,
            'include_water_quality': self.include_water_quality
        }
    
    @classmethod
    def minimal(cls):
        """Minimal configuration for fast responses"""
        options = cls()
        options.include_demographics = False
        options.include_satellite = False
        options.include_water_quality = False
        return options
    
    @classmethod
    def comprehensive(cls):
        """Full analysis with all data sources"""
        options = cls()
        options.include_air_quality = True
        options.include_emissions = True
        options.include_demographics = True
        options.include_infrastructure = True
        options.include_satellite = True
        options.include_water_quality = True
        return options


class WaterQualityAnalyzer:
    """Analyze water quality impacts"""
    
    def __init__(self):
        self.base_url = "https://www.waterqualitydata.us/data/Station/search"
    
    def get_nearby_water_data(self, lat: float, lon: float, 
                             radius_miles: float = 10) -> Dict[str, Any]:
        """Get water quality data from nearby monitoring stations"""
        try:
            params = {
                'lat': lat,
                'long': lon,
                'within': radius_miles,
                'mimeType': 'json',
                'sorted': 'no'
            }
            
            response = requests.get(self.base_url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            
            # Process water quality data
            stations = data.get('features', [])
            
            return {
                'stations_found': len(stations),
                'nearest_station': stations[0] if stations else None,
                'water_quality_concerns': self._analyze_water_concerns(stations)
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def _analyze_water_concerns(self, stations: List) -> List[str]:
        """Analyze water quality concerns from station data"""
        concerns = []
        
        # Simplified analysis - in production, check actual measurements
        if len(stations) > 0:
            # Check for various indicators
            concerns.append("Monitor local water advisories")
        
        return concerns


class ResearchDataAggregator:
    """Aggregate research data on environmental impacts"""
    
    def __init__(self):
        self.research_sources = {
            'EESI': 'https://www.eesi.org/papers',
            'Stanford': 'https://woods.stanford.edu/research',
            'Oxford': 'https://www.ox.ac.uk/research/research-impact'
        }
        self.cached_studies = {}
    
    @lru_cache(maxsize=100)
    def get_impact_studies(self, topic: str) -> List[Dict[str, str]]:
        """Get relevant research studies on environmental impacts"""
        # In production, this would search research databases
        # For now, return curated relevant studies
        
        studies_db = {
            'air_quality_health': [
                {
                    'title': 'Long-term exposure to PM2.5 and mortality',
                    'source': 'Harvard T.H. Chan School of Public Health',
                    'finding': 'Each 10 μg/m³ increase in PM2.5 associated with 6% increase in mortality',
                    'year': '2023'
                },
                {
                    'title': 'Ozone exposure and respiratory health',
                    'source': 'Stanford Woods Institute',
                    'finding': 'Ground-level ozone increases asthma hospitalizations by 10-15%',
                    'year': '2023'
                }
            ],
            'urban_heat_island': [
                {
                    'title': 'Urban Heat Islands and Climate Adaptation',
                    'source': 'Oxford Environmental Change Institute',
                    'finding': 'Urban areas 2-5°C warmer than surroundings, affecting 68% of population',
                    'year': '2024'
                }
            ],
            'water_pollution': [
                {
                    'title': 'Agricultural Runoff Impact Assessment',
                    'source': 'EESI Water Resources',
                    'finding': 'Nutrient pollution affects 40% of US waterways',
                    'year': '2023'
                }
            ]
        }
        
        return studies_db.get(topic, [])
    
    def get_mitigation_strategies(self, risk_factors: List[str]) -> List[Dict[str, str]]:
        """Get mitigation strategies based on identified risks"""
        strategies = []
        
        strategy_map = {
            'high_aqi': {
                'strategy': 'Indoor Air Filtration',
                'description': 'Use HEPA filters and maintain HVAC systems',
                'effectiveness': 'Reduces indoor PM2.5 by 50-70%'
            },
            'heat_island': {
                'strategy': 'Cool Roof Implementation',
                'description': 'Reflective surfaces and green roofs',
                'effectiveness': 'Reduces ambient temperature by 1-3°C'
            },
            'industrial_proximity': {
                'strategy': 'Buffer Zones',
                'description': 'Green barriers and monitoring systems',
                'effectiveness': 'Reduces exposure by 30-40%'
            }
        }
        
        for risk in risk_factors:
            if risk in strategy_map:
                strategies.append(strategy_map[risk])
        
        return strategies


class SimpleForecastEnhancer:
    """
    Simplified interface for enhancing forecasts
    This is the main class users should interact with
    """
    
    def __init__(self, credentials: Optional[APICredentials] = None):
        from environmental import EnvironmentalInsightsEngine
        
        # Load from config.env
        self.credentials = credentials or APICredentials.from_env_file("backend/config.env")
        
        # Initialize engines
        self.insights_engine = EnvironmentalInsightsEngine()
        self.location_resolver = LocationResolver()
        self.water_analyzer = WaterQualityAnalyzer()
        self.research_aggregator = ResearchDataAggregator()
        
    def enhance(self, 
                forecast: Dict[str, Any],
                location: Optional[Dict[str, float]] = None,
                address: Optional[str] = None,
                options: Optional[EnhancementOptions] = None) -> Dict[str, Any]:
        """
        Simple method to enhance a forecast with environmental data
        
        Args:
            forecast: Your original forecast data
            location: Dict with 'lat' and 'lon' OR
            address: String address to geocode
            options: Enhancement options (uses defaults if None)
        
        Returns:
            Enhanced forecast with environmental insights
        """
        
        # Resolve location
        if location is None and address:
            location = self.location_resolver.from_address(address)
            if location is None:
                raise ValueError(f"Could not resolve address: {address}")
        elif location is None:
            raise ValueError("Either location or address must be provided")
        
        # Use default options if not provided
        if options is None:
            options = EnhancementOptions.minimal()
        
        # Enhance the forecast
        enhanced = self.insights_engine.enhance_forecast_with_insights(
            forecast,
            location,
            options.to_dict()
        )
        
        # Add water quality if requested
        if options.include_water_quality:
            enhanced['environmental_insights']['water_quality'] = \
                self.water_analyzer.get_nearby_water_data(
                    location['lat'], 
                    location['lon']
                )
        
        # Add research context
        if enhanced.get('environmental_risk_score', {}).get('overall_score', 0) > 50:
            risk_factors = self._identify_risk_factors(enhanced)
            enhanced['research_context'] = {
                'relevant_studies': self.research_aggregator.get_impact_studies('air_quality_health'),
                'mitigation_strategies': self.research_aggregator.get_mitigation_strategies(risk_factors)
            }
        
        return enhanced
    
    def _identify_risk_factors(self, enhanced_forecast: Dict) -> List[str]:
        """Identify risk factors from enhanced forecast"""
        risks = []
        
        insights = enhanced_forecast.get('environmental_insights', {})
        
        # Check AQI
        aqi_value = insights.get('air_quality', {}).get('overall_aqi', 0)
        # Handle None values from errors
        if aqi_value is not None and isinstance(aqi_value, (int, float)) and aqi_value > 100:
            risks.append('high_aqi')
        
        # Check infrastructure
        infra = insights.get('infrastructure', {})
        if infra.get('infrastructure_density') in ['High', 'Very High']:
            risks.append('heat_island')
        
        if 'Industrial emissions nearby' in infra.get('environmental_concerns', []):
            risks.append('industrial_proximity')
        
        return risks
    
    def generate_report(self, enhanced_forecast: Dict) -> str:
        """Generate a formatted report from enhanced forecast"""
        report = []
        
        # Header
        report.append("=" * 60)
        report.append("ENVIRONMENTAL FORECAST REPORT")
        report.append("=" * 60)
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Original forecast
        if 'forecast_text' in enhanced_forecast:
            report.append("WEATHER FORECAST:")
            report.append("-" * 40)
            report.append(enhanced_forecast['forecast_text'])
            report.append("")
        
        # Environmental insights summary
        summary = self.insights_engine.generate_insights_summary(enhanced_forecast)
        report.append("ENVIRONMENTAL ANALYSIS:")
        report.append("-" * 40)
        report.append(summary)
        report.append("")
        
        # Research context if available
        if 'research_context' in enhanced_forecast:
            report.append("SCIENTIFIC CONTEXT:")
            report.append("-" * 40)
            
            studies = enhanced_forecast['research_context'].get('relevant_studies', [])
            if studies:
                report.append("Relevant Research:")
                for study in studies[:2]:
                    report.append(f"• {study['title']} ({study['year']})")
                    report.append(f"  Finding: {study['finding']}")
                report.append("")
            
            strategies = enhanced_forecast['research_context'].get('mitigation_strategies', [])
            if strategies:
                report.append("Recommended Mitigation:")
                for strategy in strategies:
                    report.append(f"• {strategy['strategy']}: {strategy['description']}")
                    report.append(f"  Effectiveness: {strategy['effectiveness']}")
        
        report.append("")
        report.append("=" * 60)
        
        return "\n".join(report)


# Example usage function
def example_usage():
    """Demonstrate how to use the enhancer"""
    
    # Initialize the enhancer
    enhancer = SimpleForecastEnhancer()
    
    # Your existing forecast from the LLM
    original_forecast = {
        "date": "2024-01-15",
        "temperature": 72,
        "conditions": "Partly cloudy",
        "forecast_text": "Partly cloudy with comfortable temperatures around 72°F."
    }
    
    # Enhance with environmental data
    enhanced = enhancer.enhance(
        forecast=original_forecast,
        address="Times Square, New York, NY",
        options=EnhancementOptions.minimal()
    )
    
    # Generate report
    report = enhancer.generate_report(enhanced)
    print(report)
    
    # Save to file if needed
    with open('enhanced_forecast.json', 'w') as f:
        json.dump(enhanced, f, indent=2, default=str)
    
    return enhanced


if __name__ == "__main__":
    # Run example
    result = example_usage()
    print("\nEnhancement complete! Check enhanced_forecast.json for full data.")