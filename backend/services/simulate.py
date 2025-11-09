import numpy as np
import math
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import random
from scipy.stats import norm, poisson
from scipy import interpolate


@dataclass
class ClimateData:
    # Climate data for cooling calculations
    dry_bulb_temp: float  # °F
    wet_bulb_temp: float  # °F
    humidity: float       # %
    wind_speed: float     # mph
    solar_irradiance: float = 0  # W/m²

@dataclass
class DataCenterSpecs:
    # Data center specifications
    server_count: int
    max_power_per_server: float  # Watts
    facility_size_sqft: float
    cooling_type: str = "air_cooled"
    server_type: str = "enterprise"
    datacenter_type: str = "enterprise"

@dataclass
class GridInfo:
    # Grid region information
    region_code: str
    baseline_demand_mw: float
    total_households: int
    average_household_bill: float = 120.0  # Monthly average

@dataclass
class PowerSimulationResult:
    # Results from power simulation
    hourly_power_kw: List[float]
    hourly_utilization: List[float]
    hourly_pue: List[float]
    peak_power_kw: float
    average_power_kw: float
    annual_consumption_mwh: float
    community_impact: Dict



class ServerPowerModel:
    
    def __init__(self, server_type: str = "enterprise"):
        # Real power curves from SPEC benchmarks and industry data
        # All curves follow SPECpower_ssj2008 standard with 11 data points (every 10%)
        # 
        # Available server types:
        #   - enterprise: Traditional x86 servers (Intel Xeon, AMD EPYC)
        #   - gpu_compute: Legacy GPU servers (older generation)
        #   - cpu_intensive: HPC/scientific computing servers
        #   - tpu_v4: Google TPU v4/v5 (AI/ML optimized)
        #   - nvidia_h100: Modern NVIDIA H100/A100 (AI training)
        #   - inference_accelerator: AI inference-optimized accelerators
        #   - arm_server: ARM-based cloud servers (AWS Graviton, Ampere Altra)
        self.power_curves = {
            # Traditional x86 enterprise servers (Intel Xeon, AMD EPYC)
            "enterprise": {
                "utilization": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                "power_ratio": [0.58, 0.64, 0.69, 0.75, 0.80, 0.85, 0.89, 0.94, 0.96, 0.98, 1.0]
            },
            # Legacy GPU compute servers (older generation GPUs)
            "gpu_compute": {
                "utilization": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                "power_ratio": [0.45, 0.52, 0.61, 0.72, 0.78, 0.84, 0.88, 0.92, 0.95, 0.98, 1.0]
            },
            # CPU-intensive compute servers (HPC, scientific computing)
            "cpu_intensive": {
                "utilization": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                "power_ratio": [0.55, 0.62, 0.68, 0.76, 0.81, 0.87, 0.91, 0.95, 0.97, 0.99, 1.0]
            },
            # Google TPU v4/v5 (AI/ML optimized, 175-250W per chip)
            "tpu_v4": {
                "utilization": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                "power_ratio": [0.35, 0.42, 0.51, 0.62, 0.68, 0.75, 0.81, 0.87, 0.91, 0.95, 1.0]
            },
            # Modern NVIDIA H100/A100 GPUs for AI training (700W TDP)
            "nvidia_h100": {
                "utilization": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                "power_ratio": [0.40, 0.48, 0.58, 0.70, 0.76, 0.82, 0.86, 0.90, 0.94, 0.97, 1.0]
            },
            # AI inference accelerators (optimized for low-latency inference)
            "inference_accelerator": {
                "utilization": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                "power_ratio": [0.30, 0.38, 0.48, 0.60, 0.66, 0.73, 0.79, 0.85, 0.89, 0.94, 1.0]
            },
            # ARM-based servers (AWS Graviton, Ampere Altra)
            "arm_server": {
                "utilization": [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                "power_ratio": [0.48, 0.55, 0.62, 0.70, 0.75, 0.81, 0.85, 0.90, 0.93, 0.96, 1.0]
            }
        }
        
        self.server_type = server_type
        
        # Create interpolation function for smooth power curves
        curve = self.power_curves.get(server_type, self.power_curves["enterprise"])
        self.power_interpolator = interpolate.interp1d(
            curve["utilization"], 
            curve["power_ratio"], 
            kind='cubic',
            bounds_error=False,
            fill_value=(curve["power_ratio"][0], curve["power_ratio"][-1])
        )
    
    def get_power_consumption(self, max_power_w: float, utilization_percent: float) -> float:

        utilization_clamped = np.clip(utilization_percent, 0, 100)
        power_ratio = self.power_interpolator(utilization_clamped)
        return max_power_w * power_ratio
    
    def get_server_efficiency_rating(self, utilization_percent: float) -> str:
        power_ratio = self.power_interpolator(np.clip(utilization_percent, 0, 100))
        
        if power_ratio < 0.65:
            return "excellent", round(float(power_ratio), 2)
        elif power_ratio < 0.75:
            return "good", round(float(power_ratio), 2)
        elif power_ratio < 0.85:
            return "fair", round(float(power_ratio), 2)
        else:
            return "poor", round(float(power_ratio), 2)

class WorkloadSimulator:
    
    def __init__(self):
        # Define workload patterns based on real data center types
        self.patterns = {
            "enterprise": {
                "base_utilization": 35,  # Average utilization %
                "daily_variance": 15,    # ±15% daily swing
                "peak_hours": (9, 17),   # 9 AM to 5 PM
                "weekend_reduction": 0.7, # 30% reduction on weekends
                "seasonal_factor": 1.1,   # 10% higher in Q4 (year-end processing)
                "spike_frequency": 0.25   # 25% chance of usage spikes
            },
            "cloud_compute": {
                "base_utilization": 65,
                "daily_variance": 25,
                "peak_hours": (19, 23),  # Evening peak (global usage)
                "weekend_reduction": 1.1, # 10% increase on weekends
                "seasonal_factor": 1.0,
                "spike_frequency": 0.35
            },
            "ai_training": {
                "base_utilization": 85,
                "daily_variance": 10,
                "peak_hours": None,      # Constant high load
                "weekend_reduction": 1.0, # No weekend effect
                "seasonal_factor": 1.0,
                "spike_frequency": 0.15   # Fewer spikes, more consistent
            },
            "gaming": {
                "base_utilization": 45,
                "daily_variance": 35,
                "peak_hours": (18, 24),  # Evening gaming peak
                "weekend_reduction": 1.3, # 30% increase on weekends
                "seasonal_factor": 1.2,   # Higher during holiday seasons
                "spike_frequency": 0.4
            }
        }
    
    def simulate_utilization(self, hour: int, day_of_week: int, datacenter_type: str = "enterprise", month: int = 6) -> float:

        pattern = self.patterns.get(datacenter_type, self.patterns["enterprise"])
        base_util = pattern["base_utilization"]
        
        # Weekend adjustment
        if day_of_week >= 5:  # Saturday/Sunday
            base_util *= pattern["weekend_reduction"]
        
        # Peak hour adjustment
        if pattern["peak_hours"]:
            peak_start, peak_end = pattern["peak_hours"]
            if peak_start <= hour <= peak_end:
                base_util *= 1.3  # 30% increase during peak
            elif hour < 6 or hour > 22:  # Late night/early morning
                base_util *= 0.7  # 30% reduction during off-hours
        
        # Seasonal adjustment
        seasonal_months = [11, 12, 1]  # Nov, Dec, Jan are typically higher
        if month in seasonal_months:
            base_util *= pattern["seasonal_factor"]
        
        # Add random variance (normal distribution)
        variance = pattern["daily_variance"]
        utilization = norm.rvs(base_util, variance/3)  # 3-sigma rule
        
        # Add occasional spikes
        if random.random() < pattern["spike_frequency"]:
            spike_intensity = poisson.rvs(15)  # Random spike
            utilization += spike_intensity
        
        return np.clip(utilization, 5, 98)  # Realistic bounds
    
    def generate_daily_profile(self, datacenter_type: str = "enterprise", day_of_week: int = 1, month: int = 6) -> List[float]:
        return [
            self.simulate_utilization(hour, day_of_week, datacenter_type, month)
            for hour in range(24)
        ]

class CoolingEfficiencyModel:
    
    def __init__(self, cooling_type: str = "air_cooled"):
        # Cooling system configurations with real-world data
        self.cooling_configs = {
            "air_cooled": {
                "base_pue": 1.4,
                "optimal_temp": 65,    # °F
                "temp_sensitivity": 0.012,  # PUE increase per °F above optimal
                "humidity_factor": 0.003,
                "wind_benefit": 0.005,
                "max_pue": 2.0
            },
            "water_cooled": {
                "base_pue": 1.25,
                "optimal_temp": 75,
                "temp_sensitivity": 0.008,
                "humidity_factor": 0.001,
                "wind_benefit": 0.001,
                "max_pue": 1.8
            },
            "evaporative": {
                "base_pue": 1.15,
                "optimal_temp": 70,
                "temp_sensitivity": 0.015,
                "humidity_factor": 0.008,
                "wind_benefit": 0.003,
                "max_pue": 2.2
            },
            "liquid_cooling": {
                "base_pue": 1.05,
                "optimal_temp": 80,
                "temp_sensitivity": 0.005,
                "humidity_factor": 0.0005,
                "wind_benefit": 0,
                "max_pue": 1.3
            }
        }
        
        self.cooling_type = cooling_type
    
    def calculate_pue(self, climate: ClimateData) -> float:

        config = self.cooling_configs.get(self.cooling_type, 
                                         self.cooling_configs["air_cooled"])
        
        # Start with base efficiency
        pue = config["base_pue"]
        
        # Temperature impact
        temp_delta = max(0, climate.dry_bulb_temp - config["optimal_temp"])
        pue += temp_delta * config["temp_sensitivity"]
        
        # Humidity impact (higher humidity = worse cooling efficiency)
        humidity_penalty = max(0, (climate.humidity - 45)) * config["humidity_factor"]
        pue += humidity_penalty
        
        # Wind speed benefit (primarily for air-cooled systems)
        if climate.wind_speed > 5:
            wind_benefit = min(0.1, (climate.wind_speed - 5) * config["wind_benefit"])
            pue -= wind_benefit
        
        # Special case for evaporative cooling - wet bulb temperature matters
        if self.cooling_type == "evaporative":
            wb_penalty = max(0, climate.wet_bulb_temp - 65) * 0.01
            pue += wb_penalty
        
        # Ensure PUE stays within realistic bounds
        return max(1.02, min(config["max_pue"], pue))
    
    def get_cooling_efficiency_rating(self, pue: float) -> str:
        """Get efficiency rating for PUE value"""
        if pue < 1.2:
            return "excellent"
        elif pue < 1.4:
            return "good"
        elif pue < 1.6:
            return "fair"
        else:
            return "poor"
    
    def calculate_water_usage(self, it_power_kw: float, climate: ClimateData) -> float:
  
        # Water usage factors (gallons per kWh of cooling)
        water_factors = {
            "air_cooled": 0.2,      # Minimal water use
            "water_cooled": 1.8,    # Traditional cooling towers
            "evaporative": 1.0,     # Evaporative cooling
            "liquid_cooling": 0.3   # Direct liquid cooling
        }
        
        factor = water_factors.get(self.cooling_type, 0.2)
        
        # Calculate cooling load
        pue = self.calculate_pue(climate)
        cooling_power_kw = it_power_kw * (pue - 1)
        
        # Adjust for temperature (higher temp = more water usage)
        temp_multiplier = 1 + max(0, (climate.dry_bulb_temp - 70) * 0.02)
        
        return cooling_power_kw * factor * temp_multiplier

class GridImpactCalculator:
    
    def __init__(self):
        # Complete US coverage across all major grid operators
        self.grid_regions = {
            # California Independent System Operator
            # Covers: Most of California
            # Energy mix: High solar/wind penetration (~60% renewables target by 2030)
            "CAISO": {
                "base_rate": 0.13,           # $/kWh - EIA 2024 CA industrial avg
                "peak_multiplier": 2.5,      # 2.5x during peak hours (duck curve impact)
                "carbon_intensity": 0.209    # kg CO₂/kWh - EPA eGRID 2022 CAMX
            },
            
            # Electric Reliability Council of Texas
            # Covers: ~90% of Texas (isolated grid)
            # Energy mix: Natural gas (47%), wind (26%), coal (13%)
            "ERCOT": {
                "base_rate": 0.08,           # $/kWh - EIA 2024 TX industrial avg
                "peak_multiplier": 3.0,      # 3.0x - highest volatility (2021 crisis example)
                "carbon_intensity": 0.391    # kg CO₂/kWh - EPA eGRID 2022 ERCT
            },
            
            # PJM Interconnection
            # Covers: 13 states (DE, IL, IN, KY, MD, MI, NJ, NC, OH, PA, TN, VA, WV, DC)
            # Energy mix: Natural gas (36%), nuclear (34%), coal (17%)
            "PJM": {
                "base_rate": 0.09,           # $/kWh - EIA 2024 PJM region avg
                "peak_multiplier": 2.0,      # 2.0x - most stable market structure
                "carbon_intensity": 0.367    # kg CO₂/kWh - EPA eGRID 2022 RFCE/RFCW avg
            },
            
            # New York Independent System Operator
            # Covers: New York State
            # Energy mix: Natural gas (39%), nuclear (30%), hydro (19%)
            "NYISO": {
                "base_rate": 0.11,           # $/kWh - EIA 2024 NY industrial avg
                "peak_multiplier": 2.2,      # 2.2x - moderate peak pricing
                "carbon_intensity": 0.178    # kg CO₂/kWh - EPA eGRID 2022 NYCW/NYLI (cleanest)
            },
            
            # Southwest Power Pool
            # Covers: 14 states (central US - KS, OK, NE, ND, SD, MN, IA, MO, AR, LA, etc.)
            # Energy mix: Wind (36%), coal (27%), natural gas (26%)
            "SPP": {
                "base_rate": 0.07,           # $/kWh - EIA 2024 plains states avg
                "peak_multiplier": 2.8,      # 2.8x - high seasonal variation
                "carbon_intensity": 0.454    # kg CO₂/kWh - EPA eGRID 2022 SPNO/SPSO (coal heavy)
            },
            
            # ISO New England
            # Covers: 6 states (CT, ME, MA, NH, RI, VT)
            # Energy mix: Natural gas (50%), nuclear (20%), renewables (20%)
            "ISONE": {
                "base_rate": 0.16,           # $/kWh - EIA 2024 New England avg (highest in US)
                "peak_multiplier": 2.4,      # 2.4x - constrained transmission, winter peaks
                "carbon_intensity": 0.235    # kg CO₂/kWh - EPA eGRID 2022 NEWE
            },
            
            # Midcontinent Independent System Operator
            # Covers: 15 states (WI, MN, MI, parts of IL, IN, IA, etc.)
            # Energy mix: Coal (31%), natural gas (28%), wind (23%), nuclear (11%)
            "MISO": {
                "base_rate": 0.08,           # $/kWh - EIA 2024 Midwest industrial avg
                "peak_multiplier": 2.3,      # 2.3x - moderate volatility
                "carbon_intensity": 0.425    # kg CO₂/kWh - EPA eGRID 2022 MROE/MROW avg
            },
            
            # Southeast (non-ISO utilities - SERC)
            # Covers: FL, GA, AL, SC, parts of NC, MS
            # Energy mix: Natural gas (48%), nuclear (20%), coal (18%)
            "SERC": {
                "base_rate": 0.09,           # $/kWh - EIA 2024 Southeast avg
                "peak_multiplier": 2.1,      # 2.1x - regulated utilities, stable pricing
                "carbon_intensity": 0.398    # kg CO₂/kWh - EPA eGRID 2022 SRVC/SRTV avg
            },
            
            # Pacific Northwest (non-ISO)
            # Covers: WA, OR, ID, western MT
            # Energy mix: Hydro (65%), natural gas (18%), wind (10%), coal (3%)
            "PACNW": {
                "base_rate": 0.07,           # $/kWh - EIA 2024 Northwest avg (low hydro costs)
                "peak_multiplier": 1.8,      # 1.8x - most stable (abundant hydro)
                "carbon_intensity": 0.158    # kg CO₂/kWh - EPA eGRID 2022 NWPP (very clean)
            },
            
            # Southwest/Mountain West (WECC - non CAISO)
            # Covers: AZ, NV, UT, CO, NM, WY
            # Energy mix: Natural gas (33%), coal (26%), solar/wind (22%), nuclear (8%)
            "WEST": {
                "base_rate": 0.09,           # $/kWh - EIA 2024 Mountain states avg
                "peak_multiplier": 2.6,      # 2.6x - high A/C load peaks in summer
                "carbon_intensity": 0.412    # kg CO₂/kWh - EPA eGRID 2022 WECC avg
            },
            
            # Default/Fallback for any uncovered areas
            # Uses US national averages
            "DEFAULT": {
                "base_rate": 0.10,           # $/kWh - US national industrial avg
                "peak_multiplier": 2.2,      # 2.2x - national average
                "carbon_intensity": 0.386    # kg CO₂/kWh - US grid average
            }
        }
    
    def calculate_grid_impact(self, datacenter_power_profile: List[float], 
                             grid_info: GridInfo) -> Dict:

        # Convert to MW for grid calculations
        datacenter_power_mw = [power / 1000 for power in datacenter_power_profile]
        
        # Calculate peak impact
        datacenter_peak_mw = max(datacenter_power_mw)
        baseline_peak_mw = grid_info.baseline_demand_mw
        
        # Safeguard against division by zero
        if baseline_peak_mw <= 0:
            baseline_peak_mw = 100  # Default minimum grid capacity of 100 MW
            print(f"Warning: baseline_demand_mw was {grid_info.baseline_demand_mw}, using default 100 MW")
        
        new_peak_mw = baseline_peak_mw + datacenter_peak_mw
        
        # Grid impact percentages
        peak_impact_percent = (datacenter_peak_mw / baseline_peak_mw) * 100
        average_impact_percent = (np.mean(datacenter_power_mw) / baseline_peak_mw) * 100
        
        # Grid stability assessment
        stability_risk = self._assess_stability_risk(peak_impact_percent)
        
        # Infrastructure requirements
        infrastructure_cost = self._estimate_infrastructure_cost(
            datacenter_peak_mw, baseline_peak_mw
        )
        
        # Household bill impact
        household_impact = self._calculate_household_impact(
            datacenter_peak_mw, grid_info
        )
        
        return {
            "peak_impact_percent": peak_impact_percent,
            "average_impact_percent": average_impact_percent,
            "stability_risk": stability_risk,
            "infrastructure_cost": infrastructure_cost,
            "household_impact": household_impact,
            "grid_classification": self._classify_impact(peak_impact_percent)
        }
    
    def _assess_stability_risk(self, impact_percent: float) -> str:

        if impact_percent < 0.5:
            return "low"
        elif impact_percent < 2.0:
            return "moderate" 
        elif impact_percent < 5.0:
            return "high"
        else:
            return "critical"
    
    def _estimate_infrastructure_cost(self, datacenter_peak_mw: float, 
                                    baseline_peak_mw: float) -> Dict:

        # Infrastructure cost factors ($/MW capacity)
        transmission_cost_per_mw = 50000    # Transmission lines
        distribution_cost_per_mw = 75000    # Distribution upgrades
        substation_cost_per_mw = 100000     # Substation capacity
        
        # Determine if new infrastructure is needed
        capacity_utilization = (baseline_peak_mw + datacenter_peak_mw) / (baseline_peak_mw * 1.15)
        
        if capacity_utilization > 1.0:  # Exceeds current capacity + 15% margin
            excess_capacity = datacenter_peak_mw - (baseline_peak_mw * 0.15)
            
            transmission_cost = excess_capacity * transmission_cost_per_mw
            distribution_cost = datacenter_peak_mw * distribution_cost_per_mw
            substation_cost = excess_capacity * substation_cost_per_mw
            
            return {
                "transmission": transmission_cost,
                "distribution": distribution_cost, 
                "substation": substation_cost,
                "total": transmission_cost + distribution_cost + substation_cost,
                "required": True
            }
        else:
            return {
                "transmission": 0,
                "distribution": datacenter_peak_mw * 25000,  # Minor upgrades
                "substation": 0,
                "total": datacenter_peak_mw * 25000,
                "required": False
            }
    
    def _calculate_household_impact(self, datacenter_peak_mw: float, 
                                  grid_info: GridInfo) -> Dict:

        # Infrastructure costs are passed to consumers
        infrastructure_cost = self._estimate_infrastructure_cost(
            datacenter_peak_mw, grid_info.baseline_demand_mw
        )
        
        # Amortize infrastructure cost over 15 years
        annual_infrastructure_cost = infrastructure_cost["total"] / 15
        
        # Safeguard against division by zero
        total_households = grid_info.total_households if grid_info.total_households > 0 else 40000
        if grid_info.total_households <= 0:
            print(f"Warning: total_households was {grid_info.total_households}, using default 40,000")
        
        # Distribute cost across households
        annual_cost_per_household = annual_infrastructure_cost / total_households
        monthly_cost_per_household = annual_cost_per_household / 12
        
        # Calculate percentage increase
        percentage_increase = (monthly_cost_per_household / grid_info.average_household_bill) * 100
        
        return {
            "annual_cost_per_household": annual_cost_per_household,
            "monthly_cost_per_household": monthly_cost_per_household,
            "percentage_increase": percentage_increase,
            "total_community_cost": annual_infrastructure_cost
        }
    
    def _classify_impact(self, impact_percent: float) -> str:

        if impact_percent < 0.1:
            return "negligible"
        elif impact_percent < 0.5:
            return "low"
        elif impact_percent < 2.0:
            return "moderate"
        elif impact_percent < 5.0:
            return "high"
        else:
            return "critical"


def run_full_simulation(
    datacenter_specs: DataCenterSpecs,
    climate_data: ClimateData,
    grid_info: GridInfo,
    simulation_hours: int = 8760,  # 1 year
    progress_callback = None
) -> PowerSimulationResult:
  
    # Initialize models
    server_model = ServerPowerModel(server_type=datacenter_specs.server_type)
    workload_sim = WorkloadSimulator()
    cooling_model = CoolingEfficiencyModel(cooling_type=datacenter_specs.cooling_type)
    grid_calculator = GridImpactCalculator()
    
    # Simulate hourly data
    hourly_power_kw = []
    hourly_utilization = []
    hourly_pue = []
    
    start_date = datetime.now()
    
    for hour in range(simulation_hours):
        current_time = start_date + timedelta(hours=hour)
        day_of_week = current_time.weekday()
        month = current_time.month
        hour_of_day = current_time.hour
        
        # Get utilization for this hour
        utilization = workload_sim.simulate_utilization(
            hour_of_day, day_of_week, datacenter_specs.datacenter_type, month
        )
        
        # Calculate power consumption (optimized - calculate once, multiply by server count)
        power_per_server_w = server_model.get_power_consumption(
            datacenter_specs.max_power_per_server, utilization
        )
        total_power_w = power_per_server_w * datacenter_specs.server_count
        
        # Calculate PUE (cooling efficiency)
        pue = cooling_model.calculate_pue(climate_data)
        
        # Total power including cooling
        total_power_kw = (total_power_w / 1000) * pue
        
        hourly_power_kw.append(total_power_kw)
        hourly_utilization.append(utilization)
        hourly_pue.append(pue)


        if progress_callback and (hour + 1) % 24 == 0:
            progress_callback({
                'hours_completed': hour + 1,
                'percent_complete': ((hour + 1) / simulation_hours) * 100,
                'current_avg_power_kw': float(np.mean(hourly_power_kw)),
                'current_avg_utilization': float(np.mean(hourly_utilization)),
                'current_avg_pue': float(np.mean(hourly_pue))
            })

    
    # Calculate grid impact
    community_impact = grid_calculator.calculate_grid_impact(
        hourly_power_kw, grid_info
    )
    
    # Compile results
    return PowerSimulationResult(
        hourly_power_kw=hourly_power_kw,
        hourly_utilization=hourly_utilization,
        hourly_pue=hourly_pue,
        peak_power_kw=max(hourly_power_kw),
        average_power_kw=np.mean(hourly_power_kw),
        annual_consumption_mwh=sum(hourly_power_kw) / 1000,
        community_impact=community_impact
    )

def create_climate_data_from_api(weather_data: dict) -> ClimateData:
    """Convert OpenWeatherMap data to ClimateData"""
    temp_f = weather_data.get('temperature', 70)
    humidity = weather_data.get('humidity', 50)
    
    # Estimate wet bulb temp (simplified formula)
    wet_bulb = temp_f * math.atan(0.151977 * math.sqrt(humidity + 8.313659)) + \
               math.atan(temp_f + humidity) - math.atan(humidity - 1.676331) + \
               0.00391838 * (humidity ** 1.5) * math.atan(0.023101 * humidity) - 4.686035
    
    return ClimateData(
        dry_bulb_temp=temp_f,
        wet_bulb_temp=wet_bulb,
        humidity=humidity,
        wind_speed=weather_data.get('wind_speed', 5),
        solar_irradiance=weather_data.get('solar_irradiance', 0)
    )

def create_datacenter_specs_from_config(config: dict) -> DataCenterSpecs:
    """Convert app.py config to DataCenterSpecs"""
    servers = config.get('servers', 1000)
    power_mw = config.get('power_mw', 10)
    
    # Calculate max power per server
    total_power_w = power_mw * 1_000_000
    max_power_per_server = total_power_w / servers if servers > 0 else 500
    
    return DataCenterSpecs(
        server_count=servers,
        max_power_per_server=max_power_per_server,
        facility_size_sqft=config.get('square_feet', 50000),
        cooling_type=config.get('cooling_type', 'air_cooled'),
        server_type=config.get('server_type', 'enterprise'),
        datacenter_type=config.get('datacenter_type', 'enterprise')
    )

def create_grid_info_from_location(location_data: dict, region_code: str = "DEFAULT") -> GridInfo:
    """Convert location data to GridInfo"""
    population = location_data.get('population', 100000)
    
    # Ensure minimum population to avoid division by zero
    if population < 1000:
        print(f"Warning: Population ({population}) is too low, using default of 100,000")
        population = 100000
    
    households = int(population / 2.5)
    
    # Estimate baseline demand (rough: 1-2 kW avg per household)
    baseline_demand_mw = (households * 1.5) / 1000
    
    return GridInfo(
        region_code=region_code,
        baseline_demand_mw=baseline_demand_mw,
        total_households=households,
        average_household_bill=120.0
    )