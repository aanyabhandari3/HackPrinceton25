import React, { useState, useEffect } from 'react'
import { Settings, Zap, Server, Square, Droplets, Users, Play, RotateCcw } from 'lucide-react'
import axios from 'axios'

export default function DataCenterConfig({ config, onChange, onAnalyze, onReset, hasLocation, loading }) {
  const [dataCenterTypes, setDataCenterTypes] = useState({})
  const [showCustom, setShowCustom] = useState(false)

  useEffect(() => {
    // Fetch available data center types
    axios.get('/api/datacenter-types')
      .then(response => setDataCenterTypes(response.data))
      .catch(error => console.error('Error fetching data center types:', error))
  }, [])

  const handleSizeChange = (size) => {
    const type = dataCenterTypes[size]
    if (type) {
      onChange({
        size,
        custom: false,
        name: type.name,
        power_mw: type.power_mw,
        servers: type.servers,
        square_feet: type.square_feet,
        water_gallons_per_day: type.water_gallons_per_day,
        employees: type.employees
      })
    }
    setShowCustom(false)
  }

  const handleCustomChange = (field, value) => {
    onChange({
      ...config,
      custom: true,
      [field]: parseFloat(value) || value
    })
  }

  const toggleCustom = () => {
    setShowCustom(!showCustom)
    if (!showCustom) {
      onChange({ ...config, custom: true })
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Configure Data Center</h2>
      </div>

      {/* Preset Sizes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Size Preset
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(dataCenterTypes).map(([key, type]) => (
            <button
              key={key}
              onClick={() => handleSizeChange(key)}
              className={`p-3 rounded-lg border-2 transition-all ${
                config.size === key && !config.custom
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="font-semibold capitalize text-sm">{key}</div>
              <div className="text-xs text-gray-500 mt-1">{type.power_mw} MW</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Toggle */}
      <button
        onClick={toggleCustom}
        className="w-full mb-4 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
      >
        {showCustom ? '← Back to Presets' : '⚙️ Custom Configuration'}
      </button>

      {/* Custom Configuration */}
      {showCustom && (
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => handleCustomChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="My Data Center"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 mb-1">
              <Zap className="w-4 h-4" />
              <span>Power (MW)</span>
            </label>
            <input
              type="number"
              value={config.power_mw}
              onChange={(e) => handleCustomChange('power_mw', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 mb-1">
              <Server className="w-4 h-4" />
              <span>Number of Servers</span>
            </label>
            <input
              type="number"
              value={config.servers}
              onChange={(e) => handleCustomChange('servers', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="0"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 mb-1">
              <Square className="w-4 h-4" />
              <span>Size (sq ft)</span>
            </label>
            <input
              type="number"
              value={config.square_feet}
              onChange={(e) => handleCustomChange('square_feet', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="0"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 mb-1">
              <Droplets className="w-4 h-4" />
              <span>Water Usage (gallons/day)</span>
            </label>
            <input
              type="number"
              value={config.water_gallons_per_day}
              onChange={(e) => handleCustomChange('water_gallons_per_day', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="0"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 mb-1">
              <Users className="w-4 h-4" />
              <span>Employees</span>
            </label>
            <input
              type="number"
              value={config.employees}
              onChange={(e) => handleCustomChange('employees', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="0"
            />
          </div>
        </div>
      )}

      {/* Current Configuration Summary */}
      {!showCustom && config.size && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            {dataCenterTypes[config.size]?.name}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>{config.power_mw} MW</span>
            </div>
            <div className="flex items-center space-x-1">
              <Server className="w-3 h-3" />
              <span>{config.servers.toLocaleString()} servers</span>
            </div>
            <div className="flex items-center space-x-1">
              <Square className="w-3 h-3" />
              <span>{config.square_feet.toLocaleString()} sq ft</span>
            </div>
            <div className="flex items-center space-x-1">
              <Droplets className="w-3 h-3" />
              <span>{(config.water_gallons_per_day / 1000).toFixed(0)}k gal/day</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={onAnalyze}
          disabled={!hasLocation || loading}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all ${
            !hasLocation || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <Play className="w-5 h-5" />
          <span>{loading ? 'Analyzing...' : 'Analyze Impact'}</span>
        </button>

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}

