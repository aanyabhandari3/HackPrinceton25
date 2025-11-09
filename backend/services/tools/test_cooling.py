from services import CoolingEfficiencyModel
from services.power_simulation import ClimateData
import matplotlib.pyplot as plt
import numpy as np

# ============================================
# TEST: CoolingEfficiencyModel
# ============================================
# This demonstrates how to test cooling efficiency across different:
# - Cooling types (air, water, evaporative, liquid)
# - Climate conditions (temperature, humidity, wind)
# - Seasonal variations

print(f"\n{'='*70}")
print(f"COOLING EFFICIENCY MODEL TEST")
print(f"{'='*70}\n")

# Define test cooling types
cooling_types = ["air_cooled", "water_cooled", "evaporative", "liquid_cooling"]

# ============================================
# TEST 1: PUE Calculation Under Different Climates
# ============================================

print(f"{'='*70}")
print("TEST 1: PUE Under Different Climate Conditions")
print(f"{'='*70}\n")

# Define test climate scenarios
climate_scenarios = {
    "Ideal": ClimateData(dry_bulb_temp=65, wet_bulb_temp=55, humidity=45, wind_speed=5),
    "Moderate": ClimateData(dry_bulb_temp=75, wet_bulb_temp=65, humidity=60, wind_speed=10),
    "Hot & Humid": ClimateData(dry_bulb_temp=90, wet_bulb_temp=75, humidity=80, wind_speed=3),
    "Hot & Dry": ClimateData(dry_bulb_temp=95, wet_bulb_temp=65, humidity=20, wind_speed=15),
    "Cold": ClimateData(dry_bulb_temp=40, wet_bulb_temp=35, humidity=50, wind_speed=20)
}

# Test each cooling type under each climate scenario
results = {}
for cooling_type in cooling_types:
    model = CoolingEfficiencyModel(cooling_type)
    results[cooling_type] = {}
    
    print(f"\n{cooling_type.upper().replace('_', ' ')}:")
    print(f"{'-'*70}")
    
    for scenario_name, climate in climate_scenarios.items():
        pue = model.calculate_pue(climate)
        rating = model.get_cooling_efficiency_rating(pue)
        results[cooling_type][scenario_name] = pue
        
        print(f"  {scenario_name:15s}: PUE = {pue:.3f} [{rating.upper()}]")

# ============================================
# TEST 2: Temperature Sensitivity Analysis
# ============================================

print(f"\n{'='*70}")
print("TEST 2: Temperature Sensitivity Analysis")
print(f"{'='*70}\n")

# Test across temperature range (40°F to 100°F)
temp_range = np.linspace(40, 100, 25)
temp_sensitivity = {cooling_type: [] for cooling_type in cooling_types}

for temp in temp_range:
    climate = ClimateData(
        dry_bulb_temp=temp,
        wet_bulb_temp=temp - 10,
        humidity=50,
        wind_speed=10
    )
    
    for cooling_type in cooling_types:
        model = CoolingEfficiencyModel(cooling_type)
        pue = model.calculate_pue(climate)
        temp_sensitivity[cooling_type].append(pue)

# Find optimal temperature range for each cooling type
print("Optimal Temperature Ranges (PUE < 1.3):\n")
for cooling_type in cooling_types:
    pue_values = temp_sensitivity[cooling_type]
    optimal_temps = [temp for temp, pue in zip(temp_range, pue_values) if pue < 1.3]
    
    if optimal_temps:
        print(f"  {cooling_type:20s}: {min(optimal_temps):.1f}°F - {max(optimal_temps):.1f}°F")
    else:
        print(f"  {cooling_type:20s}: No optimal range found")

# ============================================
# TEST 3: Water Usage Calculation
# ============================================

print(f"\n{'='*70}")
print("TEST 3: Water Usage Analysis")
print(f"{'='*70}\n")

# Test water usage for a 1MW data center
test_power_kw = 1000  # 1MW IT load

print(f"Water usage for {test_power_kw/1000:.1f}MW data center:\n")

for cooling_type in cooling_types:
    model = CoolingEfficiencyModel(cooling_type)
    
    print(f"\n{cooling_type.upper().replace('_', ' ')}:")
    print(f"{'-'*70}")
    
    for scenario_name, climate in climate_scenarios.items():
        water_usage = model.calculate_water_usage(test_power_kw, climate)
        pue = model.calculate_pue(climate)
        
        # Calculate hourly and annual water usage
        hourly_gallons = water_usage
        daily_gallons = hourly_gallons * 24
        annual_gallons = daily_gallons * 365
        
        print(f"  {scenario_name:15s}: {hourly_gallons:>8.1f} gal/hr "
              f"({annual_gallons/1_000_000:>6.2f}M gal/year) [PUE: {pue:.3f}]")

# ============================================
# TEST 4: Annual Simulation (Seasonal Variations)
# ============================================

print(f"\n{'='*70}")
print("TEST 4: Annual Simulation with Seasonal Climate Variations")
print(f"{'='*70}\n")

# Simulate typical US climate (moderate region)
def generate_climate_profile(hour: int, month: int) -> ClimateData:
    """Generate realistic climate data based on time of day and month"""
    
    # Monthly temperature averages (°F)
    monthly_avg_temps = [35, 40, 50, 60, 70, 80, 85, 85, 75, 65, 50, 40]
    base_temp = monthly_avg_temps[month - 1]
    
    # Daily temperature variation (warmer during day, cooler at night)
    hour_factor = np.sin((hour - 6) * np.pi / 12)  # Peak at 2 PM
    daily_variation = 15 * hour_factor
    
    dry_bulb = base_temp + daily_variation + np.random.normal(0, 3)
    wet_bulb = dry_bulb - 10 - (100 - base_temp) * 0.1
    
    # Humidity varies by season
    humidity = 45 + 20 * np.sin((month - 1) * np.pi / 6) + np.random.normal(0, 5)
    humidity = np.clip(humidity, 20, 90)
    
    # Wind speed (random with slight seasonal variation)
    wind_speed = np.random.gamma(2, 5)  # Gamma distribution for wind
    
    return ClimateData(
        dry_bulb_temp=dry_bulb,
        wet_bulb_temp=wet_bulb,
        humidity=humidity,
        wind_speed=wind_speed
    )

# Simulate full year (8760 hours)
annual_pue = {cooling_type: [] for cooling_type in cooling_types}
annual_water = {cooling_type: [] for cooling_type in cooling_types}

for month in range(1, 13):
    for day in range(30):  # Simplified: 30 days per month
        for hour in range(24):
            climate = generate_climate_profile(hour, month)
            
            for cooling_type in cooling_types:
                model = CoolingEfficiencyModel(cooling_type)
                pue = model.calculate_pue(climate)
                water = model.calculate_water_usage(test_power_kw, climate)
                
                annual_pue[cooling_type].append(pue)
                annual_water[cooling_type].append(water)

# Calculate annual statistics
print("Annual Statistics (1MW Data Center):\n")

for cooling_type in cooling_types:
    pue_values = annual_pue[cooling_type]
    water_values = annual_water[cooling_type]
    
    avg_pue = np.mean(pue_values)
    min_pue = np.min(pue_values)
    max_pue = np.max(pue_values)
    
    total_water_million_gal = sum(water_values) / 1_000_000
    
    # Calculate energy overhead from cooling
    base_energy_mwh = test_power_kw * 8760 / 1000  # Base IT energy
    total_energy_mwh = base_energy_mwh * avg_pue
    cooling_energy_mwh = total_energy_mwh - base_energy_mwh
    
    print(f"{cooling_type.upper().replace('_', ' ')}:")
    print(f"  Average PUE:        {avg_pue:.3f}")
    print(f"  PUE Range:          {min_pue:.3f} - {max_pue:.3f}")
    print(f"  Annual Water:       {total_water_million_gal:.2f} million gallons")
    print(f"  IT Energy:          {base_energy_mwh:,.0f} MWh/year")
    print(f"  Cooling Energy:     {cooling_energy_mwh:,.0f} MWh/year")
    print(f"  Total Energy:       {total_energy_mwh:,.0f} MWh/year")
    print()

# ============================================
# VISUALIZATIONS
# ============================================

fig, axes = plt.subplots(2, 2, figsize=(16, 10))
fig.suptitle('Cooling Efficiency Model Analysis', fontsize=16, fontweight='bold')

# Plot 1: Temperature Sensitivity
ax1 = axes[0, 0]
for cooling_type in cooling_types:
    ax1.plot(temp_range, temp_sensitivity[cooling_type], 
             linewidth=2, marker='o', markersize=3, label=cooling_type.replace('_', ' ').title())
ax1.axhline(y=1.2, color='green', linestyle='--', alpha=0.5, label='Excellent (<1.2)')
ax1.axhline(y=1.4, color='orange', linestyle='--', alpha=0.5, label='Good (<1.4)')
ax1.axhline(y=1.6, color='red', linestyle='--', alpha=0.5, label='Fair (<1.6)')
ax1.set_title('PUE vs. Temperature', fontweight='bold')
ax1.set_xlabel('Temperature (°F)')
ax1.set_ylabel('PUE')
ax1.legend(loc='upper left', fontsize=9)
ax1.grid(True, alpha=0.3)

# Plot 2: Annual PUE Distribution
ax2 = axes[0, 1]
pue_data = [annual_pue[ct] for ct in cooling_types]
bp = ax2.boxplot(pue_data, labels=[ct.replace('_', '\n').title() for ct in cooling_types],
                  patch_artist=True, showmeans=True)
for patch, color in zip(bp['boxes'], ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']):
    patch.set_facecolor(color)
    patch.set_alpha(0.6)
ax2.set_title('Annual PUE Distribution', fontweight='bold')
ax2.set_ylabel('PUE')
ax2.grid(True, alpha=0.3, axis='y')

# Plot 3: Climate Scenario Comparison
ax3 = axes[1, 0]
x_pos = np.arange(len(climate_scenarios))
width = 0.2
for i, cooling_type in enumerate(cooling_types):
    pue_values = [results[cooling_type][scenario] for scenario in climate_scenarios.keys()]
    ax3.bar(x_pos + i * width, pue_values, width, 
            label=cooling_type.replace('_', ' ').title(),
            alpha=0.8)
ax3.set_title('PUE by Climate Scenario', fontweight='bold')
ax3.set_xlabel('Climate Scenario')
ax3.set_ylabel('PUE')
ax3.set_xticks(x_pos + width * 1.5)
ax3.set_xticklabels(climate_scenarios.keys(), rotation=45, ha='right')
ax3.legend(fontsize=9)
ax3.grid(True, alpha=0.3, axis='y')

# Plot 4: Water Usage Comparison
ax4 = axes[1, 1]
water_totals = [sum(annual_water[ct]) / 1_000_000 for ct in cooling_types]
colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
bars = ax4.bar(range(len(cooling_types)), water_totals, color=colors, alpha=0.7, edgecolor='black')
ax4.set_title('Annual Water Usage (1MW Data Center)', fontweight='bold')
ax4.set_ylabel('Million Gallons per Year')
ax4.set_xticks(range(len(cooling_types)))
ax4.set_xticklabels([ct.replace('_', '\n').title() for ct in cooling_types], rotation=0)
ax4.grid(True, alpha=0.3, axis='y')

# Add value labels on bars
for i, (bar, value) in enumerate(zip(bars, water_totals)):
    height = bar.get_height()
    ax4.text(bar.get_x() + bar.get_width()/2., height,
             f'{value:.1f}M',
             ha='center', va='bottom', fontweight='bold', fontsize=10)

plt.tight_layout()
plt.show()

# ============================================
# TEST 5: Efficiency Rating Classification
# ============================================

print(f"{'='*70}")
print("TEST 5: Efficiency Rating Classification")
print(f"{'='*70}\n")

test_pue_values = [1.05, 1.15, 1.25, 1.35, 1.45, 1.55, 1.65, 1.80, 2.0]
model = CoolingEfficiencyModel()  # Use default for rating test

print("PUE Rating Scale:\n")
for pue in test_pue_values:
    rating = model.get_cooling_efficiency_rating(pue)
    print(f"  PUE {pue:.2f}: {rating.upper()}")

print(f"\n{'='*70}\n")
print("✅ All CoolingEfficiencyModel tests completed successfully!")
print("📊 Visualizations generated showing cooling performance across conditions")
print(f"\n{'='*70}\n")

