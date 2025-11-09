"""
Impact Radius and Quality of Life Analysis Module
Calculates environmental impact zones and QoL indices
"""

import numpy as np
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from math import radians, cos, sin, asin, sqrt, exp
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class ImpactZone:
    """Represents an environmental impact zone"""
    pollutant_type: str
    source_lat: float
    source_lon: float
    impact_radius_km: float
    severity: str  # 'severe', 'high', 'moderate', 'low'
    concentration_at_source: float
    decay_rate: float  # How quickly impact decreases with distance
    
    def get_impact_at_distance(self, distance_km: float) -> float:
        """Calculate impact level at given distance using exponential decay"""
        if distance_km >= self.impact_radius_km:
            return 0.0
        # Exponential decay model
        return self.concentration_at_source * exp(-self.decay_rate * distance_km)


class ImpactRadiusCalculator:
    """Calculate environmental impact radius for various concerns"""
    
    # Impact radius models based on research data
    IMPACT_MODELS = {
        'PM2.5': {
            'base_radius_km': {'low': 2, 'moderate': 5, 'high': 10, 'severe': 20},
            'decay_rate': 0.15,  # Faster decay due to particle settling
            'wind_multiplier': 1.5  # Wind can extend impact
        },
        'PM10': {
            'base_radius_km': {'low': 1.5, 'moderate': 3, 'high': 6, 'severe': 12},
            'decay_rate': 0.2,  # Heavier particles, faster settling
            'wind_multiplier': 1.3
        },
        'O3': {
            'base_radius_km': {'low': 5, 'moderate': 15, 'high': 30, 'severe': 50},
            'decay_rate': 0.08,  # Ozone travels far
            'wind_multiplier': 2.0
        },
        'NO2': {
            'base_radius_km': {'low': 2, 'moderate': 5, 'high': 8, 'severe': 15},
            'decay_rate': 0.18,
            'wind_multiplier': 1.4
        },
        'SO2': {
            'base_radius_km': {'low': 3, 'moderate': 7, 'high': 12, 'severe': 25},
            'decay_rate': 0.12,
            'wind_multiplier': 1.6
        },
        'CO': {
            'base_radius_km': {'low': 1, 'moderate': 3, 'high': 5, 'severe': 8},
            'decay_rate': 0.25,
            'wind_multiplier': 1.2
        },
        'industrial_emissions': {
            'base_radius_km': {'low': 5, 'moderate': 10, 'high': 20, 'severe': 40},
            'decay_rate': 0.1,
            'wind_multiplier': 1.8
        },
        'traffic_pollution': {
            'base_radius_km': {'low': 0.5, 'moderate': 1, 'high': 2, 'severe': 4},
            'decay_rate': 0.35,
            'wind_multiplier': 1.2
        },
        'heat_island': {
            'base_radius_km': {'low': 2, 'moderate': 5, 'high': 10, 'severe': 15},
            'decay_rate': 0.2,
            'wind_multiplier': 1.0  # Heat doesn't travel with wind as much
        },
        'water_pollution': {
            'base_radius_km': {'low': 1, 'moderate': 3, 'high': 8, 'severe': 20},
            'decay_rate': 0.15,
            'wind_multiplier': 0.5  # Water pollution follows water flow, not wind
        }
    }
    
    def __init__(self):
        self.zones = []
    
    def calculate_impact_radius(self, 
                               insights: Dict[str, Any],
                               wind_speed_mps: float = 5.0,
                               wind_direction: float = 0.0) -> Dict[str, Any]:
        """
        Calculate the radius of environmental impacts
        
        Args:
            insights: Environmental insights from the main engine
            wind_speed_mps: Wind speed in meters per second
            wind_direction: Wind direction in degrees (0=N, 90=E, etc)
        
        Returns:
            Dict containing impact zones and maximum radius
        """
        impact_zones = []
        
        # Analyze air quality impacts
        if 'air_quality' in insights:
            aq_zones = self._calculate_air_quality_radius(
                insights['air_quality'], 
                wind_speed_mps
            )
            impact_zones.extend(aq_zones)
        
        # Analyze infrastructure impacts
        if 'infrastructure' in insights:
            infra_zones = self._calculate_infrastructure_radius(
                insights['infrastructure'],
                wind_speed_mps
            )
            impact_zones.extend(infra_zones)
        
        # Analyze emissions impacts
        if 'emissions' in insights:
            emissions_zones = self._calculate_emissions_radius(
                insights['emissions'],
                wind_speed_mps
            )
            impact_zones.extend(emissions_zones)
        
        # Calculate maximum impact radius
        max_radius_km = max([z.impact_radius_km for z in impact_zones], default=0)
        
        # Calculate safe zone (where all impacts are below threshold)
        safe_radius_km = self._calculate_safe_zone_radius(impact_zones)
        
        # Create impact gradient map
        gradient_map = self._create_impact_gradient(impact_zones, max_radius_km)
        
        return {
            'impact_zones': [self._zone_to_dict(z) for z in impact_zones],
            'maximum_impact_radius_km': round(max_radius_km, 2),
            'safe_zone_radius_km': round(safe_radius_km, 2),
            'wind_adjusted': wind_speed_mps > 3.0,
            'wind_direction_degrees': wind_direction,
            'impact_gradient': gradient_map,
            'affected_area_km2': round(3.14159 * max_radius_km ** 2, 2),
            'recommendation': self._generate_radius_recommendation(max_radius_km, safe_radius_km)
        }
    
    def _calculate_air_quality_radius(self, 
                                     air_quality: Dict,
                                     wind_speed: float) -> List[ImpactZone]:
        """Calculate impact radius for air quality pollutants"""
        zones = []
        
        pollutants = air_quality.get('pollutants', {})
        overall_aqi = air_quality.get('overall_aqi', 0)
        
        # Handle None values from errors
        if overall_aqi is None or not isinstance(overall_aqi, (int, float)):
            overall_aqi = 0
        
        # Determine severity based on AQI
        if overall_aqi > 200:
            severity = 'severe'
        elif overall_aqi > 150:
            severity = 'high'
        elif overall_aqi > 100:
            severity = 'moderate'
        else:
            severity = 'low'
        
        # Calculate radius for each pollutant
        for pollutant, data in pollutants.items():
            if pollutant in self.IMPACT_MODELS:
                model = self.IMPACT_MODELS[pollutant]
                base_radius = model['base_radius_km'][severity]
                
                # Adjust for wind
                wind_factor = 1 + (wind_speed / 10) * (model['wind_multiplier'] - 1)
                adjusted_radius = base_radius * wind_factor
                
                zone = ImpactZone(
                    pollutant_type=pollutant,
                    source_lat=0,  # Will be updated with actual location
                    source_lon=0,
                    impact_radius_km=adjusted_radius,
                    severity=severity,
                    concentration_at_source=data.get('aqi', 0),
                    decay_rate=model['decay_rate']
                )
                zones.append(zone)
        
        return zones
    
    def _calculate_infrastructure_radius(self,
                                        infrastructure: Dict,
                                        wind_speed: float) -> List[ImpactZone]:
        """Calculate impact radius for infrastructure concerns"""
        zones = []
        concerns = infrastructure.get('environmental_concerns', [])
        density = infrastructure.get('infrastructure_density', 'Low')
        
        # Map density to severity
        severity_map = {
            'Very High': 'severe',
            'High': 'high',
            'Moderate': 'moderate',
            'Low': 'low'
        }
        severity = severity_map.get(density, 'low')
        
        # Industrial emissions impact
        if 'Industrial emissions nearby' in concerns:
            model = self.IMPACT_MODELS['industrial_emissions']
            base_radius = model['base_radius_km'][severity]
            wind_factor = 1 + (wind_speed / 10) * (model['wind_multiplier'] - 1)
            
            zones.append(ImpactZone(
                pollutant_type='industrial_emissions',
                source_lat=0,
                source_lon=0,
                impact_radius_km=base_radius * wind_factor,
                severity=severity,
                concentration_at_source=100,  # Normalized value
                decay_rate=model['decay_rate']
            ))
        
        # Traffic pollution impact
        if 'High traffic pollution' in concerns:
            model = self.IMPACT_MODELS['traffic_pollution']
            base_radius = model['base_radius_km'][severity]
            wind_factor = 1 + (wind_speed / 10) * (model['wind_multiplier'] - 1)
            
            zones.append(ImpactZone(
                pollutant_type='traffic_pollution',
                source_lat=0,
                source_lon=0,
                impact_radius_km=base_radius * wind_factor,
                severity=severity,
                concentration_at_source=80,
                decay_rate=model['decay_rate']
            ))
        
        # Heat island effect
        if density in ['High', 'Very High']:
            model = self.IMPACT_MODELS['heat_island']
            base_radius = model['base_radius_km'][severity]
            # Heat island less affected by wind
            
            zones.append(ImpactZone(
                pollutant_type='heat_island',
                source_lat=0,
                source_lon=0,
                impact_radius_km=base_radius,
                severity=severity,
                concentration_at_source=60,
                decay_rate=model['decay_rate']
            ))
        
        return zones
    
    def _calculate_emissions_radius(self,
                                   emissions: Dict,
                                   wind_speed: float) -> List[ImpactZone]:
        """Calculate impact radius for emissions"""
        zones = []
        
        co2_tons = emissions.get('co2_emissions_metric_tons', 0)
        
        # Determine severity based on emissions
        if co2_tons > 2.0:
            severity = 'severe'
        elif co2_tons > 1.0:
            severity = 'high'
        elif co2_tons > 0.5:
            severity = 'moderate'
        else:
            severity = 'low'
        
        # CO2 doesn't have local health impacts but contributes to heat
        # Using industrial emissions as proxy for local impact
        if co2_tons > 0.1:
            model = self.IMPACT_MODELS['industrial_emissions']
            base_radius = model['base_radius_km'][severity] * 0.5  # CO2 is less locally impactful
            wind_factor = 1 + (wind_speed / 10) * (model['wind_multiplier'] - 1)
            
            zones.append(ImpactZone(
                pollutant_type='greenhouse_gases',
                source_lat=0,
                source_lon=0,
                impact_radius_km=base_radius * wind_factor,
                severity=severity,
                concentration_at_source=co2_tons * 50,  # Normalized
                decay_rate=0.05  # Very slow decay for GHGs
            ))
        
        return zones
    
    def _calculate_safe_zone_radius(self, zones: List[ImpactZone]) -> float:
        """Calculate radius where all impacts drop below safe thresholds"""
        if not zones:
            return 0.0
        
        # Safe threshold is where impact drops below 25% of source
        safe_threshold = 0.25
        safe_distances = []
        
        for zone in zones:
            # Solve for distance where impact = threshold * source concentration
            # impact = source * exp(-decay * distance)
            # threshold * source = source * exp(-decay * distance)
            # ln(threshold) = -decay * distance
            # distance = -ln(threshold) / decay
            
            if zone.decay_rate > 0:
                safe_distance = -np.log(safe_threshold) / zone.decay_rate
                safe_distance = min(safe_distance, zone.impact_radius_km)
                safe_distances.append(safe_distance)
        
        return max(safe_distances) if safe_distances else 0.0
    
    def _create_impact_gradient(self, 
                               zones: List[ImpactZone],
                               max_radius: float) -> List[Dict]:
        """Create a gradient map of impact levels at different distances"""
        if max_radius == 0:
            return []
        
        # Sample at different distances
        distances = [0, 0.5, 1, 2, 5, 10, 20, 30, 50]
        distances = [d for d in distances if d <= max_radius]
        
        gradient = []
        for distance_km in distances:
            total_impact = 0
            impact_components = {}
            
            for zone in zones:
                impact = zone.get_impact_at_distance(distance_km)
                total_impact += impact
                impact_components[zone.pollutant_type] = round(impact, 2)
            
            gradient.append({
                'distance_km': distance_km,
                'total_impact': round(total_impact, 2),
                'impact_level': self._categorize_impact(total_impact),
                'components': impact_components
            })
        
        return gradient
    
    def _categorize_impact(self, impact_value: float) -> str:
        """Categorize impact level"""
        if impact_value > 200:
            return 'severe'
        elif impact_value > 100:
            return 'high'
        elif impact_value > 50:
            return 'moderate'
        elif impact_value > 25:
            return 'low'
        else:
            return 'minimal'
    
    def _zone_to_dict(self, zone: ImpactZone) -> Dict:
        """Convert ImpactZone to dictionary"""
        return {
            'type': zone.pollutant_type,
            'radius_km': round(zone.impact_radius_km, 2),
            'severity': zone.severity,
            'source_concentration': round(zone.concentration_at_source, 2),
            'decay_rate': zone.decay_rate
        }
    
    def _generate_radius_recommendation(self, max_radius: float, safe_radius: float) -> str:
        """Generate recommendation based on impact radius"""
        if max_radius > 30:
            return (f"Severe environmental impacts detected up to {max_radius:.1f}km. "
                   f"Consider relocating sensitive activities beyond {safe_radius:.1f}km radius.")
        elif max_radius > 15:
            return (f"Significant environmental impacts within {max_radius:.1f}km. "
                   f"Safe zone begins at {safe_radius:.1f}km from center.")
        elif max_radius > 5:
            return (f"Moderate environmental impacts within {max_radius:.1f}km radius. "
                   f"Most impacts dissipate beyond {safe_radius:.1f}km.")
        else:
            return (f"Localized environmental impacts within {max_radius:.1f}km. "
                   "Effects are primarily concentrated near the source.")


class QualityOfLifeCalculator:
    """Calculate Quality of Life Index based on environmental factors"""
    
    # Weights for different factors (must sum to 1.0)
    QOL_WEIGHTS = {
        'air_quality': 0.25,
        'water_quality': 0.15,
        'noise_pollution': 0.10,
        'green_space': 0.15,
        'infrastructure': 0.10,
        'climate_comfort': 0.10,
        'health_access': 0.05,
        'safety': 0.10
    }
    
    def calculate_qol_index(self,
                           insights: Dict[str, Any],
                           impact_radius_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate comprehensive Quality of Life Index (0-100)
        
        Args:
            insights: Environmental insights from main engine
            impact_radius_data: Impact radius calculations
        
        Returns:
            Dict with QoL index and component scores
        """
        
        components = {}
        
        # Air Quality Score (0-100, inverted from AQI)
        if 'air_quality' in insights:
            aqi = insights['air_quality'].get('overall_aqi', 50)
            # Handle None values from errors
            if aqi is None or not isinstance(aqi, (int, float)):
                aqi = 50  # Default to moderate
            # Invert AQI: 0-50 (good) = 100-80, 51-100 (moderate) = 79-60, etc.
            air_score = max(0, 100 - (aqi * 0.5))
            components['air_quality'] = {
                'score': round(air_score, 1),
                'weight': self.QOL_WEIGHTS['air_quality'],
                'weighted_score': air_score * self.QOL_WEIGHTS['air_quality'],
                'factors': {
                    'aqi': aqi,
                    'category': insights['air_quality'].get('health_category', 'Unknown')
                }
            }
        else:
            components['air_quality'] = self._default_component('air_quality')
        
        # Water Quality Score
        if 'water_quality' in insights:
            water_data = insights['water_quality']
            # Simple scoring based on stations and concerns
            stations = water_data.get('stations_found', 0)
            concerns = len(water_data.get('water_quality_concerns', []))
            water_score = max(0, 100 - (concerns * 20) - (max(0, 5 - stations) * 10))
            components['water_quality'] = {
                'score': round(water_score, 1),
                'weight': self.QOL_WEIGHTS['water_quality'],
                'weighted_score': water_score * self.QOL_WEIGHTS['water_quality'],
                'factors': {
                    'monitoring_stations': stations,
                    'concerns': concerns
                }
            }
        else:
            components['water_quality'] = self._default_component('water_quality', 70)
        
        # Infrastructure/Urban Comfort Score
        if 'infrastructure' in insights:
            infra = insights['infrastructure']
            density_scores = {
                'Very High': 40,  # Too dense
                'High': 70,       # Good access but crowded
                'Moderate': 90,   # Optimal
                'Low': 60         # Limited access
            }
            density = infra.get('infrastructure_density', 'Moderate')
            base_score = density_scores.get(density, 50)
            
            # Adjust for specific infrastructure
            hospitals = infra.get('hospitals_nearby', 0)
            schools = infra.get('schools_nearby', 0)
            industrial = infra.get('industrial_areas', 0)
            
            infra_score = base_score
            infra_score += min(hospitals * 5, 10)  # Bonus for hospitals
            infra_score += min(schools * 3, 9)     # Bonus for schools
            infra_score -= industrial * 10         # Penalty for industrial
            infra_score = max(0, min(100, infra_score))
            
            components['infrastructure'] = {
                'score': round(infra_score, 1),
                'weight': self.QOL_WEIGHTS['infrastructure'],
                'weighted_score': infra_score * self.QOL_WEIGHTS['infrastructure'],
                'factors': {
                    'density': density,
                    'hospitals': hospitals,
                    'schools': schools,
                    'industrial_areas': industrial
                }
            }
        else:
            components['infrastructure'] = self._default_component('infrastructure')
        
        # Green Space Score (from NDVI if available)
        if 'satellite' in insights:
            ndvi = insights['satellite'].get('ndvi_mean', 0.35)
            # NDVI: -1 to 1, where >0.3 is good vegetation
            green_score = max(0, min(100, ndvi * 200))
            components['green_space'] = {
                'score': round(green_score, 1),
                'weight': self.QOL_WEIGHTS['green_space'],
                'weighted_score': green_score * self.QOL_WEIGHTS['green_space'],
                'factors': {
                    'ndvi': ndvi,
                    'vegetation_health': insights['satellite'].get('vegetation_health', 'Unknown')
                }
            }
        else:
            # Estimate from infrastructure
            if 'infrastructure' in insights:
                buildings = insights['infrastructure'].get('total_buildings', 100)
                water_bodies = insights['infrastructure'].get('water_bodies', 0)
                # Less buildings and more water = more green
                green_score = max(0, 70 - (buildings / 10) + (water_bodies * 10))
                green_score = min(100, green_score)
            else:
                green_score = 50
            
            components['green_space'] = {
                'score': round(green_score, 1),
                'weight': self.QOL_WEIGHTS['green_space'],
                'weighted_score': green_score * self.QOL_WEIGHTS['green_space'],
                'factors': {'estimated': True}
            }
        
        # Noise Pollution Score (estimated from infrastructure)
        if 'infrastructure' in insights:
            roads = insights['infrastructure'].get('roads_count', 0)
            industrial = insights['infrastructure'].get('industrial_areas', 0)
            # More roads and industrial = more noise
            noise_impact = min(100, roads / 2 + industrial * 20)
            noise_score = max(0, 100 - noise_impact)
        else:
            noise_score = 70
        
        components['noise_pollution'] = {
            'score': round(noise_score, 1),
            'weight': self.QOL_WEIGHTS['noise_pollution'],
            'weighted_score': noise_score * self.QOL_WEIGHTS['noise_pollution'],
            'factors': {'estimated': True}
        }
        
        # Climate Comfort Score (from temperature if available)
        climate_score = 75  # Default moderate score
        if 'satellite' in insights:
            lst_day = insights['satellite'].get('lst_day_celsius', 25)
            # Optimal temperature range: 18-25°C
            if 18 <= lst_day <= 25:
                climate_score = 100
            elif 15 <= lst_day <= 30:
                climate_score = 80
            elif 10 <= lst_day <= 35:
                climate_score = 60
            else:
                climate_score = 40
        
        components['climate_comfort'] = {
            'score': round(climate_score, 1),
            'weight': self.QOL_WEIGHTS['climate_comfort'],
            'weighted_score': climate_score * self.QOL_WEIGHTS['climate_comfort'],
            'factors': {'temperature_based': True}
        }
        
        # Health Access Score
        if 'infrastructure' in insights:
            hospitals = insights['infrastructure'].get('hospitals_nearby', 0)
            health_score = min(100, 60 + hospitals * 20)
        else:
            health_score = 60
        
        components['health_access'] = {
            'score': round(health_score, 1),
            'weight': self.QOL_WEIGHTS['health_access'],
            'weighted_score': health_score * self.QOL_WEIGHTS['health_access'],
            'factors': {'estimated': True}
        }
        
        # Safety Score (based on environmental risks)
        max_radius = impact_radius_data.get('maximum_impact_radius_km', 0)
        if max_radius > 20:
            safety_score = 30
        elif max_radius > 10:
            safety_score = 50
        elif max_radius > 5:
            safety_score = 70
        else:
            safety_score = 90
        
        components['safety'] = {
            'score': round(safety_score, 1),
            'weight': self.QOL_WEIGHTS['safety'],
            'weighted_score': safety_score * self.QOL_WEIGHTS['safety'],
            'factors': {
                'impact_radius_km': max_radius,
                'environmental_based': True
            }
        }
        
        # Calculate overall QoL index
        total_weighted_score = sum(c['weighted_score'] for c in components.values())
        overall_qol = round(total_weighted_score, 1)
        
        # Determine QoL category
        if overall_qol >= 80:
            category = 'Excellent'
            description = 'Outstanding quality of life with minimal environmental concerns'
        elif overall_qol >= 70:
            category = 'Good'
            description = 'Good quality of life with minor environmental issues'
        elif overall_qol >= 60:
            category = 'Moderate'
            description = 'Acceptable quality of life with some environmental challenges'
        elif overall_qol >= 50:
            category = 'Fair'
            description = 'Below average quality of life with notable environmental concerns'
        else:
            category = 'Poor'
            description = 'Significant environmental challenges affecting quality of life'
        
        # Identify top concerns and strengths
        sorted_components = sorted(components.items(), key=lambda x: x[1]['score'])
        top_concerns = [name for name, data in sorted_components[:3] if data['score'] < 60]
        top_strengths = [name for name, data in sorted_components[-3:] if data['score'] >= 70]
        
        return {
            'overall_score': overall_qol,
            'category': category,
            'description': description,
            'components': components,
            'top_concerns': top_concerns,
            'top_strengths': top_strengths,
            'recommendations': self._generate_qol_recommendations(components, overall_qol),
            'comparison': self._get_qol_comparison(overall_qol),
            'trend_prediction': self._predict_qol_trend(components, insights)
        }
    
    def _default_component(self, name: str, default_score: float = 50) -> Dict:
        """Create default component when data is unavailable"""
        return {
            'score': default_score,
            'weight': self.QOL_WEIGHTS.get(name, 0.1),
            'weighted_score': default_score * self.QOL_WEIGHTS.get(name, 0.1),
            'factors': {'no_data': True}
        }
    
    def _generate_qol_recommendations(self, 
                                     components: Dict,
                                     overall_score: float) -> List[str]:
        """Generate recommendations to improve QoL"""
        recommendations = []
        
        # Check each component for improvement opportunities
        for name, data in components.items():
            if data['score'] < 50:
                if name == 'air_quality':
                    recommendations.append(
                        "Install air purification systems and limit outdoor activities during high pollution days"
                    )
                elif name == 'water_quality':
                    recommendations.append(
                        "Consider water filtration systems and monitor local water quality reports"
                    )
                elif name == 'noise_pollution':
                    recommendations.append(
                        "Implement noise reduction measures like soundproofing and green barriers"
                    )
                elif name == 'green_space':
                    recommendations.append(
                        "Increase green infrastructure through rooftop gardens and tree planting"
                    )
                elif name == 'infrastructure':
                    recommendations.append(
                        "Advocate for improved urban planning and sustainable development"
                    )
        
        # Overall recommendations based on score
        if overall_score < 60:
            recommendations.append(
                "Consider environmental remediation programs and community health initiatives"
            )
        
        return recommendations[:3]  # Limit to top 3 recommendations
    
    def _get_qol_comparison(self, score: float) -> Dict[str, str]:
        """Compare QoL score to reference cities"""
        # Reference scores for context
        references = [
            {'city': 'Copenhagen', 'score': 95, 'category': 'World-leading'},
            {'city': 'Vancouver', 'score': 90, 'category': 'Excellent'},
            {'city': 'Tokyo', 'score': 85, 'category': 'Very Good'},
            {'city': 'New York', 'score': 75, 'category': 'Good'},
            {'city': 'Los Angeles', 'score': 70, 'category': 'Good'},
            {'city': 'Mexico City', 'score': 55, 'category': 'Fair'},
            {'city': 'Delhi', 'score': 45, 'category': 'Poor'}
        ]
        
        # Find closest reference
        closest = min(references, key=lambda x: abs(x['score'] - score))
        
        return {
            'similar_to': closest['city'],
            'reference_score': closest['score'],
            'reference_category': closest['category'],
            'percentile': self._calculate_percentile(score)
        }
    
    def _calculate_percentile(self, score: float) -> str:
        """Calculate percentile ranking"""
        if score >= 90:
            return 'Top 5%'
        elif score >= 80:
            return 'Top 15%'
        elif score >= 70:
            return 'Top 30%'
        elif score >= 60:
            return 'Top 50%'
        elif score >= 50:
            return 'Bottom 50%'
        else:
            return 'Bottom 25%'
    
    def _predict_qol_trend(self, 
                          components: Dict,
                          insights: Dict) -> Dict[str, str]:
        """Predict future QoL trend based on current factors"""
        improving_factors = []
        declining_factors = []
        
        # Analyze trends
        if 'air_quality' in components:
            if components['air_quality']['score'] < 50:
                declining_factors.append('air quality degradation')
        
        if 'infrastructure' in insights:
            if insights['infrastructure'].get('industrial_areas', 0) > 2:
                declining_factors.append('industrial expansion')
            if insights['infrastructure'].get('schools_nearby', 0) > 2:
                improving_factors.append('educational infrastructure')
        
        # Determine overall trend
        if len(improving_factors) > len(declining_factors):
            trend = 'improving'
            confidence = 'moderate'
        elif len(declining_factors) > len(improving_factors):
            trend = 'declining'
            confidence = 'moderate'
        else:
            trend = 'stable'
            confidence = 'high'
        
        return {
            'direction': trend,
            'confidence': confidence,
            'improving_factors': improving_factors,
            'declining_factors': declining_factors,
            'timeline': '1-3 years'
        }


class ConsolidatedAnalyzer:
    """Main class that consolidates radius and QoL analysis"""
    
    def __init__(self):
        self.radius_calculator = ImpactRadiusCalculator()
        self.qol_calculator = QualityOfLifeCalculator()
    
    def analyze_location(self,
                        insights: Dict[str, Any],
                        location: Dict[str, float],
                        weather_data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Perform complete analysis including radius and QoL
        
        Args:
            insights: Environmental insights from main engine
            location: Dict with 'lat' and 'lon'
            weather_data: Optional weather data for wind adjustments
        
        Returns:
            Consolidated analysis with radius and QoL
        """
        
        # Extract wind data if available
        wind_speed = 5.0  # Default 5 m/s
        wind_direction = 0.0  # Default north
        
        if weather_data:
            wind_speed = weather_data.get('wind_speed', 5.0) * 0.44704  # mph to m/s
            wind_direction = weather_data.get('wind_direction', 0.0)
        
        # Calculate impact radius
        radius_analysis = self.radius_calculator.calculate_impact_radius(
            insights,
            wind_speed,
            wind_direction
        )
        
        # Calculate Quality of Life index
        qol_analysis = self.qol_calculator.calculate_qol_index(
            insights,
            radius_analysis
        )
        
        # Generate consolidated summary
        summary = self._generate_consolidated_summary(
            radius_analysis,
            qol_analysis,
            insights
        )
        
        return {
            'location': location,
            'timestamp': datetime.now().isoformat(),
            'impact_radius_analysis': radius_analysis,
            'quality_of_life_analysis': qol_analysis,
            'consolidated_summary': summary,
            'action_priorities': self._generate_action_priorities(
                radius_analysis,
                qol_analysis
            )
        }
    
    def _generate_consolidated_summary(self,
                                     radius_data: Dict,
                                     qol_data: Dict,
                                     insights: Dict) -> str:
        """Generate human-readable consolidated summary"""
        
        summary_parts = []
        
        # Radius summary
        max_radius = radius_data['maximum_impact_radius_km']
        safe_radius = radius_data['safe_zone_radius_km']
        summary_parts.append(
            f"Environmental impacts extend up to {max_radius:.1f}km from the center, "
            f"with safe conditions beyond {safe_radius:.1f}km."
        )
        
        # QoL summary
        qol_score = qol_data['overall_score']
        qol_category = qol_data['category']
        summary_parts.append(
            f"Quality of Life Index: {qol_score}/100 ({qol_category}). "
            f"{qol_data['description']}"
        )
        
        # Key concerns
        if qol_data['top_concerns']:
            concerns_str = ', '.join(qol_data['top_concerns'])
            summary_parts.append(f"Primary concerns: {concerns_str}.")
        
        # Comparison
        comparison = qol_data['comparison']
        summary_parts.append(
            f"Environmental conditions comparable to {comparison['similar_to']} "
            f"(percentile: {comparison['percentile']})."
        )
        
        return ' '.join(summary_parts)
    
    def _generate_action_priorities(self,
                                   radius_data: Dict,
                                   qol_data: Dict) -> List[Dict]:
        """Generate prioritized action items"""
        
        actions = []
        
        # High priority if large impact radius
        if radius_data['maximum_impact_radius_km'] > 10:
            actions.append({
                'priority': 'HIGH',
                'category': 'Environmental Mitigation',
                'action': 'Implement immediate pollution control measures',
                'impact': f"Reduce impact radius from {radius_data['maximum_impact_radius_km']:.1f}km",
                'timeline': 'Immediate'
            })
        
        # QoL-based actions
        if qol_data['overall_score'] < 60:
            for concern in qol_data['top_concerns'][:2]:
                actions.append({
                    'priority': 'HIGH' if qol_data['overall_score'] < 50 else 'MEDIUM',
                    'category': 'Quality of Life',
                    'action': f"Address {concern.replace('_', ' ')} issues",
                    'impact': f"Improve QoL score by 5-10 points",
                    'timeline': '3-6 months'
                })
        
        # Preventive actions
        trend = qol_data.get('trend_prediction', {})
        if trend.get('direction') == 'declining':
            actions.append({
                'priority': 'MEDIUM',
                'category': 'Prevention',
                'action': 'Implement monitoring and early warning systems',
                'impact': 'Prevent further degradation',
                'timeline': '1-3 months'
            })
        
        # Sort by priority
        priority_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
        actions.sort(key=lambda x: priority_order.get(x['priority'], 3))
        
        return actions[:5]  # Return top 5 actions


# Example usage
if __name__ == "__main__":
    # Sample insights from the environmental engine
    sample_insights = {
        'air_quality': {
            'overall_aqi': 125,
            'primary_pollutant': 'PM2.5',
            'health_category': 'Unhealthy for Sensitive Groups',
            'pollutants': {
                'PM2.5': {'aqi': 125, 'value': 45.5},
                'O3': {'aqi': 65, 'value': 0.065},
                'NO2': {'aqi': 45, 'value': 25}
            }
        },
        'infrastructure': {
            'infrastructure_density': 'High',
            'total_buildings': 450,
            'roads_count': 125,
            'hospitals_nearby': 2,
            'schools_nearby': 4,
            'industrial_areas': 1,
            'water_bodies': 2,
            'environmental_concerns': ['High traffic pollution', 'Industrial emissions nearby']
        },
        'emissions': {
            'co2_emissions_metric_tons': 0.82
        }
    }
    
    # Create analyzer
    analyzer = ConsolidatedAnalyzer()
    
    # Analyze location
    result = analyzer.analyze_location(
        insights=sample_insights,
        location={'lat': 40.7128, 'lon': -74.0060},
        weather_data={'wind_speed': 10, 'wind_direction': 270}  # 10 mph from west
    )
    
    # Print results
    print("CONSOLIDATED ENVIRONMENTAL ANALYSIS")
    print("=" * 60)
    print(f"\nQuality of Life Score: {result['quality_of_life_analysis']['overall_score']}/100")
    print(f"Category: {result['quality_of_life_analysis']['category']}")
    print(f"\nMaximum Impact Radius: {result['impact_radius_analysis']['maximum_impact_radius_km']:.1f} km")
    print(f"Safe Zone Starts At: {result['impact_radius_analysis']['safe_zone_radius_km']:.1f} km")
    print(f"\nSummary: {result['consolidated_summary']}")
    
    print("\n\nACTION PRIORITIES:")
    for i, action in enumerate(result['action_priorities'], 1):
        print(f"{i}. [{action['priority']}] {action['action']}")
        print(f"   Impact: {action['impact']} | Timeline: {action['timeline']}")