from services import GridImpactCalculator, GridInfo
import matplotlib.pyplot as plt
import numpy as np

# ============================================
# TEST: GridImpactCalculator
# ============================================
# This demonstrates how to test grid impact across different:
# - Grid regions (CAISO, ERCOT, PJM, NYISO, SPP, ISONE, MISO, SERC, PACNW, WEST)
# - Data center sizes (small, medium, large, hyperscale)
# - Grid capacity scenarios

print(f"\n{'='*70}")
print(f"GRID IMPACT CALCULATOR TEST")
print(f"{'='*70}\n")

# Initialize the calculator
calculator = GridImpactCalculator()

# ============================================
# TEST 1: Different Data Center Sizes
# ============================================

print(f"{'='*70}")
print("TEST 1: Grid Impact of Different Data Center Sizes")
print(f"{'='*70}\n")

# Define test datacenter scenarios with realistic power profiles
datacenter_scenarios = {
    "Small Edge": {
        "description": "Small edge data center (100 servers)",
        "power_profile": [500 + np.sin(i/24 * 2*np.pi) * 100 for i in range(8760)]  # ~500 kW avg
    },
    "Medium Enterprise": {
        "description": "Medium enterprise data center (1000 servers)",
        "power_profile": [3000 + np.sin(i/24 * 2*np.pi) * 500 for i in range(8760)]  # ~3 MW avg
    },
    "Large Colocation": {
        "description": "Large colocation facility (5000 servers)",
        "power_profile": [15000 + np.sin(i/24 * 2*np.pi) * 2000 for i in range(8760)]  # ~15 MW avg
    },
    "Hyperscale": {
        "description": "Hyperscale data center (50000 servers)",
        "power_profile": [100000 + np.sin(i/24 * 2*np.pi) * 10000 for i in range(8760)]  # ~100 MW avg
    }
}

# Test grid for Austin, Texas (ERCOT)
test_grid = GridInfo(
    region_code="ERCOT",
    baseline_demand_mw=10000,  # 10 GW baseline
    total_households=500000,
    average_household_bill=120.0
)

print(f"Test Grid: {test_grid.region_code}")
print(f"Baseline Demand: {test_grid.baseline_demand_mw:,.0f} MW")
print(f"Total Households: {test_grid.total_households:,}")
print(f"Avg Household Bill: ${test_grid.average_household_bill:.2f}/month\n")

datacenter_results = {}
for dc_name, dc_data in datacenter_scenarios.items():
    print(f"\n{'-'*70}")
    print(f"{dc_name}: {dc_data['description']}")
    print(f"{'-'*70}")
    
    result = calculator.calculate_grid_impact(dc_data['power_profile'], test_grid)
    datacenter_results[dc_name] = result
    
    print(f"Peak Impact:           {result['peak_impact_percent']:.3f}%")
    print(f"Average Impact:        {result['average_impact_percent']:.3f}%")
    print(f"Stability Risk:        {result['stability_risk']}")
    print(f"Impact Classification: {result['grid_classification']}")
    
    infra = result['infrastructure_cost']
    print(f"\nInfrastructure Costs:")
    print(f"  Required:            {'Yes' if infra['required'] else 'No'}")
    print(f"  Transmission:        ${infra['transmission']:,.2f}")
    print(f"  Distribution:        ${infra['distribution']:,.2f}")
    print(f"  Substation:          ${infra['substation']:,.2f}")
    print(f"  Total:               ${infra['total']:,.2f}")
    
    household = result['household_impact']
    print(f"\nHousehold Impact:")
    print(f"  Monthly Cost/House:  ${household['monthly_cost_per_household']:.2f}")
    print(f"  Annual Cost/House:   ${household['annual_cost_per_household']:.2f}")
    print(f"  Bill Increase:       {household['percentage_increase']:.2f}%")
    print(f"  Total Community:     ${household['total_community_cost']:,.2f}/year")

# ============================================
# TEST 2: Same Data Center Across All Grid Regions
# ============================================

print(f"\n\n{'='*70}")
print("TEST 2: Medium Data Center Impact Across All US Grid Regions")
print(f"{'='*70}\n")

# Use medium data center from previous test
medium_dc_profile = datacenter_scenarios["Medium Enterprise"]["power_profile"]

# Define realistic grid scenarios for each region
regional_grids = {
    "CAISO": GridInfo(
        region_code="CAISO",
        baseline_demand_mw=25000,  # California ISO peak ~50 GW
        total_households=13000000,  # ~13M households in CA
        average_household_bill=145.0
    ),
    "ERCOT": GridInfo(
        region_code="ERCOT",
        baseline_demand_mw=40000,  # Texas peak ~85 GW
        total_households=10000000,  # ~10M households in TX
        average_household_bill=115.0
    ),
    "PJM": GridInfo(
        region_code="PJM",
        baseline_demand_mw=80000,  # PJM peak ~165 GW
        total_households=23000000,  # ~23M households in PJM territory
        average_household_bill=125.0
    ),
    "NYISO": GridInfo(
        region_code="NYISO",
        baseline_demand_mw=16000,  # NY peak ~33 GW
        total_households=7500000,  # ~7.5M households in NY
        average_household_bill=150.0
    ),
    "SPP": GridInfo(
        region_code="SPP",
        baseline_demand_mw=25000,  # SPP peak ~52 GW
        total_households=8000000,  # ~8M households in SPP territory
        average_household_bill=105.0
    ),
    "ISONE": GridInfo(
        region_code="ISONE",
        baseline_demand_mw=14000,  # ISO-NE peak ~28 GW
        total_households=5700000,  # ~5.7M households in New England
        average_household_bill=165.0
    ),
    "MISO": GridInfo(
        region_code="MISO",
        baseline_demand_mw=60000,  # MISO peak ~126 GW
        total_households=18000000,  # ~18M households in MISO territory
        average_household_bill=115.0
    ),
    "SERC": GridInfo(
        region_code="SERC",
        baseline_demand_mw=70000,  # Southeast peak ~145 GW
        total_households=22000000,  # ~22M households in Southeast
        average_household_bill=120.0
    ),
    "PACNW": GridInfo(
        region_code="PACNW",
        baseline_demand_mw=18000,  # Pacific NW peak ~37 GW
        total_households=6000000,  # ~6M households in PNW
        average_household_bill=95.0
    ),
    "WEST": GridInfo(
        region_code="WEST",
        baseline_demand_mw=35000,  # Mountain West peak ~72 GW
        total_households=12000000,  # ~12M households in Mountain West
        average_household_bill=110.0
    )
}

regional_results = {}
for region, grid in regional_grids.items():
    result = calculator.calculate_grid_impact(medium_dc_profile, grid)
    regional_results[region] = result
    
    print(f"\n{region}:")
    print(f"  Peak Impact:         {result['peak_impact_percent']:.4f}%")
    print(f"  Stability Risk:      {result['stability_risk']}")
    print(f"  Infra Cost:          ${result['infrastructure_cost']['total']:,.0f}")
    print(f"  Monthly Bill Impact: ${result['household_impact']['monthly_cost_per_household']:.2f} "
          f"({result['household_impact']['percentage_increase']:.3f}%)")

# ============================================
# TEST 3: Stress Testing - Critical Impact Scenarios
# ============================================

print(f"\n\n{'='*70}")
print("TEST 3: Stress Testing - Critical Impact Scenarios")
print(f"{'='*70}\n")

# Small rural grid
small_grid = GridInfo(
    region_code="ERCOT",
    baseline_demand_mw=500,  # Small city/rural area
    total_households=50000,
    average_household_bill=110.0
)

stress_scenarios = {
    "Moderate Load": [1000 for _ in range(8760)],  # 1 MW constant
    "High Load": [5000 for _ in range(8760)],      # 5 MW constant
    "Critical Load": [25000 for _ in range(8760)],  # 25 MW constant (5% of grid)
    "Extreme Load": [100000 for _ in range(8760)]   # 100 MW constant (20% of grid)
}

stress_results = {}
print(f"Small Grid Scenario:")
print(f"  Baseline Demand: {small_grid.baseline_demand_mw} MW")
print(f"  Total Households: {small_grid.total_households:,}\n")

for scenario_name, power_profile in stress_scenarios.items():
    result = calculator.calculate_grid_impact(power_profile, small_grid)
    stress_results[scenario_name] = result
    
    print(f"{scenario_name}:")
    print(f"  DC Peak Power:       {max(power_profile)/1000:.1f} MW")
    print(f"  Peak Impact:         {result['peak_impact_percent']:.2f}%")
    print(f"  Stability Risk:      {result['stability_risk'].upper()}")
    print(f"  Classification:      {result['grid_classification']}")
    print(f"  Infrastructure Cost: ${result['infrastructure_cost']['total']:,.0f}")
    print(f"  Monthly Bill Impact: ${result['household_impact']['monthly_cost_per_household']:.2f}")
    print()

# ============================================
# TEST 4: Energy Cost Calculations by Region
# ============================================

print(f"\n{'='*70}")
print("TEST 4: Regional Energy Cost Comparison")
print(f"{'='*70}\n")

# Calculate annual energy costs for medium datacenter in each region
print(f"Annual Energy Cost for Medium Data Center (3 MW avg, 8760 hours):")
print(f"Annual Consumption: {3 * 8760:,.0f} MWh\n")

annual_mwh = 3 * 8760
cost_analysis = {}

for region_code, region_data in calculator.grid_regions.items():
    if region_code == "DEFAULT":
        continue
    
    # Base cost (off-peak)
    base_cost = annual_mwh * region_data['base_rate']
    
    # Peak cost (assume 20% of hours at peak pricing)
    peak_hours_fraction = 0.2
    off_peak_hours_fraction = 0.8
    
    off_peak_cost = annual_mwh * off_peak_hours_fraction * region_data['base_rate']
    peak_cost = annual_mwh * peak_hours_fraction * region_data['base_rate'] * region_data['peak_multiplier']
    total_cost = off_peak_cost + peak_cost
    
    # Carbon emissions
    carbon_tons = annual_mwh * region_data['carbon_intensity'] / 1000
    
    cost_analysis[region_code] = {
        'base_cost': base_cost,
        'total_cost': total_cost,
        'carbon_tons': carbon_tons,
        'cost_per_mwh': total_cost / annual_mwh
    }

# Sort by total cost
sorted_costs = sorted(cost_analysis.items(), key=lambda x: x[1]['total_cost'])

print(f"{'Region':<10} {'Total Cost':<15} {'$/MWh':<12} {'CO₂ (tons)':<12} {'Rating'}")
print(f"{'-'*70}")
for region, data in sorted_costs:
    rating = "🟢 LOW" if data['total_cost'] < 2500000 else "🟡 MED" if data['total_cost'] < 3000000 else "🔴 HIGH"
    print(f"{region:<10} ${data['total_cost']:>13,.0f} ${data['cost_per_mwh']:>10.2f}  {data['carbon_tons']:>10,.0f}  {rating}")

# ============================================
# VISUALIZATIONS
# ============================================

print(f"\n\n{'='*70}")
print("GENERATING VISUALIZATIONS")
print(f"{'='*70}\n")

fig = plt.figure(figsize=(18, 12))

# Plot 1: Impact by Data Center Size
ax1 = plt.subplot(2, 3, 1)
dc_names = list(datacenter_results.keys())
peak_impacts = [datacenter_results[dc]['peak_impact_percent'] for dc in dc_names]
colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
bars = ax1.bar(range(len(dc_names)), peak_impacts, color=colors, alpha=0.7, edgecolor='black')
ax1.set_xticks(range(len(dc_names)))
ax1.set_xticklabels(dc_names, rotation=45, ha='right')
ax1.set_ylabel('Peak Impact (%)')
ax1.set_title('Grid Impact by Data Center Size', fontweight='bold')
ax1.grid(True, alpha=0.3, axis='y')

# Add value labels on bars
for bar in bars:
    height = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2., height,
             f'{height:.3f}%', ha='center', va='bottom', fontsize=9)

# Plot 2: Stability Risk by Data Center Size
ax2 = plt.subplot(2, 3, 2)
risk_levels = {'low': 0, 'moderate': 1, 'high': 2, 'critical': 3}
risk_values = [risk_levels[datacenter_results[dc]['stability_risk']] for dc in dc_names]
risk_colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
bars = ax2.bar(range(len(dc_names)), risk_values, color=[risk_colors[v] for v in risk_values], 
               alpha=0.7, edgecolor='black')
ax2.set_xticks(range(len(dc_names)))
ax2.set_xticklabels(dc_names, rotation=45, ha='right')
ax2.set_yticks([0, 1, 2, 3])
ax2.set_yticklabels(['Low', 'Moderate', 'High', 'Critical'])
ax2.set_title('Stability Risk Assessment', fontweight='bold')
ax2.grid(True, alpha=0.3, axis='y')

# Plot 3: Infrastructure Costs by Data Center Size
ax3 = plt.subplot(2, 3, 3)
infra_costs = [datacenter_results[dc]['infrastructure_cost']['total']/1e6 for dc in dc_names]
bars = ax3.bar(range(len(dc_names)), infra_costs, color='#8b5cf6', alpha=0.7, edgecolor='black')
ax3.set_xticks(range(len(dc_names)))
ax3.set_xticklabels(dc_names, rotation=45, ha='right')
ax3.set_ylabel('Cost ($ Millions)')
ax3.set_title('Infrastructure Upgrade Costs', fontweight='bold')
ax3.grid(True, alpha=0.3, axis='y')

# Add value labels
for bar in bars:
    height = bar.get_height()
    ax3.text(bar.get_x() + bar.get_width()/2., height,
             f'${height:.1f}M', ha='center', va='bottom', fontsize=9)

# Plot 4: Regional Impact Comparison
ax4 = plt.subplot(2, 3, 4)
regions = list(regional_results.keys())
regional_impacts = [regional_results[r]['peak_impact_percent'] for r in regions]
bars = ax4.barh(range(len(regions)), regional_impacts, color='#2563eb', alpha=0.7, edgecolor='black')
ax4.set_yticks(range(len(regions)))
ax4.set_yticklabels(regions)
ax4.set_xlabel('Peak Impact (%)')
ax4.set_title('Medium DC Impact by Grid Region', fontweight='bold')
ax4.grid(True, alpha=0.3, axis='x')

# Plot 5: Energy Cost by Region
ax5 = plt.subplot(2, 3, 5)
cost_regions = [item[0] for item in sorted_costs]
cost_values = [item[1]['total_cost']/1e6 for item in sorted_costs]
colors_gradient = plt.cm.RdYlGn_r(np.linspace(0, 1, len(cost_regions)))
bars = ax5.barh(range(len(cost_regions)), cost_values, color=colors_gradient, alpha=0.7, edgecolor='black')
ax5.set_yticks(range(len(cost_regions)))
ax5.set_yticklabels(cost_regions)
ax5.set_xlabel('Annual Cost ($ Millions)')
ax5.set_title('Annual Energy Cost by Region', fontweight='bold')
ax5.grid(True, alpha=0.3, axis='x')

# Plot 6: Carbon Emissions by Region
ax6 = plt.subplot(2, 3, 6)
carbon_regions = [item[0] for item in sorted_costs]
carbon_values = [item[1]['carbon_tons'] for item in sorted_costs]
colors_carbon = plt.cm.Greens_r(np.linspace(0.3, 1, len(carbon_regions)))
bars = ax6.barh(range(len(carbon_regions)), carbon_values, color=colors_carbon, alpha=0.7, edgecolor='black')
ax6.set_yticks(range(len(carbon_regions)))
ax6.set_yticklabels(carbon_regions)
ax6.set_xlabel('CO₂ Emissions (tons/year)')
ax6.set_title('Annual Carbon Footprint by Region', fontweight='bold')
ax6.grid(True, alpha=0.3, axis='x')

plt.suptitle('Grid Impact Analysis - Comprehensive Test Results', 
             fontsize=16, fontweight='bold', y=0.995)
plt.tight_layout()
plt.show()

# ============================================
# Additional Visualization: Stress Test Results
# ============================================

fig2, axes = plt.subplots(2, 2, figsize=(14, 10))
fig2.suptitle('Stress Test: Small Grid with Varying Data Center Loads', 
              fontsize=14, fontweight='bold')

# Plot 1: Peak Impact Percentage
ax1 = axes[0, 0]
stress_names = list(stress_results.keys())
stress_impacts = [stress_results[s]['peak_impact_percent'] for s in stress_names]
colors = ['#10b981', '#f59e0b', '#ef4444', '#7f1d1d']
bars = ax1.bar(range(len(stress_names)), stress_impacts, color=colors, alpha=0.7, edgecolor='black')
ax1.set_xticks(range(len(stress_names)))
ax1.set_xticklabels(stress_names, rotation=45, ha='right')
ax1.set_ylabel('Peak Impact (%)')
ax1.set_title('Grid Impact Percentage', fontweight='bold')
ax1.grid(True, alpha=0.3, axis='y')
ax1.axhline(y=5, color='red', linestyle='--', linewidth=2, alpha=0.5, label='Critical Threshold (5%)')
ax1.legend()

# Plot 2: Infrastructure Costs
ax2 = axes[0, 1]
stress_infra_costs = [stress_results[s]['infrastructure_cost']['total']/1e6 for s in stress_names]
bars = ax2.bar(range(len(stress_names)), stress_infra_costs, color=colors, alpha=0.7, edgecolor='black')
ax2.set_xticks(range(len(stress_names)))
ax2.set_xticklabels(stress_names, rotation=45, ha='right')
ax2.set_ylabel('Cost ($ Millions)')
ax2.set_title('Infrastructure Investment Required', fontweight='bold')
ax2.grid(True, alpha=0.3, axis='y')

# Plot 3: Monthly Household Bill Impact
ax3 = axes[1, 0]
stress_bills = [stress_results[s]['household_impact']['monthly_cost_per_household'] for s in stress_names]
bars = ax3.bar(range(len(stress_names)), stress_bills, color=colors, alpha=0.7, edgecolor='black')
ax3.set_xticks(range(len(stress_names)))
ax3.set_xticklabels(stress_names, rotation=45, ha='right')
ax3.set_ylabel('Monthly Cost ($)')
ax3.set_title('Household Bill Increase', fontweight='bold')
ax3.grid(True, alpha=0.3, axis='y')

# Plot 4: Stability Risk Level
ax4 = axes[1, 1]
risk_mapping = {'low': 1, 'moderate': 2, 'high': 3, 'critical': 4}
stress_risks = [risk_mapping[stress_results[s]['stability_risk']] for s in stress_names]
bars = ax4.bar(range(len(stress_names)), stress_risks, color=colors, alpha=0.7, edgecolor='black')
ax4.set_xticks(range(len(stress_names)))
ax4.set_xticklabels(stress_names, rotation=45, ha='right')
ax4.set_yticks([1, 2, 3, 4])
ax4.set_yticklabels(['Low', 'Moderate', 'High', 'Critical'])
ax4.set_title('Grid Stability Risk', fontweight='bold')
ax4.grid(True, alpha=0.3, axis='y')
ax4.axhline(y=3, color='red', linestyle='--', linewidth=2, alpha=0.5, label='High Risk Threshold')
ax4.legend()

plt.tight_layout()
plt.show()

# ============================================
# SUMMARY STATISTICS
# ============================================

print(f"\n{'='*70}")
print("SUMMARY STATISTICS")
print(f"{'='*70}\n")

print("Key Findings:")
print(f"{'='*70}")
print(f"\n1. DATA CENTER SIZE IMPACT:")
print(f"   - Small Edge:       {datacenter_results['Small Edge']['peak_impact_percent']:.4f}% grid impact")
print(f"   - Medium Enterprise: {datacenter_results['Medium Enterprise']['peak_impact_percent']:.4f}% grid impact")
print(f"   - Large Colocation: {datacenter_results['Large Colocation']['peak_impact_percent']:.4f}% grid impact")
print(f"   - Hyperscale:       {datacenter_results['Hyperscale']['peak_impact_percent']:.3f}% grid impact")

print(f"\n2. REGIONAL VARIATIONS:")
print(f"   - Lowest Impact:  {min(regional_results.items(), key=lambda x: x[1]['peak_impact_percent'])[0]} "
      f"({min(regional_results.items(), key=lambda x: x[1]['peak_impact_percent'])[1]['peak_impact_percent']:.4f}%)")
print(f"   - Highest Impact: {max(regional_results.items(), key=lambda x: x[1]['peak_impact_percent'])[0]} "
      f"({max(regional_results.items(), key=lambda x: x[1]['peak_impact_percent'])[1]['peak_impact_percent']:.4f}%)")

print(f"\n3. COST ANALYSIS:")
print(f"   - Cheapest Region: {sorted_costs[0][0]} (${sorted_costs[0][1]['total_cost']:,.0f}/year)")
print(f"   - Most Expensive:  {sorted_costs[-1][0]} (${sorted_costs[-1][1]['total_cost']:,.0f}/year)")
print(f"   - Cost Difference: ${sorted_costs[-1][1]['total_cost'] - sorted_costs[0][1]['total_cost']:,.0f}/year ({((sorted_costs[-1][1]['total_cost'] / sorted_costs[0][1]['total_cost']) - 1) * 100:.1f}%)")

print(f"\n4. CARBON FOOTPRINT:")
cleanest = min(cost_analysis.items(), key=lambda x: x[1]['carbon_tons'])
dirtiest = max(cost_analysis.items(), key=lambda x: x[1]['carbon_tons'])
print(f"   - Cleanest Grid:   {cleanest[0]} ({cleanest[1]['carbon_tons']:,.0f} tons CO₂/year)")
print(f"   - Dirtiest Grid:   {dirtiest[0]} ({dirtiest[1]['carbon_tons']:,.0f} tons CO₂/year)")
print(f"   - Difference:      {dirtiest[1]['carbon_tons'] - cleanest[1]['carbon_tons']:,.0f} tons ({((dirtiest[1]['carbon_tons'] / cleanest[1]['carbon_tons']) - 1) * 100:.1f}%)")

print(f"\n5. STRESS TEST RESULTS (Small 500 MW Grid):")
for scenario_name in stress_scenarios.keys():
    result = stress_results[scenario_name]
    print(f"   - {scenario_name}: {result['stability_risk'].upper()} risk, "
          f"${result['household_impact']['monthly_cost_per_household']:.2f}/month household impact")

print(f"\n{'='*70}")
print("✅ All tests completed successfully!")
print("📊 Visualizations generated showing comprehensive grid impact analysis")
print(f"{'='*70}\n")

