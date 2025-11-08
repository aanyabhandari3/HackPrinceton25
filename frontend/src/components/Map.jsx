import React, { useState, useCallback } from 'react'
import MapGL, { Marker, NavigationControl } from 'react-map-gl'
import { MapPin } from 'lucide-react'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export default function Map({ onLocationSelect, selectedLocation }) {
  const [viewState, setViewState] = useState({
    longitude: -95.7129,
    latitude: 37.0902,
    zoom: 4
  })

  const handleClick = useCallback((event) => {
    const { lngLat } = event
    onLocationSelect({ lng: lngLat.lng, lat: lngLat.lat })
  }, [onLocationSelect])

  return (
    <div className="w-full h-full">
      <MapGL
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onClick={handleClick}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        
        {selectedLocation && (
          <Marker
            longitude={selectedLocation.lng}
            latitude={selectedLocation.lat}
            anchor="bottom"
          >
            <div className="relative">
              <MapPin 
                className="w-10 h-10 text-red-500 drop-shadow-lg animate-bounce" 
                fill="currentColor"
              />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-black opacity-20 rounded-full blur-sm"></div>
            </div>
          </Marker>
        )}
      </MapGL>
      
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-gray-700">💡 Instructions:</p>
        <p className="text-gray-600 mt-1">Click anywhere on the map to place a data center</p>
      </div>
    </div>
  )
}

