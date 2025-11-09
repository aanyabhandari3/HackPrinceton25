// Forecast Page - Heatmap Visualization
// Implements a circular heatmap overlay showing ~5 mile radius impact zone

import { MAPBOX_CONFIG, API_CONFIG } from './config.js';
import { stateManager } from './state.js';

class ForecastMap {
    constructor() {
        this.map = null;
        this.currentMarker = null;
        this.selectedLocation = null;
        this.heatmapVisible = false; // Start hidden until simulation starts
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

        // Add heatmap layer (initially hidden)
        this.map.addLayer({
            'id': this.heatmapLayerId,
            'type': 'heatmap',
            'source': this.heatmapSourceId,
            'maxzoom': 15,
            'layout': {
                'visibility': 'none'
            },
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

        // Add circle layer for individual points at higher zoom (initially hidden)
        this.map.addLayer({
            'id': this.circleLayerId,
            'type': 'circle',
            'source': this.heatmapSourceId,
            'minzoom': 10,
            'layout': {
                'visibility': 'none'
            },
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

    updateImpactLevel(level) {
        // Impact level display removed - keeping method for compatibility
        console.log('Impact level:', level);
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
        
        // Don't generate heatmap automatically - it will grow with simulation data
        
        // Fly to the cached location
        this.map.flyTo({
            center: [location.lng, location.lat],
            zoom: 9,
            duration: 2000
        });

        // Update impact level
        this.updateImpactLevel('High');
    }

    /**
     * Update heatmap dynamically based on CO2 emissions and environmental factors
     * @param {number} carbonTons - Cumulative CO2 emissions in tons
     * @param {number} maxCarbonTons - Expected max CO2 for the year (for scaling)
     * @param {object} environmentalFactors - Wind, temperature, PUE, etc.
     */
    updateDynamicHeatmap(carbonTons, maxCarbonTons = 1000, environmentalFactors = {}) {
        if (!this.selectedLocation) return;
        
        const { lng, lat } = this.selectedLocation;
        
        // Extract environmental factors
        const windSpeed = environmentalFactors.windSpeed || 5; // mph
        const windDirection = environmentalFactors.windDirection || 0; // degrees
        const temperature = environmentalFactors.temperature || 70; // F
        const humidity = environmentalFactors.humidity || 50; // %
        const pue = environmentalFactors.pue || 1.3;
        
        // Calculate base radius (1-8 miles based on emissions)
        let baseRadiusMiles = Math.min((carbonTons / maxCarbonTons) * 8, 8);
        
        // Adjust radius based on wind speed (higher wind = more dispersed)
        // Wind disperses pollutants but also spreads impact wider
        const windFactor = 1 + (windSpeed / 20); // Up to 1.5x at 10 mph
        baseRadiusMiles *= windFactor;
        
        // Calculate intensity based on multiple factors
        // Start with lower base intensity to reduce "dark red"
        let baseIntensity = Math.min((carbonTons / maxCarbonTons) * 0.8, 0.8); // Max 80% instead of 150%
        
        // PUE affects intensity (higher PUE = more waste heat)
        const pueImpact = (pue - 1.0) / 0.5; // Normalize (1.0-1.5 PUE range)
        baseIntensity *= (1 + pueImpact * 0.2);
        
        // Temperature affects dispersion (hotter = worse air quality)
        const tempFactor = temperature > 70 ? 1 + ((temperature - 70) / 100) : 1;
        baseIntensity *= tempFactor;
        
        // Higher wind reduces intensity (better dispersion)
        const windIntensityFactor = Math.max(0.6, 1 - (windSpeed / 30));
        baseIntensity *= windIntensityFactor;
        
        if (baseRadiusMiles < 0.2) {
            // Clear heatmap if emissions are negligible
            this.map.getSource(this.heatmapSourceId).setData({
                type: 'FeatureCollection',
                features: []
            });
            return;
        }
        
        // Generate elliptical heatmap based on wind direction
        const features = [];
        const numRings = 8;
        const pointsPerRing = 16;
        
        const latDegreesPerMile = 1 / 69;
        const lngDegreesPerMile = 1 / (69 * Math.cos(lat * Math.PI / 180));

        // Create pulsing effect using time-based variation
        const pulsePhase = (Date.now() / 2000) % (2 * Math.PI);
        const pulseAmount = Math.sin(pulsePhase) * 0.03; // Reduced pulse

        // Wind creates elliptical shape (elongated downwind)
        const windRadians = (windDirection * Math.PI) / 180;
        const ellipseRatio = 1 + (windSpeed / 15); // More elongated with higher wind

        // Add center point with scaled intensity
        features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            properties: {
                impact: 10 * baseIntensity
            }
        });

        // Generate concentric rings with wind-based elliptical distortion
        for (let ring = 1; ring <= numRings; ring++) {
            const ringRadius = (baseRadiusMiles / numRings) * ring;
            const ringImpact = (10 * baseIntensity) * (1 - (ring / numRings) ** 1.5); // Faster falloff
            
            const jitter = 1.0 + pulseAmount + (Math.random() * 0.03 - 0.015);
            
            for (let point = 0; point < pointsPerRing; point++) {
                const angle = (point / pointsPerRing) * 2 * Math.PI;
                
                // Calculate distance from center based on wind direction
                // Points downwind are farther, upwind are closer
                const angleFromWind = angle - windRadians;
                const windEffect = Math.cos(angleFromWind);
                const distanceMultiplier = windEffect > 0 
                    ? 1 + (windEffect * (ellipseRatio - 1)) // Elongate downwind
                    : 1 - (Math.abs(windEffect) * 0.3); // Compress upwind
                
                const effectiveRadius = ringRadius * distanceMultiplier * jitter;
                
                const pointLng = lng + (effectiveRadius * lngDegreesPerMile * Math.cos(angle));
                const pointLat = lat + (effectiveRadius * latDegreesPerMile * Math.sin(angle));
                
                features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [pointLng, pointLat]
                    },
                    properties: {
                        impact: Math.max(ringImpact, 0.3) // Lower minimum
                    }
                });
            }
        }

        // Update the heatmap source with smooth transition
        this.map.getSource(this.heatmapSourceId).setData({
            type: 'FeatureCollection',
            features: features
        });
        
        // Update heatmap details display (live updates during simulation)
        this.updateHeatmapDetails(baseRadiusMiles, environmentalFactors, baseIntensity);
    }
    
    /**
     * Update the heatmap details display in the sidebar
     */
    updateHeatmapDetails(radius, envFactors, intensity) {
        // Update radius
        const radiusEl = document.getElementById('heatmap-radius');
        if (radiusEl) {
            radiusEl.textContent = `${radius.toFixed(2)} miles`;
        }
        
        // Update wind speed
        const windEl = document.getElementById('heatmap-wind');
        if (windEl) {
            windEl.textContent = `${envFactors.windSpeed.toFixed(1)} mph`;
        }
        
        // Update wind direction
        const windDirEl = document.getElementById('heatmap-wind-dir');
        if (windDirEl) {
            const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
            const index = Math.round(envFactors.windDirection / 45) % 8;
            windDirEl.textContent = `${directions[index]} (${envFactors.windDirection.toFixed(0)}°)`;
        }
        
        // Update temperature
        const tempEl = document.getElementById('heatmap-temp');
        if (tempEl) {
            tempEl.textContent = `${envFactors.temperature.toFixed(1)}°F`;
        }
        
        // Update PUE
        const pueEl = document.getElementById('heatmap-pue');
        if (pueEl) {
            pueEl.textContent = envFactors.pue.toFixed(2);
        }
        
        // Update dispersion rating
        const dispersionEl = document.getElementById('heatmap-dispersion');
        if (dispersionEl) {
            const dispersionLevel = intensity < 0.3 ? 'Excellent' : 
                                   intensity < 0.5 ? 'Good' : 
                                   intensity < 0.7 ? 'Moderate' : 'Poor';
            dispersionEl.textContent = dispersionLevel;
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

// Human Cost controller for empathy metrics
class HumanCostController {
    constructor() {
        this.values = {
            homes: 0,
            trees: 0,
            families: 0,
            monthlyCost: 0
        };
    }

    updateMetrics(cumulativeEnergy, carbonTons, totalPopulation = 100000) {
        // Calculate human-scale metrics
        const homes = Math.round(cumulativeEnergy / 10000); // 10,000 kWh per home/year
        const trees = Math.round(carbonTons * 42); // ~42 trees to offset 1 ton CO2/year
        
        // Estimate families affected and monthly cost
        // Assume infrastructure cost amortized over households
        const estimatedInfrastructureCost = (cumulativeEnergy / 1000000) * 500000; // Rough estimate
        const households = Math.round(totalPopulation / 2.5);
        const annualCostPerHousehold = households > 0 ? estimatedInfrastructureCost / households : 0;
        const monthlyCost = annualCostPerHousehold / 12;
        
        // Update with animation
        this.updateValue('homes', homes, 'human-homes-count', 'homes-bar');
        this.updateValue('trees', trees, 'trees-count', 'trees-bar');
        this.updateValue('families', households, 'families-count', 'families-bar');
        this.updateCost(monthlyCost);
    }

    updateValue(key, newValue, elementId, barId) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Animate number change
        element.classList.add('updating');
        setTimeout(() => element.classList.remove('updating'), 500);
        
        element.textContent = Math.round(newValue).toLocaleString();
        
        // Calculate bar percentage based on scale
        let maxValue, barPercent;
        if (key === 'homes') {
            maxValue = 500; // Max homes shown on bar
            barPercent = Math.min((newValue / maxValue) * 100, 100);
        } else if (key === 'trees') {
            maxValue = 5000; // Max trees shown on bar
            barPercent = Math.min((newValue / maxValue) * 100, 100);
        } else {
            maxValue = 50000; // Max families shown on bar
            barPercent = Math.min((newValue / maxValue) * 100, 100);
        }

        // Update bar visualization
        const bar = document.getElementById(barId);
        if (bar) {
            bar.style.setProperty('--bar-width', `${barPercent}%`);
            bar.classList.add('active');
        }
        
        this.values[key] = newValue;
    }

    updateCost(monthlyCost) {
        const element = document.getElementById('family-cost');
        if (!element) return;

        element.classList.add('updating');
        setTimeout(() => element.classList.remove('updating'), 500);
        
        element.textContent = `$${monthlyCost.toFixed(2)}`;
        this.values.monthlyCost = monthlyCost;
    }

    reset() {
        this.values = { homes: 0, trees: 0, families: 0, monthlyCost: 0 };
        
        // Reset display
        document.getElementById('human-homes-count').textContent = '0';
        document.getElementById('trees-count').textContent = '0';
        document.getElementById('families-count').textContent = '0';
        document.getElementById('family-cost').textContent = '$0.00';
        
        // Reset bars
        ['homes-bar', 'trees-bar', 'families-bar'].forEach(id => {
            const bar = document.getElementById(id);
            if (bar) {
                bar.style.setProperty('--bar-width', '0%');
                bar.classList.remove('active');
            }
        });
    }
}

// Odometer controller for rolling numbers
class OdometerController {
    constructor() {
        this.values = {
            energy: 0,
            carbon: 0,
            cost: 0,
            homes: 0
        };
        this.targetValues = {
            energy: 0,
            carbon: 0,
            cost: 0,
            homes: 0
        };
        this.isAnimating = false;
    }

    updateValue(key, newValue, animate = true) {
        this.targetValues[key] = newValue;
        
        if (animate) {
            const element = document.getElementById(`odometer-${key}`);
            if (element) {
                element.classList.add('rolling');
                element.parentElement.parentElement.classList.add('updating');
                
                setTimeout(() => {
                    element.classList.remove('rolling');
                    element.parentElement.parentElement.classList.remove('updating');
                }, 300);
            }
        }
        
        this.animateToTarget(key);
    }

    animateToTarget(key) {
        const element = document.getElementById(`odometer-${key}`);
        if (!element) return;

        const start = this.values[key];
        const end = this.targetValues[key];
        const duration = 300; // ms
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeOut;
            
            this.values[key] = current;
            this.displayValue(key, current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.values[key] = end;
                this.displayValue(key, end);
            }
        };

        requestAnimationFrame(animate);
    }

    displayValue(key, value) {
        const element = document.getElementById(`odometer-${key}`);
        if (!element) return;

        let displayText;
        if (key === 'energy' || key === 'cost') {
            // Large numbers with commas
            displayText = Math.round(value).toLocaleString();
        } else if (key === 'carbon') {
            // Decimal for carbon
            displayText = value.toLocaleString(undefined, { 
                minimumFractionDigits: 1, 
                maximumFractionDigits: 1 
            });
        } else {
            // Whole numbers for homes
            displayText = Math.round(value).toLocaleString();
        }

        element.textContent = displayText;
    }

    reset() {
        this.values = { energy: 0, carbon: 0, cost: 0, homes: 0 };
        this.targetValues = { energy: 0, carbon: 0, cost: 0, homes: 0 };
        
        Object.keys(this.values).forEach(key => {
            this.displayValue(key, 0);
        });
    }
}

// Timeline visualization class
class TimelineVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.daysCompleted = 0;
        this.totalDays = 365;
        this.pueHistory = [];
        this.markdownBuffer = '';
        this.animationQueue = [];
        this.isAnimating = false;
    }

    drawTimeline() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Calculate segment width
        const segmentWidth = width / this.totalDays;
        
        // Draw completed days
        for (let day = 0; day < this.daysCompleted; day++) {
            const x = day * segmentWidth;
            const pue = this.pueHistory[day] || 1.3;
            
            // Color based on PUE - matching app theme colors
            const color = this.getPUEColor(pue);
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, 0, segmentWidth, height);
        }
        
        // Draw border - theme color
        this.ctx.strokeStyle = '#c2d9a3';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, width, height);
        
        // Draw month markers
        this.ctx.strokeStyle = 'rgba(88, 135, 149, 0.4)';
        this.ctx.lineWidth = 1;
        const monthPositions = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        monthPositions.forEach(day => {
            const x = day * segmentWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        });
    }

    getPUEColor(pue) {
        // Using app theme colors: C2D9A3 (green), FFC300 (yellow), FFB74D (amber), E57373 (red)
        if (pue < 1.2) return 'rgba(194, 217, 163, 0.9)';  // Green - Excellent
        if (pue < 1.4) return 'rgba(255, 195, 0, 0.9)';     // Yellow - Good
        if (pue < 1.6) return 'rgba(255, 183, 77, 0.9)';    // Amber - Fair
        return 'rgba(229, 115, 115, 0.9)';                   // Red - Poor
    }

    async queueDayUpdate(days, pue) {
        this.animationQueue.push({ days, pue });
        if (!this.isAnimating) {
            await this.processQueue();
        }
    }

    async processQueue() {
        this.isAnimating = true;
        
        while (this.animationQueue.length > 0) {
            const update = this.animationQueue.shift();
            
            // Only update if we're moving forward
            if (update.days > this.daysCompleted) {
                this.daysCompleted = update.days;
                this.pueHistory.push(update.pue);
                this.drawTimeline();
                
                // Slow down the animation - stagger by 250ms per day update for dramatic effect
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }
        
        this.isAnimating = false;
    }

    updateDay(dayData) {
        this.daysCompleted++;
        this.pueHistory.push(dayData.pue || 1.3);
        this.drawTimeline();
    }

    reset() {
        this.daysCompleted = 0;
        this.pueHistory = [];
        this.markdownBuffer = '';
        this.animationQueue = [];
        this.isAnimating = false;
        this.drawTimeline();
    }
}

// Forecast simulation controller
async function startForecast() {
    // Get cached location and config
    const cacheInfo = stateManager.getCacheInfo();
    
    if (!cacheInfo) {
        alert('Please run an analysis first to set location and configuration');
        return;
    }
    
    const { location, config } = cacheInfo;
    
    // Hide start button, show timeline
    document.getElementById('forecast-start-state').style.display = 'none';
    document.getElementById('timeline-container').style.display = 'block';
    
    // Expand the right sidebar
    const rightSidebar = document.querySelector('.right-sidebar');
    if (rightSidebar) {
        rightSidebar.classList.add('expanded');
    }
    
    // Show the heatmap (it starts hidden)
    if (forecastMap && !forecastMap.heatmapVisible) {
        forecastMap.toggleHeatmap();
    }
    
    // Initialize timeline visualizer, odometer, and human cost
    const timeline = new TimelineVisualizer('timeline-canvas');
    timeline.reset();
    
    const odometer = new OdometerController();
    odometer.reset();
    
    // Reset heatmap to start from zero
    forecastMap.map.getSource(forecastMap.heatmapSourceId).setData({
        type: 'FeatureCollection',
        features: []
    });
    
    const humanCost = new HumanCostController();
    humanCost.reset();
    
    // Track cumulative values
    let cumulativeEnergy = 0;  // kWh
    let baseRatePerKwh = 0.10; // Will be updated from backend
    let totalPopulation = 100000; // Will be updated from backend
    let carbonIntensity = 0.386; // kg CO2 per kWh - will be updated from backend with grid-specific value
    
    // Track environmental factors for heatmap
    let environmentalFactors = {
        windSpeed: 5,
        windDirection: 0,
        temperature: 70,
        humidity: 50,
        pue: 1.3
    };
    
    // Update status
    const statusDiv = document.getElementById('simulation-status');
    statusDiv.textContent = 'Initializing simulation...';
    
    try {
        const payload = {
            latitude: location.lat,
            longitude: location.lng,
            custom: true,
            power_mw: config.power_mw,
            servers: config.servers,
            square_feet: config.square_feet,
            employees: config.employees,
            cooling_type: 'air_cooled',
            server_type: 'enterprise',
            datacenter_type: 'enterprise',
            simulation_hours: 8760  // Full year
        };

        const response = await fetch(`${API_CONFIG.baseUrl}/api/forecast/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonData = line.slice(6);
                    try {
                        const data = JSON.parse(jsonData);
                        
                        if (data.status === 'simulation_progress') {
                            // Update timeline with staggered animation
                            const days = Math.floor(data.hours_completed / 24);
                            await timeline.queueDayUpdate(days, data.current_avg_pue);
                            
                            // Update environmental factors
                            environmentalFactors.pue = data.current_avg_pue;
                            
                            // Calculate cumulative energy (24 hours of power consumption)
                            cumulativeEnergy += (data.current_avg_power_kw * 24); // kWh
                            
                            // Calculate derived values using grid-specific carbon intensity
                            const carbonKg = cumulativeEnergy * carbonIntensity; // kg CO2
                            const carbonTons = carbonKg / 907.185; // Convert kg to US tons
                            const cost = cumulativeEnergy * baseRatePerKwh;
                            const homes = cumulativeEnergy / 10000; // ~10,000 kWh per home per year
                            
                            // Update animated heatmap based on CO2 emissions and environmental data
                            // Estimate annual CO2 for scaling (extrapolate from current progress)
                            const estimatedAnnualCO2 = data.percent_complete > 0 
                                ? (carbonTons / (data.percent_complete / 100)) 
                                : 1000;
                            forecastMap.updateDynamicHeatmap(carbonTons, estimatedAnnualCO2, environmentalFactors);
                            
                            // Update odometer
                            odometer.updateValue('energy', cumulativeEnergy);
                            odometer.updateValue('carbon', carbonTons);
                            odometer.updateValue('cost', cost);
                            
                            // Update human cost metrics
                            humanCost.updateMetrics(cumulativeEnergy, carbonTons, totalPopulation);
                            
                            // Update stats
                            document.getElementById('days-completed').textContent = `Day ${days}/365`;
                            document.getElementById('simulation-progress').textContent = `${data.percent_complete}%`;
                            document.getElementById('metric-power').textContent = `${data.current_avg_power_kw.toFixed(0)} kW`;
                            document.getElementById('metric-pue').textContent = data.current_avg_pue.toFixed(2);
                            document.getElementById('metric-util').textContent = `${data.current_avg_utilization.toFixed(1)} %`;
                            
                            statusDiv.textContent = `Simulating year... ${data.percent_complete}% complete`;
                        } 
                        else if (data.status === 'analysis_chunk') {
                            // Stream LLM analysis in real-time
                            statusDiv.textContent = 'Generating AI analysis...';
                            timeline.markdownBuffer += data.text;
                            
                            // Update the report display as text streams in
                            updateReportStreaming(timeline.markdownBuffer);
                        }
                        else if (data.status === 'complete') {
                            statusDiv.textContent = 'Simulation complete!';
                            console.log('Forecast report:', data.report);
                            
                            // Final update with complete report
                            if (timeline.markdownBuffer && timeline.markdownBuffer.trim()) {
                                updateReportStreaming(timeline.markdownBuffer, true);
                            }
                        }
                        else if (data.status === 'error') {
                            throw new Error(data.message);
                        }
                        else if (data.step === 'location_data_complete' && data.location) {
                            // Capture population when available
                            if (data.location.population) {
                                totalPopulation = data.location.population;
                                console.log(`📍 Location data captured - Population: ${totalPopulation.toLocaleString()}`);
                            }
                        }
                        else if (data.step === 'energy_data_complete' && data.energy) {
                            // Capture energy rate when available
                            if (data.energy.price_per_kwh) {
                                baseRatePerKwh = data.energy.price_per_kwh;
                                console.log(`⚡ Energy data captured - Rate: $${baseRatePerKwh.toFixed(3)}/kWh`);
                            }
                        }
                        else if (data.step === 'climate_data_complete' && data.climate) {
                            // Capture climate data for heatmap
                            environmentalFactors.temperature = data.climate.temperature || 70;
                            environmentalFactors.humidity = data.climate.humidity || 50;
                            environmentalFactors.windSpeed = data.climate.wind_speed || 5;
                            environmentalFactors.windDirection = data.climate.wind_direction || 0;
                            console.log('🌤️ Climate data captured:', environmentalFactors);
                            
                            // Initialize heatmap details display with climate data
                            forecastMap.updateHeatmapDetails(0, environmentalFactors, 0);
                        }
                        else if (data.step === 'grid_config_complete' && data.grid) {
                            // Capture grid-specific carbon intensity and energy rate
                            carbonIntensity = data.grid.carbon_intensity || 0.386;
                            if (data.grid.base_rate) {
                                baseRatePerKwh = data.grid.base_rate;
                            }
                            console.log(`⚡ Grid config captured for ${data.grid.region}: ${carbonIntensity.toFixed(3)} kg CO₂/kWh, $${baseRatePerKwh.toFixed(3)}/kWh`);
                        }
                        else if (data.step) {
                            // Handle other status updates
                            const stepMessages = {
                                'initializing': 'Initializing...',
                                'fetching_location_data': 'Fetching location data...',
                                'fetching_energy_data': 'Fetching energy data...',
                                'fetching_climate_data': 'Fetching climate data...',
                                'preparing_simulation': 'Preparing simulation...',
                                'simulating': 'Running simulation...',
                                'calculating_costs': 'Calculating costs...',
                                'generating_analysis': 'Generating analysis...'
                            };
                            statusDiv.textContent = stepMessages[data.step] || data.step;
                        }
                    } catch (e) {
                        console.warn('Failed to parse SSE data:', jsonData);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error running forecast:', error);
        statusDiv.textContent = `❌ Error: ${error.message}`;
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

window.resetMap = () => {
    if (forecastMap) {
        forecastMap.reset();
    }
};

window.startForecast = startForecast;

// Helper function to render markdown with LaTeX support
function renderMarkdownWithLatex(markdownText) {
    // Process LaTeX before markdown parsing
    let processedText = markdownText;
    
    // Replace block LaTeX ($$...$$) with placeholders that markdown won't touch
    const blockMathMatches = [];
    processedText = processedText.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => {
        const index = blockMathMatches.length;
        blockMathMatches.push(latex);
        return `<!--BLOCKMATHSTART${index}BLOCKMATHEND-->`;
    });
    
    // Replace inline LaTeX ($...$) with placeholders that markdown won't touch
    const inlineMathMatches = [];
    processedText = processedText.replace(/\$([^\$\n]+?)\$/g, (match, latex) => {
        const index = inlineMathMatches.length;
        inlineMathMatches.push(latex);
        return `<!--INLINEMATHSTART${index}INLINEMATHEND-->`;
    });
    
    // Render markdown
    let html = marked.parse(processedText);
    
    // Render block math with KaTeX
    html = html.replace(/<!--BLOCKMATHSTART(\d+)BLOCKMATHEND-->/g, (match, index) => {
        try {
            if (typeof katex !== 'undefined') {
                return katex.renderToString(blockMathMatches[index], {
                    displayMode: true,
                    throwOnError: false,
                    trust: true
                });
            }
            return `$$${blockMathMatches[index]}$$`;
        } catch (e) {
            console.error('KaTeX block rendering error:', e);
            return `$$${blockMathMatches[index]}$$`;
        }
    });
    
    // Render inline math with KaTeX
    html = html.replace(/<!--INLINEMATHSTART(\d+)INLINEMATHEND-->/g, (match, index) => {
        try {
            if (typeof katex !== 'undefined') {
                return katex.renderToString(inlineMathMatches[index], {
                    displayMode: false,
                    throwOnError: false,
                    trust: true
                });
            }
            return `$${inlineMathMatches[index]}$`;
        } catch (e) {
            console.error('KaTeX inline rendering error:', e);
            return `$${inlineMathMatches[index]}$`;
        }
    });
    
    return html;
}

// Report display and streaming update function
function updateReportStreaming(markdownText, isComplete = false) {
    const reportSection = document.getElementById('llm-report-section');
    const reportMarkdown = document.getElementById('report-markdown');
    const reportContent = document.getElementById('report-content');
    const reportBadge = reportSection ? reportSection.querySelector('.report-badge') : null;
    
    if (reportSection && reportMarkdown && typeof marked !== 'undefined') {
        // Render markdown with LaTeX support
        const html = renderMarkdownWithLatex(markdownText);
        reportMarkdown.innerHTML = html;
        
        // Show the report section on first chunk
        if (reportSection.style.display === 'none') {
            reportSection.style.display = 'block';
            // Auto-expand the report when streaming starts
            if (reportContent && !reportContent.classList.contains('expanded')) {
                reportContent.classList.add('expanded');
                const chevron = document.getElementById('report-chevron');
                if (chevron) {
                    chevron.classList.add('expanded');
                }
            }
            console.log('Report streaming started');
        }
        
        // Update badge based on status
        if (reportBadge) {
            if (isComplete) {
                reportBadge.textContent = 'Complete';
                reportBadge.style.background = 'linear-gradient(135deg, #3b5316 0%, #78772b 100%)';
                reportBadge.classList.remove('streaming');
            } else {
                reportBadge.textContent = 'Streaming...';
                reportBadge.style.background = 'linear-gradient(135deg, #588795 0%, #6fa8bb 100%)';
                reportBadge.classList.add('streaming');
            }
        }
        
        // Auto-scroll to bottom if content is expanded (smooth scrolling for streaming)
        if (reportContent && reportContent.classList.contains('expanded')) {
            // Use requestAnimationFrame for smooth scrolling
            requestAnimationFrame(() => {
                reportContent.scrollTop = reportContent.scrollHeight;
            });
        }
        
        // Store markdown for PDF export
        window.reportMarkdown = markdownText;
        
        if (isComplete) {
            console.log('Report streaming complete');
        }
    }
}

window.toggleReport = () => {
    const reportContent = document.getElementById('report-content');
    const chevron = document.getElementById('report-chevron');
    
    if (reportContent && chevron) {
        const isExpanded = reportContent.classList.contains('expanded');
        
        if (isExpanded) {
            reportContent.classList.remove('expanded');
            chevron.classList.remove('expanded');
        } else {
            reportContent.classList.add('expanded');
            chevron.classList.add('expanded');
        }
    }
};

window.downloadReportPDF = async (event) => {
    event.stopPropagation(); // Prevent toggle when clicking download
    
    if (!window.reportMarkdown) {
        alert('No report available to download');
        return;
    }
    
    try {
        // Use jsPDF and html2canvas for client-side PDF generation
        // For now, we'll download as a text file with instructions to print to PDF
        const blob = new Blob([window.reportMarkdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datacenter-impact-report-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📥 Report downloaded as markdown');
        
        // Show hint for PDF conversion
        setTimeout(() => {
            if (confirm('Report downloaded as Markdown. Would you like instructions to convert to PDF?')) {
                alert('To create a PDF:\n1. Open the downloaded .md file in a markdown viewer\n2. Use your browser\'s "Print to PDF" function\n\nOr use online tools like:\n- Dillinger.io\n- Markdown-to-PDF.com');
            }
        }, 500);
    } catch (error) {
        console.error('Error downloading report:', error);
        alert('Failed to download report. Please try again.');
    }
};

