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