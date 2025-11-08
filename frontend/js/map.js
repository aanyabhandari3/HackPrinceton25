// Map Module - Handles all map-related functionality

import { MAPBOX_CONFIG } from './config.js';

export class MapManager {
    constructor() {
        this.map = null;
        this.currentMarker = null;
        this.selectedLocation = null;
        this.onLocationSelectCallback = null;
    }

    initialize(containerId) {
        // Set Mapbox access token
        mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

        // Create map
        this.map = new mapboxgl.Map({
            container: containerId,
            style: MAPBOX_CONFIG.style,
            center: MAPBOX_CONFIG.center,
            zoom: MAPBOX_CONFIG.zoom
        });

        // Add navigation controls
        this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add click handler
        this.map.on('click', (e) => this.handleMapClick(e));

        // Log when loaded
        this.map.on('load', () => {
            console.log('Map loaded successfully! ✅');
        });

        return this.map;
    }

    handleMapClick(e) {
        const { lng, lat } = e.lngLat;
        this.selectedLocation = { lng, lat };
        
        // Remove previous marker
        if (this.currentMarker) {
            this.currentMarker.remove();
        }

        // Create custom marker
        this.currentMarker = this.createMarker(lng, lat);

        // Fly to location
        this.map.flyTo({
            center: [lng, lat],
            zoom: 10,
            duration: 1500
        });

        // Trigger callback if set
        if (this.onLocationSelectCallback) {
            this.onLocationSelectCallback({ lng, lat });
        }

        console.log('Data Center placed at:', { lat, lng });
    }

    createMarker(lng, lat) {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
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
                    <h3 style="margin: 0 0 8px 0; color: #2563eb;">Data Center Location</h3>
                    <p style="margin: 0; font-size: 13px; color: #666;">
                        <strong>Coordinates:</strong><br>
                        Lat: ${lat.toFixed(4)}<br>
                        Lng: ${lng.toFixed(4)}
                    </p>
                `)
            )
            .addTo(this.map);

        return marker;
    }

    reset() {
        if (this.currentMarker) {
            this.currentMarker.remove();
            this.currentMarker = null;
        }
        this.selectedLocation = null;
        
        this.map.flyTo({
            center: MAPBOX_CONFIG.center,
            zoom: MAPBOX_CONFIG.zoom,
            duration: 1500
        });
    }

    onLocationSelect(callback) {
        this.onLocationSelectCallback = callback;
    }

    getSelectedLocation() {
        return this.selectedLocation;
    }
}

