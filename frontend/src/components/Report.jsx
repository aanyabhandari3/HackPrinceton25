import React from 'react'
import ReactMarkdown from 'react-markdown'
import { 
  Zap, 
  Droplets, 
  Cloud, 
  DollarSign, 
  TrendingUp, 
  Users, 
  MapPin,
  ThermometerSun,
  FileText
} from 'lucide-react'

export default function Report({ data }) {
  const { location, datacenter, impact, climate, energy_pricing, analysis } = data

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Impact Report</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{location.name}</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricCard
          icon={<Zap className="w-5 h-5" />}
          title="Energy Impact"
          value={`${impact.energy.percent_increase.toFixed(2)}%`}
          subtitle="Increase in regional demand"
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        
        <MetricCard
          icon={<Droplets className="w-5 h-5" />}
          title="Water Impact"
          value={`${impact.water.percent_increase.toFixed(2)}%`}
          subtitle="Increase in water usage"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        
        <MetricCard
          icon={<Cloud className="w-5 h-5" />}
          title="CO₂ Emissions"
          value={`${(impact.carbon.annual_tons_co2 / 1000).toFixed(1)}k`}
          subtitle="Tons per year"
          color="text-gray-600"
          bgColor="bg-gray-50"
        />
        
        <MetricCard
          icon={<DollarSign className="w-5 h-5" />}
          title="Per Household"
          value={`$${impact.energy.cost_per_household_annually.toFixed(2)}`}
          subtitle="Additional annual cost"
          color="text-green-600"
          bgColor="bg-green-50"
        />
      </div>

      {/* Detailed Sections */}
      <div className="space-y-4 mb-6">
        <DetailSection
          title="Energy Consumption"
          icon={<Zap className="w-5 h-5" />}
          color="text-yellow-600"
        >
          <DetailItem label="Annual Usage" value={`${impact.energy.annual_mwh.toLocaleString()} MWh`} />
          <DetailItem label="Annual Cost" value={`$${impact.energy.annual_cost.toLocaleString()}`} />
          <DetailItem label="Electricity Rate" value={`$${energy_pricing.price_per_kwh.toFixed(3)}/kWh`} />
          <DetailItem label="Equivalent Homes" value={impact.carbon.equivalent_homes.toLocaleString()} />
        </DetailSection>

        <DetailSection
          title="Carbon Footprint"
          icon={<Cloud className="w-5 h-5" />}
          color="text-gray-600"
        >
          <DetailItem label="Annual Emissions" value={`${impact.carbon.annual_tons_co2.toLocaleString()} tons CO₂`} />
          <DetailItem label="Equivalent Cars" value={Math.round(impact.carbon.equivalent_cars).toLocaleString()} />
        </DetailSection>

        <DetailSection
          title="Water Resources"
          icon={<Droplets className="w-5 h-5" />}
          color="text-blue-600"
        >
          <DetailItem label="Daily Usage" value={`${impact.water.daily_gallons.toLocaleString()} gallons`} />
          <DetailItem label="Annual Usage" value={`${(impact.water.annual_gallons / 1000000).toFixed(2)}M gallons`} />
          <DetailItem label="Olympic Pools/Year" value={impact.water.olympic_pools_per_year.toFixed(1)} />
        </DetailSection>

        <DetailSection
          title="Economic Impact"
          icon={<DollarSign className="w-5 h-5" />}
          color="text-green-600"
        >
          <DetailItem label="Jobs Created" value={impact.economic.jobs_created.toLocaleString()} />
          <DetailItem label="Construction Cost" value={`$${(impact.economic.estimated_construction_cost / 1000000).toFixed(0)}M`} />
          <DetailItem label="Annual Operating Cost" value={`$${(impact.economic.annual_operating_cost / 1000000).toFixed(1)}M`} />
        </DetailSection>

        <DetailSection
          title="Local Conditions"
          icon={<ThermometerSun className="w-5 h-5" />}
          color="text-orange-600"
        >
          <DetailItem label="Temperature" value={`${climate.temperature}°F`} />
          <DetailItem label="Humidity" value={`${climate.humidity}%`} />
          <DetailItem label="Population" value={location.population.toLocaleString()} />
          <DetailItem label="Median Income" value={`$${location.median_income.toLocaleString()}`} />
        </DetailSection>
      </div>

      {/* LLM Analysis */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-800">AI Analysis</h3>
        </div>
        <div className="prose prose-sm max-w-none text-gray-700">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, title, value, subtitle, color, bgColor }) {
  return (
    <div className={`${bgColor} rounded-lg p-4 border border-opacity-20`}>
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-xs text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
    </div>
  )
}

function DetailSection({ title, icon, color, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className={color}>{icon}</div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}:</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  )
}

