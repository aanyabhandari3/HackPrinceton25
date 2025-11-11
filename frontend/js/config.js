// Configuration and Constants

// Mapbox Configuration
export const MAPBOX_CONFIG = {
    accessToken: 'pk.eyJ1Ijoic2dhZGUiLCJhIjoiY21ocW5hd2E0MG55ZjJqcHVxZG5yYXdyMiJ9.2EsEH2scEi6XA9bV4Kl98Q',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-95.7129, 37.0902], // Center of USA
    zoom: 4
};

// Data Center Presets
export const DATA_CENTER_TYPES = {
    small: {
        name: 'Small Edge Data Center',
        power_mw: 1,
        servers: 100,
        square_feet: 5000,
        water_gallons_per_day: 25000,
        employees: 10
    },
    medium: {
        name: 'Medium Enterprise Data Center',
        power_mw: 10,
        servers: 1000,
        square_feet: 50000,
        water_gallons_per_day: 300000,
        employees: 50
    },
    large: {
        name: 'Large Hyperscale Data Center',
        power_mw: 50,
        servers: 10000,
        square_feet: 250000,
        water_gallons_per_day: 1500000,
        employees: 200
    },
    mega: {
        name: 'Mega Hyperscale Data Center',
        power_mw: 150,
        servers: 50000,
        square_feet: 750000,
        water_gallons_per_day: 5000000,
        employees: 500
    }
};

// API Configuration
// Use relative URLs in production (nginx will proxy), absolute in development
const getApiBaseUrl = () => {
    // Check if running in production (served via nginx)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Production: use relative URLs (nginx proxy handles it)
        return '';
    }
    
    // Development: use environment variable or default to localhost
    return import.meta.env.VITE_API_URL;
};

export const API_CONFIG = {
    baseUrl: getApiBaseUrl(),
    endpoints: {
        analyze: '/api/analyze/stream',
        dataCenterTypes: '/api/datacenter-types'
    }
};

