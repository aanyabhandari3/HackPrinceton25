// Forecast Page - Heatmap Visualization
// Implements a circular heatmap overlay showing ~5 mile radius impact zone

import { MAPBOX_CONFIG } from './config.js';
import { stateManager } from './state.js';

class ForecastMap {
    constructor() {
        this.map = null;
        this.currentMarker = null;
        this.selectedLocation = null;
        this.heatmapVisible = true;
        this.heatmapSourceId = 'impact-heatmap';
        this.heatmapLayerId = 'impact-heat';
        this.circleLayerId = 'impact-circle';
    }

    initialize() {
        // Set Mapbox access token
        mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

        // Create map with monochrome night theme (like the example)
        this.map = new mapboxgl.Map({
            container: 'forecast-map',
            style: 'mapbox://styles/mapbox/standard',
            config: {
                basemap: {
                    theme: 'monochrome',
                    lightPreset: 'night'
                }
            },
            center: MAPBOX_CONFIG.center,
            zoom: 4,
            minZoom: 3,  // Prevent zooming out too far
            maxZoom: 10   // Prevent zooming in too close (keeps heatmap smooth)
        });

        // Add navigation controls
        this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Setup map when loaded
        this.map.on('load', () => {
            console.log('Forecast map loaded successfully! ✅');
            this.setupHeatmapLayer();
            
            // Load cached state and auto-place marker if available
            this.loadCachedState();
        });

        // Add click handler
        this.map.on('click', (e) => this.handleMapClick(e));

        return this.map;
    }

    setupHeatmapLayer() {
        // Create initial empty GeoJSON source for the heatmap
        this.map.addSource(this.heatmapSourceId, {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': []
            }
        });

        // Add heatmap layer
        this.map.addLayer({
            'id': this.heatmapLayerId,
            'type': 'heatmap',
            'source': this.heatmapSourceId,
            'maxzoom': 15,
            'paint': {
                // Weight for heatmap points
                'heatmap-weight': [
                    'interpolate',
                    ['linear'],
                    ['get', 'impact'],
                    0, 0,
                    10, 1
                ],
                // Intensity multiplier based on zoom
                'heatmap-intensity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 1,
                    15, 3
                ],
                // Color ramp for heatmap (from cool to hot)
                'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0, 'rgba(33,102,172,0)',
                    0.2, 'rgb(103,169,207)',
                    0.4, 'rgb(209,229,240)',
                    0.6, 'rgb(253,219,199)',
                    0.8, 'rgb(239,138,98)',
                    1, 'rgb(178,24,43)'
                ],
                // Radius of each heatmap point in pixels
                // This creates the ~5 mile radius effect
                'heatmap-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 2,
                    5, 10,
                    10, 50,
                    11, 60
                ],
                // Fade out heatmap at higher zoom levels
                'heatmap-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    7, 1,
                    15, 0.7
                ]
            },
            slot: 'top'
        });

        // Add circle layer for individual points at higher zoom
        this.map.addLayer({
            'id': this.circleLayerId,
            'type': 'circle',
            'source': this.heatmapSourceId,
            'minzoom': 10,
            'paint': {
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    10, ['interpolate', ['linear'], ['get', 'impact'], 1, 3, 10, 8],
                    16, ['interpolate', ['linear'], ['get', 'impact'], 1, 10, 10, 50]
                ],
                'circle-emissive-strength': 0.75,
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'impact'],
                    1, 'rgba(33,102,172,0.8)',
                    3, 'rgb(103,169,207)',
                    5, 'rgb(209,229,240)',
                    7, 'rgb(253,219,199)',
                    8, 'rgb(239,138,98)',
                    10, 'rgb(178,24,43)'
                ],
                'circle-stroke-color': 'white',
                'circle-stroke-width': 1,
                'circle-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    10, 0,
                    11, 1
                ]
            },
            slot: 'top'
        });
    }

    handleMapClick(e) {
        const { lng, lat } = e.lngLat;
        this.selectedLocation = { lng, lat };
        
        // Remove previous marker
        if (this.currentMarker) {
            this.currentMarker.remove();
        }

        // Create marker
        this.currentMarker = this.createMarker(lng, lat);

        // Generate circular heatmap around this point
        this.generateCircularHeatmap(lng, lat, 5); // 5 miles radius

        // Fly to location
        this.map.flyTo({
            center: [lng, lat],
            zoom: 9,
            duration: 1500
        });

        console.log('Impact zone placed at:', { lat, lng });
        
        // Update impact level display
        this.updateImpactLevel('High');
    }

    createMarker(lng, lat) {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'forecast-marker';
        el.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#ef4444" stroke="#dc2626" stroke-width="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3" fill="white"></circle>
            </svg>
        `;

        // Create marker with popup
        const marker = new mapboxgl.Marker(el)
            .setLngLat([lng, lat])
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                    <h3 style="margin: 0 0 8px 0; color: #ef4444;">Impact Zone Center</h3>
                    <p style="margin: 0; font-size: 13px; color: #666;">
                        <strong>Coordinates:</strong><br>
                        Lat: ${lat.toFixed(4)}<br>
                        Lng: ${lng.toFixed(4)}<br>
                        <strong>Radius:</strong> ~5 miles
                    </p>
                `)
            )
            .addTo(this.map);

        return marker;
    }

    /**
     * Generate a circular pattern of points to create a ~5 mile radius heatmap
     * @param {number} centerLng - Center longitude
     * @param {number} centerLat - Center latitude
     * @param {number} radiusMiles - Radius in miles
     */
    generateCircularHeatmap(centerLng, centerLat, radiusMiles) {
        const features = [];
        const numRings = 8; // Number of concentric circles
        const pointsPerRing = 16; // Points per circle
        
        // Convert miles to approximate degrees (rough approximation)
        // 1 degree latitude ≈ 69 miles
        // 1 degree longitude ≈ 69 * cos(latitude) miles
        const latDegreesPerMile = 1 / 69;
        const lngDegreesPerMile = 1 / (69 * Math.cos(centerLat * Math.PI / 180));

        // Add center point with highest impact
        features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [centerLng, centerLat]
            },
            properties: {
                impact: 10 // Maximum impact at center
            }
        });

        // Generate concentric rings
        for (let ring = 1; ring <= numRings; ring++) {
            const ringRadius = (radiusMiles / numRings) * ring;
            const ringImpact = 10 * (1 - (ring / numRings)); // Decrease impact with distance
            
            for (let point = 0; point < pointsPerRing; point++) {
                const angle = (point / pointsPerRing) * 2 * Math.PI;
                
                const pointLng = centerLng + (ringRadius * lngDegreesPerMile * Math.cos(angle));
                const pointLat = centerLat + (ringRadius * latDegreesPerMile * Math.sin(angle));
                
                features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [pointLng, pointLat]
                    },
                    properties: {
                        impact: ringImpact
                    }
                });
            }
        }

        // Update the source data
        this.map.getSource(this.heatmapSourceId).setData({
            type: 'FeatureCollection',
            features: features
        });
    }

    toggleHeatmap() {
        this.heatmapVisible = !this.heatmapVisible;
        const visibility = this.heatmapVisible ? 'visible' : 'none';
        
        this.map.setLayoutProperty(this.heatmapLayerId, 'visibility', visibility);
        this.map.setLayoutProperty(this.circleLayerId, 'visibility', visibility);
        
        console.log(`Heatmap ${this.heatmapVisible ? 'shown' : 'hidden'}`);
    }

    centerOnLocation() {
        if (this.selectedLocation) {
            this.map.flyTo({
                center: [this.selectedLocation.lng, this.selectedLocation.lat],
                zoom: 9,
                duration: 1500
            });
        } else {
            alert('Please click on the map to place a data center location first.');
        }
    }

    updateImpactLevel(level) {
        const impactElement = document.getElementById('impact-level');
        if (impactElement) {
            impactElement.textContent = level;
        }
    }

    /**
     * Load cached state from previous analysis and auto-place marker
     */
    loadCachedState() {
        const cacheInfo = stateManager.getCacheInfo();
        
        if (!cacheInfo) {
            console.log('No cached location data found');
            return;
        }

        const { location, config, age } = cacheInfo;
        
        console.log('📍 Loading cached location:', location);
        console.log('⚙️ Cached config:', config);
        console.log('🕒 Cache age:', age);

        // Automatically place marker at cached location
        this.selectedLocation = location;
        this.currentMarker = this.createMarker(location.lng, location.lat);
        this.generateCircularHeatmap(location.lng, location.lat, 5);

        // Fly to the cached location
        this.map.flyTo({
            center: [location.lng, location.lat],
            zoom: 9,
            duration: 2000
        });

        // Update impact level
        this.updateImpactLevel('High');

        // Show cache info notification
        this.showCacheNotification(location, config, age);
    }

    /**
     * Show notification that cached data is being used
     */
    showCacheNotification(location, config, age) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cache-notification';
        notification.innerHTML = `
            <div class="cache-notification-content">
                <h4>📍 Using Cached Analysis Location</h4>
                <p class="cache-coords">
                    Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}
                </p>
                <p class="cache-config">
                    ${config.power_mw} MW • ${config.servers.toLocaleString()} servers
                </p>
                <p class="cache-time">Cached ${age}</p>
            </div>
        `;

        // Add to sidebar
        const sidebar = document.querySelector('.left-sidebar');
        if (sidebar) {
            // Remove any existing notification
            const existing = sidebar.querySelector('.cache-notification');
            if (existing) {
                existing.remove();
            }
            
            // Insert at the top of the sidebar
            sidebar.insertBefore(notification, sidebar.firstChild);

            // Auto-hide after 10 seconds
            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.5s ease';
                setTimeout(() => notification.remove(), 500);
            }, 10000);
        }
    }

    reset() {
        if (this.currentMarker) {
            this.currentMarker.remove();
            this.currentMarker = null;
        }
        this.selectedLocation = null;
        
        // Clear heatmap data
        this.map.getSource(this.heatmapSourceId).setData({
            type: 'FeatureCollection',
            features: []
        });
        
        this.map.flyTo({
            center: MAPBOX_CONFIG.center,
            zoom: 4,
            duration: 1500
        });
    }
}

// Initialize the forecast map
let forecastMap;

document.addEventListener('DOMContentLoaded', () => {
    forecastMap = new ForecastMap();
    forecastMap.initialize();
    console.log('✅ Forecast page initialized!');
});

// Expose functions for HTML onclick handlers
window.toggleHeatmap = () => {
    if (forecastMap) {
        forecastMap.toggleHeatmap();
    }
};

window.centerOnLocation = () => {
    if (forecastMap) {
        forecastMap.centerOnLocation();
    }
};

window.resetMap = () => {
    if (forecastMap) {
        forecastMap.reset();
    }
};

