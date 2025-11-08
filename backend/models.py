from services import ServerPowerModel, WorkloadSimulator
from matplotlib import pyplot as plt
import numpy as np

# ============================================
# TEST: Realistic Power Consumption Over Time
# ============================================
# This demonstrates how to calculate actual power consumption
# based on realistic workload patterns instead of assuming 100% utilization

# Define data center specifications (Medium Enterprise example)
datacenter_specs = {
    'name': 'Medium Enterprise Data Center',
    'num_servers': 1000,
    'max_power_per_server_watts': 500,  # 500W per server at max load
    'datacenter_type': 'enterprise',
    'server_type': 'enterprise'
}

# Initialize simulator and power model
simulator = WorkloadSimulator()
power_model = ServerPowerModel(datacenter_specs['server_type'])

# Calculate realistic power consumption over full year
hourly_power_kw = []
hourly_utilization = []
hourly_efficiency = []

print(f"\n{'='*60}")
print(f"Testing: {datacenter_specs['name']}")
print(f"Servers: {datacenter_specs['num_servers']}")
print(f"Max Power per Server: {datacenter_specs['max_power_per_server_watts']}W")
print(f"{'='*60}\n")

for hour in range(24):
    for day in range(7):
        for month in range(1, 13):
            # Get utilization from simulator
            utilization = simulator.simulate_utilization(
                hour, 
                day, 
                datacenter_specs['datacenter_type'], 
                month
            )
            
            # Convert to actual power consumption per server
            power_per_server_w = power_model.get_power_consumption(
                datacenter_specs['max_power_per_server_watts'], 
                utilization
            )
            
            # Calculate total data center power
            total_power_kw = (power_per_server_w * datacenter_specs['num_servers']) / 1000
            
            # Get efficiency rating
            efficiency_rating, power_ratio = power_model.get_server_efficiency_rating(utilization)
            
            # Store data
            hourly_power_kw.append(total_power_kw)
            hourly_utilization.append(utilization)
            hourly_efficiency.append(power_ratio)

# Calculate comprehensive statistics
annual_kwh = sum(hourly_power_kw)  # Total energy consumed in a year
peak_power_kw = max(hourly_power_kw)
average_power_kw = sum(hourly_power_kw) / len(hourly_power_kw)
min_power_kw = min(hourly_power_kw)

# Calculate theoretical maximum (if running at 100% 24/7)
max_power_kw = (datacenter_specs['max_power_per_server_watts'] * datacenter_specs['num_servers']) / 1000
theoretical_max_kwh = max_power_kw * 24 * 365

# Calculate savings
energy_savings_kwh = theoretical_max_kwh - annual_kwh
energy_savings_percent = (energy_savings_kwh / theoretical_max_kwh) * 100

# Cost calculations (assuming $0.11/kWh)
price_per_kwh = 0.11
actual_cost = annual_kwh * price_per_kwh
theoretical_cost = theoretical_max_kwh * price_per_kwh
cost_savings = theoretical_cost - actual_cost

# Carbon calculations (0.92 lbs CO2 per kWh)
actual_co2_tons = (annual_kwh * 0.92) / 2000
theoretical_co2_tons = (theoretical_max_kwh * 0.92) / 2000
co2_savings_tons = theoretical_co2_tons - actual_co2_tons

# Average utilization
avg_utilization = sum(hourly_utilization) / len(hourly_utilization)

# Print results
print("REALISTIC POWER CONSUMPTION ANALYSIS")
print(f"\n{'='*60}")
print("POWER METRICS:")
print(f"{'='*60}")
print(f"Peak Power:            {peak_power_kw:>12,.2f} kW")
print(f"Average Power:         {average_power_kw:>12,.2f} kW ({(average_power_kw/max_power_kw)*100:.1f}% of max)")
print(f"Minimum Power:         {min_power_kw:>12,.2f} kW")
print(f"Maximum Capacity:      {max_power_kw:>12,.2f} kW")
print(f"Average Utilization:   {avg_utilization:>12,.1f}%")

print(f"\n{'='*60}")
print("ANNUAL ENERGY:")
print(f"{'='*60}")
print(f"Realistic Consumption: {annual_kwh:>12,.0f} kWh ({annual_kwh/1000:,.0f} MWh)")
print(f"Theoretical Maximum:   {theoretical_max_kwh:>12,.0f} kWh ({theoretical_max_kwh/1000:,.0f} MWh)")
print(f"Energy Savings:        {energy_savings_kwh:>12,.0f} kWh ({energy_savings_percent:.1f}%)")

print(f"\n{'='*60}")
print("COST IMPACT:")
print(f"{'='*60}")
print(f"Realistic Annual Cost: ${actual_cost:>12,.2f}")
print(f"Theoretical Max Cost:  ${theoretical_cost:>12,.2f}")
print(f"Cost Savings:          ${cost_savings:>12,.2f}")

print(f"\n{'='*60}")
print("CARBON IMPACT:")
print(f"{'='*60}")
print(f"Realistic CO2:         {actual_co2_tons:>12,.0f} tons/year")
print(f"Theoretical CO2:       {theoretical_co2_tons:>12,.0f} tons/year")
print(f"CO2 Savings:           {co2_savings_tons:>12,.0f} tons/year")
print(f"Equivalent Cars:       {actual_co2_tons/4.6:>12,.0f} cars")

print(f"\n{'='*60}")
print("EFFICIENCY ANALYSIS:")
print(f"{'='*60}")
avg_power_ratio = sum(hourly_efficiency) / len(hourly_efficiency)
print(f"Average Power Ratio:   {avg_power_ratio:>12.2%}")

# Count efficiency ratings
excellent = sum(1 for e in hourly_efficiency if e < 0.65)
good = sum(1 for e in hourly_efficiency if 0.65 <= e < 0.75)
fair = sum(1 for e in hourly_efficiency if 0.75 <= e < 0.85)
poor = sum(1 for e in hourly_efficiency if e >= 0.85)
total = len(hourly_efficiency)

print(f"Excellent (<65%):      {excellent:>12,} hours ({excellent/total*100:.1f}%)")
print(f"Good (65-75%):         {good:>12,} hours ({good/total*100:.1f}%)")
print(f"Fair (75-85%):         {fair:>12,} hours ({fair/total*100:.1f}%)")
print(f"Poor (>85%):           {poor:>12,} hours ({poor/total*100:.1f}%)")

print(f"\n{'='*60}\n")

# ============================================
# VISUALIZATION: Power Consumption Over Time
# ============================================

fig, axes = plt.subplots(2, 2, figsize=(16, 10))
fig.suptitle('Realistic Data Center Power Consumption Analysis', fontsize=16, fontweight='bold')

# Plot 1: Power Consumption Over Time
ax1 = axes[0, 0]
x_values = list(range(len(hourly_power_kw)))
ax1.plot(x_values, hourly_power_kw, linewidth=1, color='#2563eb', alpha=0.7)
ax1.axhline(y=average_power_kw, color='red', linestyle='--', linewidth=2, 
            label=f'Average: {average_power_kw:.0f} kW')
ax1.axhline(y=max_power_kw, color='orange', linestyle=':', linewidth=2, 
            label=f'Max Capacity: {max_power_kw:.0f} kW')
ax1.set_title('Hourly Power Consumption', fontweight='bold')
ax1.set_xlabel('Time (Hours → Days → Months)')
ax1.set_ylabel('Power (kW)')
ax1.grid(True, alpha=0.3)
ax1.legend()

# Plot 2: Utilization Distribution
ax2 = axes[0, 1]
ax2.hist(hourly_utilization, bins=50, color='#10b981', alpha=0.7, edgecolor='black')
ax2.axvline(x=avg_utilization, color='red', linestyle='--', linewidth=2,
            label=f'Mean: {avg_utilization:.1f}%')
ax2.set_title('Utilization Distribution', fontweight='bold')
ax2.set_xlabel('Utilization (%)')
ax2.set_ylabel('Frequency')
ax2.legend()
ax2.grid(True, alpha=0.3)

# Plot 3: Daily Pattern (Average by Hour)
ax3 = axes[1, 0]
# Calculate average power for each hour of day
# Remember: data is structured as hour (outer) -> day -> month (inner)
# So hour changes every 84 points (7 days × 12 months)
hourly_avg = []
for h in range(24):
    hour_data = [hourly_power_kw[i] for i in range(len(hourly_power_kw)) 
                 if i // 84 == h]  # Extract hour from index
    if hour_data:
        hourly_avg.append(sum(hour_data) / len(hour_data))
    else:
        hourly_avg.append(0)

ax3.bar(range(24), hourly_avg, color='#8b5cf6', alpha=0.7, edgecolor='black')
ax3.set_title('Average Power by Hour of Day', fontweight='bold')
ax3.set_xlabel('Hour of Day')
ax3.set_ylabel('Average Power (kW)')
ax3.set_xticks(range(0, 24, 2))
ax3.grid(True, alpha=0.3, axis='y')

# Plot 4: Efficiency Rating Distribution
ax4 = axes[1, 1]
categories = ['Excellent\n(<65%)', 'Good\n(65-75%)', 'Fair\n(75-85%)', 'Poor\n(>85%)']
counts = [excellent, good, fair, poor]
colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
ax4.bar(categories, counts, color=colors, alpha=0.7, edgecolor='black')
ax4.set_title('Efficiency Rating Distribution', fontweight='bold')
ax4.set_ylabel('Number of Hours')
ax4.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.show()

print("✅ Test completed successfully!")
print("📊 Visualizations generated showing realistic power consumption patterns")