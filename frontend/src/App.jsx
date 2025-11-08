import React, { useState, useCallback } from 'react'
import Map from './components/Map'
import DataCenterConfig from './components/DataCenterConfig'
import Report from './components/Report'
import Header from './components/Header'
import LoadingSpinner from './components/LoadingSpinner'
import axios from 'axios'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [dataCenterConfig, setDataCenterConfig] = useState({
    size: 'medium',
    custom: false,
    name: '',
    power_mw: 10,
    servers: 1000,
    square_feet: 50000,
    water_gallons_per_day: 300000,
    employees: 50
  })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLocationSelect = useCallback((lngLat) => {
    setSelectedLocation(lngLat)
    setReport(null)
    setError(null)
  }, [])

  const handleAnalyze = async () => {
    if (!selectedLocation) {
      setError('Please select a location on the map first')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const payload = {
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        ...dataCenterConfig
      }

      const response = await axios.post('/api/analyze', payload)
      setReport(response.data)
    } catch (err) {
      console.error('Error analyzing location:', err)
      setError(err.response?.data?.error || 'Failed to analyze location. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedLocation(null)
    setReport(null)
    setError(null)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Configuration */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
          <DataCenterConfig
            config={dataCenterConfig}
            onChange={setDataCenterConfig}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
            hasLocation={!!selectedLocation}
            loading={loading}
          />
          
          {error && (
            <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {selectedLocation && (
            <div className="mx-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 font-medium">Selected Location:</p>
              <p className="text-xs text-blue-700 mt-1">
                Lat: {selectedLocation.lat.toFixed(4)}, Lng: {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        {/* Center - Map */}
        <div className="flex-1 relative">
          <Map
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
          />
          
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
              <LoadingSpinner />
            </div>
          )}
        </div>

        {/* Right Sidebar - Report */}
        {report && (
          <div className="w-1/3 bg-white border-l border-gray-200 overflow-y-auto">
            <Report data={report} />
          </div>
        )}
      </div>
    </div>
  )
}

export default App

