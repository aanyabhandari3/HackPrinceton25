import React from 'react'
import { Database, MapPin, TrendingUp } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Data Center Impact Analyzer</h1>
              <p className="text-blue-100 text-sm">
                Analyze environmental and economic impact of data centers across the USA
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Select Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>View Impact</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

