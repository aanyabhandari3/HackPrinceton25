"""
Environmental Insights Module for Forecast Enhancement
Integrates air quality, emissions, and environmental data without modifying core forecast LLM
"""

import os
import json
import requests
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, timedelta
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from config file
from dotenv import load_dotenv
import os as os_module

# Try multiple possible paths for config.env
_config_paths = [
    "config.env",  # Current directory (when running from backend/)
    "backend/config.env",  # From project root
    os_module.path.join(os_module.path.dirname(__file__), "config.env"),  # Same dir as this file
]

for path in _config_paths:
    if os_module.path.exists(path):
        load_dotenv(path, override=True)
        break
else:
    # Fallback - try loading anyway
    load_dotenv("config.env", override=True)

# API URLs (constants)
AIRNOW_BASE_URL = 'https://www.airnowapi.org/aq'
EGRID_BASE_URL = 'https://data.epa.gov/efservice/tri_facility'
CENSUS_BASE_URL = 'https://api.census.gov/data'
OVERPASS_URL = 'https://overpass-api.de/api/interpreter'


class AirQualityAnalyzer:
    """Handles AirNow API integration for air quality data"""
    
    def __init__(self):
        self.pollutants = ['PM2.5', 'PM10', 'O3', 'NO2', 'SO2', 'CO']
        
    def get_current_aqi(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch current AQI data for location"""
        try:
            api_key = os.getenv('AIRNOW_API_KEY', '').strip()
            if not api_key:
                raise ValueError("AIRNOW_API_KEY not found in environment variables")
            
            url = f"{AIRNOW_BASE_URL}/observation/latLong/current/"
            params = {
                'format': 'application/json',
                'latitude': lat,
                'longitude': lon,
                'distance': 25,
                'API_KEY': api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return self._process_aqi_data(data)
            
        except Exception as e:
            logger.error(f"Error fetching AQI data: {e}")
            return {
                'error': str(e), 
                'overall_aqi': None,
                'pollutants': {},
                'primary_pollutant': None,
                'health_category': None,
                'timestamp': datetime.now().isoformat()
            }
    
    def get_forecast_aqi(self, lat: float, lon: float, date: str) -> Dict[str, Any]:
        """Fetch AQI forecast for specific date"""
        try:
            api_key = os.getenv('AIRNOW_API_KEY', '').strip()
            if not api_key:
                raise ValueError("AIRNOW_API_KEY not found in environment variables")
            
            url = f"{AIRNOW_BASE_URL}/forecast/latLong/"
            params = {
                'format': 'application/json',
                'latitude': lat,
                'longitude': lon,
                'date': date,
                'distance': 25,
                'API_KEY': api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            return response.json()
            
        except Exception as e:
            logger.error(f"Error fetching AQI forecast: {e}")
            return {'error': str(e)}
    
    def _process_aqi_data(self, raw_data: List[Dict]) -> Dict[str, Any]:
        """Process raw AQI data into structured format"""
        result = {
            'timestamp': datetime.now().isoformat(),
            'pollutants': {},
            'overall_aqi': 0,
            'primary_pollutant': None,
            'health_category': None
        }
        
        # Validate input data
        if not raw_data:
            logger.warning("Empty AQI data received from API")
            return result
        
        if not isinstance(raw_data, list):
            logger.error(f"Expected list but got {type(raw_data)}: {raw_data}")
            result['error'] = f"Invalid data format: expected list, got {type(raw_data).__name__}"
            return result
        
        max_aqi = 0
        for item in raw_data:
            if not isinstance(item, dict):
                logger.warning(f"Skipping invalid item in AQI data: {item}")
                continue
                
            pollutant = item.get('ParameterName')
            if not pollutant:
                logger.warning(f"Missing ParameterName in AQI item: {item}")
                continue
                
            aqi = item.get('AQI', 0)
            if not isinstance(aqi, (int, float)):
                logger.warning(f"Invalid AQI value for {pollutant}: {aqi}")
                aqi = 0
            
            result['pollutants'][pollutant] = {
                'aqi': aqi,
                'value': item.get('Value'),
                'unit': item.get('Unit'),
                'category': item.get('Category', {}).get('Name') if isinstance(item.get('Category'), dict) else None
            }
            
            if aqi > max_aqi:
                max_aqi = aqi
                result['overall_aqi'] = aqi
                result['primary_pollutant'] = pollutant
                category = item.get('Category', {})
                if isinstance(category, dict):
                    result['health_category'] = category.get('Name')
                else:
                    result['health_category'] = None
        
        return result


class EmissionsCalculator:
    """Calculate emissions factors using EPA eGRID data"""
    
    def __init__(self):
        self.egrid_regions = self._load_egrid_regions()
        
    def _load_egrid_regions(self) -> Dict[str, Dict]:
        """Load eGRID regional emissions factors"""
        # Simplified eGRID emissions factors (lbs CO2/MWh) by region
        # In production, fetch from EPA API
        return {
            'CAMX': {'co2_rate': 731.29, 'so2_rate': 0.28, 'nox_rate': 0.47},
            'ERCT': {'co2_rate': 883.97, 'so2_rate': 0.55, 'nox_rate': 0.51},
            'FRCC': {'co2_rate': 919.78, 'so2_rate': 0.68, 'nox_rate': 0.62},
            'MROE': {'co2_rate': 1562.44, 'so2_rate': 1.48, 'nox_rate': 1.31},
            'MROW': {'co2_rate': 1554.84, 'so2_rate': 1.25, 'nox_rate': 1.42},
            'NEWE': {'co2_rate': 562.27, 'so2_rate': 0.51, 'nox_rate': 0.48},
            'NWPP': {'co2_rate': 791.53, 'so2_rate': 0.37, 'nox_rate': 0.73},
            'NYUP': {'co2_rate': 449.87, 'so2_rate': 0.29, 'nox_rate': 0.35},
            'RFCE': {'co2_rate': 823.97, 'so2_rate': 0.93, 'nox_rate': 0.72},
            'RFCM': {'co2_rate': 1441.17, 'so2_rate': 1.76, 'nox_rate': 1.18},
            'RFCW': {'co2_rate': 1587.87, 'so2_rate': 2.36, 'nox_rate': 1.35},
            'RMPA': {'co2_rate': 1658.48, 'so2_rate': 0.79, 'nox_rate': 1.27},
            'SPNO': {'co2_rate': 1417.57, 'so2_rate': 1.34, 'nox_rate': 1.07},
            'SPSO': {'co2_rate': 1118.49, 'so2_rate': 1.07, 'nox_rate': 0.73},
            'SRMV': {'co2_rate': 868.97, 'so2_rate': 0.93, 'nox_rate': 0.81},
            'SRMW': {'co2_rate': 1721.44, 'so2_rate': 2.51, 'nox_rate': 1.58},
            'SRSO': {'co2_rate': 1041.16, 'so2_rate': 0.83, 'nox_rate': 0.66},
            'SRTV': {'co2_rate': 1141.73, 'so2_rate': 0.82, 'nox_rate': 0.67},
            'SRVC': {'co2_rate': 1019.29, 'so2_rate': 1.75, 'nox_rate': 0.84}
        }
    
    def get_region_for_location(self, lat: float, lon: float) -> str:
        """Determine eGRID region for given coordinates"""
        # Simplified region mapping - in production, use proper GIS lookup
        if lat > 45:
            if lon < -100:
                return 'NWPP'
            elif lon < -85:
                return 'MROW'
            else:
                return 'NEWE'
        elif lat > 35:
            if lon < -100:
                return 'CAMX'
            elif lon < -85:
                return 'RFCM'
            else:
                return 'RFCE'
        else:
            if lon < -100:
                return 'ERCT'
            elif lon < -85:
                return 'SPSO'
            else:
                return 'FRCC'
    
    def calculate_emissions_impact(self, lat: float, lon: float, 
                                  energy_usage_mwh: float = 1.0) -> Dict[str, float]:
        """Calculate emissions impact for given energy usage"""
        region = self.get_region_for_location(lat, lon)
        factors = self.egrid_regions.get(region, self.egrid_regions['RFCE'])
        
        return {
            'region': region,
            'co2_emissions_lbs': factors['co2_rate'] * energy_usage_mwh,
            'so2_emissions_lbs': factors['so2_rate'] * energy_usage_mwh,
            'nox_emissions_lbs': factors['nox_rate'] * energy_usage_mwh,
            'co2_emissions_metric_tons': (factors['co2_rate'] * energy_usage_mwh) / 2204.62
        }


class DemographicsAnalyzer:
    """Analyze demographic vulnerability using Census API"""
    
    def __init__(self):
        self.vulnerability_indicators = [
            'B01001_001E',  # Total population
            'B19013_001E',  # Median household income
            'B01001_020E',  # Male 65-66 years
            'B01001_021E',  # Male 67-69 years
            'B01001_022E',  # Male 70-74 years
            'B01001_023E',  # Male 75-79 years
            'B01001_024E',  # Male 80-84 years
            'B01001_025E',  # Male 85+ years
            'B01001_044E',  # Female 65-66 years
            'B01001_045E',  # Female 67-69 years
            'B01001_046E',  # Female 70-74 years
            'B01001_047E',  # Female 75-79 years
            'B01001_048E',  # Female 80-84 years
            'B01001_049E',  # Female 85+ years
        ]
    
    def get_tract_demographics(self, state_fips: str, county_fips: str, 
                               tract: str = '*') -> Dict[str, Any]:
        """Fetch demographic data for census tract"""
        try:
            year = 2022  # Most recent ACS 5-year data
            variables = ','.join(self.vulnerability_indicators)
            
            census_api_key = os.getenv('CENSUS_API_KEY', '').strip()
            if not census_api_key:
                raise ValueError("CENSUS_API_KEY not found in environment variables")
            
            url = f"{CENSUS_BASE_URL}/{year}/acs/acs5"
            params = {
                'get': variables,
                'for': f'tract:{tract}',
                'in': f'state:{state_fips} county:{county_fips}',
                'key': census_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return self._calculate_vulnerability_index(data)
            
        except Exception as e:
            logger.error(f"Error fetching census data: {e}")
            return {'error': str(e), 'vulnerability_index': None}
    
    def _calculate_vulnerability_index(self, census_data: List) -> Dict[str, Any]:
        """Calculate environmental vulnerability index from census data"""
        if len(census_data) < 2:
            return {'error': 'Insufficient data'}
        
        headers = census_data[0]
        values = census_data[1] if len(census_data) > 1 else []
        
        try:
            # Create data dict
            data_dict = dict(zip(headers, values))
            
            # Calculate elderly population percentage
            total_pop = float(data_dict.get('B01001_001E', 1))
            elderly_pop = sum([
                float(data_dict.get(f'B01001_{i:03d}E', 0))
                for i in range(20, 26) + list(range(44, 50))
            ])
            elderly_percentage = (elderly_pop / total_pop * 100) if total_pop > 0 else 0
            
            # Get median income
            median_income = float(data_dict.get('B19013_001E', 0))
            
            # Calculate vulnerability score (0-100)
            # Higher elderly % and lower income = higher vulnerability
            elderly_score = min(elderly_percentage * 2, 50)  # Max 50 points
            income_score = max(50 - (median_income / 2000), 0)  # Max 50 points
            
            vulnerability_score = elderly_score + income_score
            
            return {
                'total_population': total_pop,
                'elderly_percentage': elderly_percentage,
                'median_household_income': median_income,
                'vulnerability_score': min(vulnerability_score, 100),
                'vulnerability_category': self._categorize_vulnerability(vulnerability_score)
            }
            
        except Exception as e:
            logger.error(f"Error calculating vulnerability: {e}")
            return {'error': str(e)}
    
    def _categorize_vulnerability(self, score: float) -> str:
        """Categorize vulnerability level"""
        if score >= 75:
            return 'Very High'
        elif score >= 50:
            return 'High'
        elif score >= 25:
            return 'Moderate'
        else:
            return 'Low'


class InfrastructureAnalyzer:
    """Analyze infrastructure using OpenStreetMap/Overpass API"""
    
    def __init__(self):
        pass
    
    def get_nearby_infrastructure(self, lat: float, lon: float, 
                                 radius_m: int = 5000) -> Dict[str, Any]:
        """Query nearby infrastructure elements"""
        try:
            # Overpass QL query for infrastructure
            overpass_query = f"""
            [out:json][timeout:25];
            (
              way["building"](around:{radius_m},{lat},{lon});
              way["highway"](around:{radius_m},{lat},{lon});
              node["amenity"="hospital"](around:{radius_m},{lat},{lon});
              node["amenity"="school"](around:{radius_m},{lat},{lon});
              way["landuse"="industrial"](around:{radius_m},{lat},{lon});
              way["natural"="water"](around:{radius_m},{lat},{lon});
              way["waterway"](around:{radius_m},{lat},{lon});
            );
            out body;
            >;
            out skel qt;
            """
            
            response = requests.post(
                OVERPASS_URL,
                data={'data': overpass_query},
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            return self._analyze_infrastructure(data)
            
        except Exception as e:
            logger.error(f"Error fetching infrastructure data: {e}")
            return {'error': str(e)}
    
    def _analyze_infrastructure(self, osm_data: Dict) -> Dict[str, Any]:
        """Analyze OSM data for environmental factors"""
        elements = osm_data.get('elements', [])
        
        analysis = {
            'total_buildings': 0,
            'roads_count': 0,
            'hospitals_nearby': 0,
            'schools_nearby': 0,
            'industrial_areas': 0,
            'water_bodies': 0,
            'infrastructure_density': 'Low',
            'environmental_concerns': []
        }
        
        for element in elements:
            tags = element.get('tags', {})
            
            if 'building' in tags:
                analysis['total_buildings'] += 1
            if 'highway' in tags:
                analysis['roads_count'] += 1
            if tags.get('amenity') == 'hospital':
                analysis['hospitals_nearby'] += 1
            if tags.get('amenity') == 'school':
                analysis['schools_nearby'] += 1
            if tags.get('landuse') == 'industrial':
                analysis['industrial_areas'] += 1
            if 'natural' in tags and tags['natural'] == 'water':
                analysis['water_bodies'] += 1
            if 'waterway' in tags:
                analysis['water_bodies'] += 1
        
        # Calculate density
        total_infrastructure = (analysis['total_buildings'] + 
                               analysis['roads_count'])
        if total_infrastructure > 500:
            analysis['infrastructure_density'] = 'Very High'
        elif total_infrastructure > 200:
            analysis['infrastructure_density'] = 'High'
        elif total_infrastructure > 50:
            analysis['infrastructure_density'] = 'Moderate'
        
        # Identify environmental concerns
        if analysis['industrial_areas'] > 0:
            analysis['environmental_concerns'].append('Industrial emissions nearby')
        if analysis['roads_count'] > 100:
            analysis['environmental_concerns'].append('High traffic pollution')
        if analysis['water_bodies'] > 0:
            analysis['environmental_concerns'].append('Potential flooding risk')
        
        return analysis


class SatelliteDataAnalyzer:
    """Analyze satellite data for environmental indicators"""
    
    def __init__(self):
        self.sentinel_token = None
        self.token_expiry = None
    
    def get_ndvi_analysis(self, bbox: Tuple[float, float, float, float],
                          date_from: str, date_to: str) -> Dict[str, Any]:
        """Get NDVI (vegetation index) analysis for area"""
        # Simplified NDVI calculation
        # In production, use Sentinel Hub API or NASA Earthdata
        
        return {
            'ndvi_mean': 0.35,  # Placeholder
            'ndvi_interpretation': 'Moderate vegetation',
            'vegetation_health': 'Fair',
            'urban_heat_island_risk': 'Moderate',
            'timestamp': datetime.now().isoformat()
        }
    
    def get_land_surface_temperature(self, lat: float, lon: float) -> Dict[str, float]:
        """Get land surface temperature data"""
        # Simplified LST data
        # In production, use MODIS or Landsat data
        
        return {
            'lst_day_celsius': 28.5,  # Placeholder
            'lst_night_celsius': 18.2,  # Placeholder
            'thermal_anomaly': 1.2,  # Degrees above average
            'heat_island_intensity': 'Moderate'
        }


class EnvironmentalInsightsEngine:
    """Main engine to coordinate all environmental data sources"""
    
    def __init__(self):
        self.air_quality = AirQualityAnalyzer()
        self.emissions = EmissionsCalculator()
        self.demographics = DemographicsAnalyzer()
        self.infrastructure = InfrastructureAnalyzer()
        self.satellite = SatelliteDataAnalyzer()
        
        # Import the impact radius analyzer
        try:
            from impact_radius import ConsolidatedAnalyzer
            self.consolidated_analyzer = ConsolidatedAnalyzer()
        except ImportError:
            self.consolidated_analyzer = None
            logger.warning("Impact radius analyzer not available")
    
    def enhance_forecast_with_insights(self, 
                                      forecast_data: Dict[str, Any],
                                      location: Dict[str, float],
                                      options: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Enhance existing forecast with environmental insights
        
        Args:
            forecast_data: Original forecast from LLM
            location: Dict with 'lat' and 'lon' keys
            options: Optional configuration for which insights to include
        
        Returns:
            Enhanced forecast with environmental insights added
        """
        options = options or {
            'include_air_quality': True,
            'include_emissions': True,
            'include_demographics': True,
            'include_infrastructure': True,
            'include_satellite': False,  # More expensive, off by default
            'include_consolidated_analysis': True  # New feature
        }
        
        lat = location['lat']
        lon = location['lon']
        
        # Create enhanced forecast preserving original
        enhanced_forecast = forecast_data.copy()
        enhanced_forecast['environmental_insights'] = {}
        
        # Collect insights in parallel for performance
        insights = {}
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {}
            
            if options.get('include_air_quality'):
                futures['air_quality'] = executor.submit(
                    self.air_quality.get_current_aqi, lat, lon
                )
            
            if options.get('include_emissions'):
                futures['emissions'] = executor.submit(
                    self.emissions.calculate_emissions_impact, lat, lon
                )
            
            if options.get('include_infrastructure'):
                futures['infrastructure'] = executor.submit(
                    self.infrastructure.get_nearby_infrastructure, lat, lon
                )
            
            # Gather results
            for key, future in futures.items():
                try:
                    insights[key] = future.result(timeout=30)
                except Exception as e:
                    logger.error(f"Error getting {key} insights: {e}")
                    insights[key] = {'error': str(e)}
        
        # Add insights to forecast
        enhanced_forecast['environmental_insights'] = insights
        
        # Add consolidated analysis (impact radius + QoL)
        if options.get('include_consolidated_analysis') and self.consolidated_analyzer:
            try:
                consolidated = self.consolidated_analyzer.analyze_location(
                    insights=insights,
                    location=location,
                    weather_data=forecast_data  # Pass weather data if available
                )
                
                # Add key metrics directly to top level for easy access
                enhanced_forecast['impact_radius_km'] = consolidated['impact_radius_analysis']['maximum_impact_radius_km']
                enhanced_forecast['safe_zone_radius_km'] = consolidated['impact_radius_analysis']['safe_zone_radius_km']
                enhanced_forecast['quality_of_life_score'] = consolidated['quality_of_life_analysis']['overall_score']
                enhanced_forecast['qol_category'] = consolidated['quality_of_life_analysis']['category']
                
                # Add full analysis
                enhanced_forecast['consolidated_analysis'] = consolidated
                
            except Exception as e:
                logger.error(f"Error in consolidated analysis: {e}")
                enhanced_forecast['consolidated_analysis'] = {'error': str(e)}
        
        # Generate summary recommendations (updated to include new metrics)
        enhanced_forecast['environmental_recommendations'] = \
            self._generate_recommendations(insights, forecast_data, 
                                          enhanced_forecast.get('consolidated_analysis'))
        
        # Calculate overall environmental risk score (now includes radius data)
        enhanced_forecast['environmental_risk_score'] = \
            self._calculate_risk_score(insights, 
                                      enhanced_forecast.get('consolidated_analysis'))
        
        return enhanced_forecast
    
    def _generate_recommendations(self, insights: Dict, 
                                 original_forecast: Dict,
                                 consolidated: Optional[Dict] = None) -> List[str]:
        """Generate actionable recommendations based on insights"""
        recommendations = []
        
        # Add radius-based recommendations if available
        if consolidated and 'impact_radius_analysis' in consolidated:
            radius_data = consolidated['impact_radius_analysis']
            max_radius = radius_data.get('maximum_impact_radius_km', 0)
            safe_radius = radius_data.get('safe_zone_radius_km', 0)
            
            if max_radius > 10:
                recommendations.append(
                    f"⚠️ Environmental impacts extend {max_radius:.1f}km. "
                    f"Consider activities beyond {safe_radius:.1f}km for sensitive populations."
                )
        
        # Add QoL-based recommendations if available
        if consolidated and 'quality_of_life_analysis' in consolidated:
            qol_data = consolidated['quality_of_life_analysis']
            qol_score = qol_data.get('overall_score', 0)
            
            if qol_score < 60:
                recommendations.append(
                    f"Quality of Life Index: {qol_score:.0f}/100 ({qol_data.get('category', 'Fair')}). "
                    "Consider environmental improvements for better living conditions."
                )
            
            # Add specific QoL recommendations
            qol_recs = qol_data.get('recommendations', [])
            recommendations.extend(qol_recs[:2])  # Add top 2 QoL recommendations
        
        # Air quality recommendations
        if 'air_quality' in insights:
            aqi = insights['air_quality'].get('overall_aqi', 0)
            # Handle None values from errors
            if aqi is None:
                aqi = 0
            if isinstance(aqi, (int, float)) and aqi > 100:
                recommendations.append(
                    f"Air quality is {insights['air_quality'].get('health_category', 'unhealthy')}. "
                    "Consider indoor activities and air filtration."
                )
            if isinstance(aqi, (int, float)) and aqi > 150:
                recommendations.append(
                    "Sensitive groups should avoid outdoor exposure. "
                    "Check local health advisories."
                )
        
        # Infrastructure recommendations
        if 'infrastructure' in insights:
            infra = insights['infrastructure']
            if infra.get('infrastructure_density') in ['High', 'Very High']:
                recommendations.append(
                    "High urban density detected. Account for heat island effects "
                    "and increased pollution exposure."
                )
            if 'Industrial emissions nearby' in infra.get('environmental_concerns', []):
                recommendations.append(
                    "Industrial areas nearby may impact local air quality. "
                    "Monitor wind direction for pollution dispersal."
                )
        
        # Weather-specific recommendations (if in original forecast)
        if 'temperature' in original_forecast:
            temp = original_forecast['temperature']
            if isinstance(temp, (int, float)) and temp > 32:  # Hot weather
                aqi_check = insights.get('air_quality', {}).get('overall_aqi', 0)
                if aqi_check is not None and isinstance(aqi_check, (int, float)) and aqi_check > 50:
                    recommendations.append(
                        "High temperature combined with moderate air pollution. "
                        "Ozone formation likely - limit afternoon outdoor activities."
                    )
        
        # Limit recommendations to avoid overwhelming
        return recommendations[:5]
    
    def _calculate_risk_score(self, insights: Dict,
                             consolidated: Optional[Dict] = None) -> Dict[str, Any]:
        """Calculate comprehensive environmental risk score"""
        risk_factors = []
        total_score = 0
        max_score = 0
        
        # Air quality risk (0-30 points)
        if 'air_quality' in insights:
            aqi = insights['air_quality'].get('overall_aqi', 0)
            # Handle None values from errors
            if aqi is None or not isinstance(aqi, (int, float)):
                aqi = 0
            aqi_score = min(aqi / 5, 30)  # Scale AQI to max 30 points
            total_score += aqi_score
            max_score += 30
            risk_factors.append({
                'factor': 'Air Quality',
                'score': aqi_score,
                'weight': 30
            })
        
        # Infrastructure risk (0-20 points)
        if 'infrastructure' in insights:
            infra = insights['infrastructure']
            density_scores = {
                'Very High': 20, 'High': 15, 
                'Moderate': 10, 'Low': 0
            }
            infra_score = density_scores.get(
                infra.get('infrastructure_density', 'Low'), 0
            )
            total_score += infra_score
            max_score += 20
            risk_factors.append({
                'factor': 'Infrastructure Density',
                'score': infra_score,
                'weight': 20
            })
        
        # Emissions risk (0-20 points)
        if 'emissions' in insights:
            emissions = insights['emissions']
            co2_tons = emissions.get('co2_emissions_metric_tons', 0)
            emissions_score = min(co2_tons * 10, 20)
            total_score += emissions_score
            max_score += 20
            risk_factors.append({
                'factor': 'Emissions Impact',
                'score': emissions_score,
                'weight': 20
            })
        
        # Impact radius risk (0-30 points) - NEW
        if consolidated and 'impact_radius_analysis' in consolidated:
            max_radius = consolidated['impact_radius_analysis'].get('maximum_impact_radius_km', 0)
            radius_score = min(max_radius * 1.5, 30)  # 20km = max score
            total_score += radius_score
            max_score += 30
            risk_factors.append({
                'factor': 'Impact Radius',
                'score': radius_score,
                'weight': 30
            })
        
        # Calculate normalized score
        normalized_score = (total_score / max_score * 100) if max_score > 0 else 0
        
        # Add QoL inverse correlation
        qol_adjustment = 0
        if consolidated and 'quality_of_life_analysis' in consolidated:
            qol_score = consolidated['quality_of_life_analysis'].get('overall_score', 50)
            # Lower QoL = higher risk
            qol_adjustment = (100 - qol_score) / 2  # Max 50 point adjustment
        
        # Final risk score with QoL adjustment
        final_score = min(100, (normalized_score + qol_adjustment) / 1.5)
        
        return {
            'overall_score': round(final_score, 1),
            'risk_level': self._categorize_risk(final_score),
            'contributing_factors': risk_factors,
            'qol_adjustment': round(qol_adjustment, 1),
            'calculation_timestamp': datetime.now().isoformat()
        }
    
    def _categorize_risk(self, score: float) -> str:
        """Categorize risk level based on score"""
        if score >= 75:
            return 'Severe'
        elif score >= 50:
            return 'High'
        elif score >= 25:
            return 'Moderate'
        else:
            return 'Low'
    
    def generate_insights_summary(self, enhanced_forecast: Dict) -> str:
        """Generate human-readable summary of environmental insights"""
        insights = enhanced_forecast.get('environmental_insights', {})
        risk_score = enhanced_forecast.get('environmental_risk_score', {})
        recommendations = enhanced_forecast.get('environmental_recommendations', [])
        
        summary = []
        summary.append(f"Environmental Risk Level: {risk_score.get('risk_level', 'Unknown')}")
        summary.append(f"Overall Risk Score: {risk_score.get('overall_score', 0)}/100\n")
        
        # Air quality summary
        if 'air_quality' in insights:
            aq = insights['air_quality']
            summary.append(f"Air Quality Index: {aq.get('overall_aqi', 'N/A')}")
            summary.append(f"Primary Pollutant: {aq.get('primary_pollutant', 'N/A')}")
            summary.append(f"Health Category: {aq.get('health_category', 'N/A')}\n")
        
        # Infrastructure summary
        if 'infrastructure' in insights:
            infra = insights['infrastructure']
            summary.append(f"Infrastructure Density: {infra.get('infrastructure_density', 'N/A')}")
            if infra.get('environmental_concerns'):
                summary.append("Environmental Concerns:")
                for concern in infra['environmental_concerns']:
                    summary.append(f"  - {concern}")
            summary.append("")
        
        # Recommendations
        if recommendations:
            summary.append("Key Recommendations:")
            for i, rec in enumerate(recommendations, 1):
                summary.append(f"{i}. {rec}")
        
        return "\n".join(summary)


# Example usage and testing
if __name__ == "__main__":
    # Example forecast from your existing LLM
    sample_forecast = {
        "location": "New York, NY",
        "date": "2024-01-15",
        "temperature": 35,
        "conditions": "Partly cloudy",
        "precipitation": 0.1,
        "wind_speed": 12,
        "forecast_text": "Partly cloudy with temperatures in the mid-30s..."
    }
    
    # Location for environmental analysis
    location = {
        "lat": 40.7128,
        "lon": -74.0060
    }
    
    # Initialize the engine
    engine = EnvironmentalInsightsEngine()
    
    # Enhance forecast with environmental insights
    enhanced = engine.enhance_forecast_with_insights(
        sample_forecast, 
        location,
        options={
            'include_air_quality': True,
            'include_emissions': True,
            'include_infrastructure': True,
            'include_demographics': False,  # Requires census API key
            'include_satellite': False  # Requires sentinel hub credentials
        }
    )
    
    # Print summary
    print(engine.generate_insights_summary(enhanced))
    
    # The enhanced forecast now contains all original data plus environmental insights
    print("\nEnhanced forecast structure:")
    print(json.dumps(list(enhanced.keys()), indent=2))