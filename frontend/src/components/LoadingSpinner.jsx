import React from 'react'

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <div className="bg-white px-6 py-3 rounded-lg shadow-lg">
        <p className="text-gray-700 font-medium">Analyzing impact...</p>
        <p className="text-gray-500 text-sm mt-1">Gathering data from multiple sources</p>
      </div>
    </div>
  )
}

