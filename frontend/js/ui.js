// UI Module - Handles sidebar interactions and display updates

import { DATA_CENTER_TYPES } from './config.js';

export class UIManager {
    constructor() {
        this.currentConfig = DATA_CENTER_TYPES.small;
        this.isCustom = false;
        this.onConfigChangeCallback = null;
    }

    initialize() {
        this.setupPresetButtons();
        this.setupCustomInputs();
        this.updateSpecsDisplay();
    }

    setupPresetButtons() {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update config
                const size = btn.dataset.size;
                this.currentConfig = DATA_CENTER_TYPES[size];
                this.isCustom = false;
                
                // Hide custom config
                document.getElementById('custom-config').classList.remove('active');
                
                // Update display
                this.updateSpecsDisplay();

                // Trigger callback
                if (this.onConfigChangeCallback) {
                    this.onConfigChangeCallback(this.currentConfig);
                }
            });
        });
    }

    setupCustomInputs() {
        const inputIds = ['power_mw', 'servers', 'square_feet', 'water', 'employees'];
        
        inputIds.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.isCustom = true;
                    this.updateConfigFromInputs();
                    this.updateSpecsDisplay();

                    // Trigger callback
                    if (this.onConfigChangeCallback) {
                        this.onConfigChangeCallback(this.currentConfig);
                    }
                });
            }
        });
    }

    toggleCustomConfig() {
        const customConfig = document.getElementById('custom-config');
        customConfig.classList.toggle('active');
        
        if (customConfig.classList.contains('active')) {
            // Populate inputs with current config
            document.getElementById('power_mw').value = this.currentConfig.power_mw;
            document.getElementById('servers').value = this.currentConfig.servers;
            document.getElementById('square_feet').value = this.currentConfig.square_feet;
            document.getElementById('water').value = this.currentConfig.water_gallons_per_day;
            document.getElementById('employees').value = this.currentConfig.employees;
        }
    }

    updateConfigFromInputs() {
        this.currentConfig = {
            name: 'Custom Data Center',
            power_mw: parseFloat(document.getElementById('power_mw').value) || 1,
            servers: parseInt(document.getElementById('servers').value) || 100,
            square_feet: parseInt(document.getElementById('square_feet').value) || 5000,
            water_gallons_per_day: parseInt(document.getElementById('water').value) || 25000,
            employees: parseInt(document.getElementById('employees').value) || 10
        };
    }

    updateSpecsDisplay() {
        document.getElementById('spec-power').textContent = this.currentConfig.power_mw;
        document.getElementById('spec-servers').textContent = this.currentConfig.servers.toLocaleString();
        document.getElementById('spec-size').textContent = this.currentConfig.square_feet.toLocaleString();
        document.getElementById('spec-water').textContent = (this.currentConfig.water_gallons_per_day / 1000).toFixed(0);
    }

    updateLocationDisplay(location) {
        const display = document.getElementById('location-display');
        display.style.display = 'block';
        document.getElementById('lat').textContent = location.lat.toFixed(4);
        document.getElementById('lng').textContent = location.lng.toFixed(4);
    }

    hideLocationDisplay() {
        document.getElementById('location-display').style.display = 'none';
    }

    enableAnalyzeButton() {
        document.getElementById('analyze-btn').disabled = false;
    }

    disableAnalyzeButton() {
        document.getElementById('analyze-btn').disabled = true;
    }

    getCurrentConfig() {
        return {
            ...this.currentConfig,
            custom: this.isCustom
        };
    }

    onConfigChange(callback) {
        this.onConfigChangeCallback = callback;
    }

    // Report Display Methods
    showReportLoading() {
        const reportContent = document.getElementById('report-content');
        reportContent.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Analyzing impact...</p>
            </div>
        `;
    }

    displayReport(data) {
        const reportContent = document.getElementById('report-content');
        
        if (!data || !data.impacts) {
            this.showReportError('No data received');
            return;
        }

        const impacts = data.impacts;
        
        reportContent.innerHTML = `
            <!-- Location Info -->
            <div class="report-section">
                <h3>📍 Location Details</h3>
                <div class="report-row">
                    <span class="label">Latitude</span>
                    <span class="value">${data.location?.latitude?.toFixed(4) || 'N/A'}</span>
                </div>
                <div class="report-row">
                    <span class="label">Longitude</span>
                    <span class="value">${data.location?.longitude?.toFixed(4) || 'N/A'}</span>
                </div>
                <div class="report-row">
                    <span class="label">City</span>
                    <span class="value">${data.location?.city || 'Unknown'}</span>
                </div>
                <div class="report-row">
                    <span class="label">State</span>
                    <span class="value">${data.location?.state || 'Unknown'}</span>
                </div>
            </div>

            <!-- Data Center Config -->
            <div class="report-section">
                <h3>🖥️ Data Center Configuration</h3>
                <div class="report-row">
                    <span class="label">Type</span>
                    <span class="value">${data.data_center?.name || 'Custom'}</span>
                </div>
                <div class="report-row">
                    <span class="label">Power</span>
                    <span class="value">${data.data_center?.power_mw || 0} MW</span>
                </div>
                <div class="report-row">
                    <span class="label">Servers</span>
                    <span class="value">${(data.data_center?.servers || 0).toLocaleString()}</span>
                </div>
                <div class="report-row">
                    <span class="label">Size</span>
                    <span class="value">${(data.data_center?.square_feet || 0).toLocaleString()} sq ft</span>
                </div>
            </div>

            <!-- Environmental Impact -->
            <div class="report-section">
                <h3>🌍 Environmental Impact</h3>
                <div class="report-row">
                    <span class="label">Annual CO₂</span>
                    <span class="value">${(impacts.carbon_emissions_tons_per_year || 0).toLocaleString()} tons/year</span>
                </div>
                <div class="report-row">
                    <span class="label">Equivalent Cars</span>
                    <span class="value">${(impacts.equivalent_cars || 0).toLocaleString()}</span>
                </div>
                <div class="report-row">
                    <span class="label">Water Usage</span>
                    <span class="value">${(impacts.water_usage_gallons_per_day || 0).toLocaleString()} gal/day</span>
                </div>
                <div class="report-row">
                    <span class="label">Annual Energy</span>
                    <span class="value">${(impacts.energy_consumption_mwh_per_year || 0).toLocaleString()} MWh</span>
                </div>
                ${impacts.carbon_intensity_lbs_co2_per_mwh ? `
                <div class="report-highlight">
                    Carbon Intensity: <strong>${impacts.carbon_intensity_lbs_co2_per_mwh.toFixed(1)} lbs CO₂/MWh</strong>
                </div>
                ` : ''}
            </div>

            <!-- Economic Impact -->
            <div class="report-section">
                <h3>💰 Economic Impact</h3>
                <div class="report-row">
                    <span class="label">Jobs Created</span>
                    <span class="value">${impacts.jobs_created || 0}</span>
                </div>
                <div class="report-row">
                    <span class="label">Annual Energy Cost</span>
                    <span class="value">$${(impacts.annual_energy_cost || 0).toLocaleString()}</span>
                </div>
                <div class="report-row">
                    <span class="label">Property Tax Impact</span>
                    <span class="value">$${(impacts.property_tax_impact || 0).toLocaleString()}/year</span>
                </div>
            </div>

            <!-- Infrastructure Impact -->
            <div class="report-section">
                <h3>🏗️ Infrastructure Impact</h3>
                <div class="report-row">
                    <span class="label">Grid Capacity</span>
                    <span class="value">${impacts.grid_capacity_needed_mw || 0} MW needed</span>
                </div>
                <div class="report-row">
                    <span class="label">Cooling Required</span>
                    <span class="value">${(impacts.cooling_load_tons || 0).toLocaleString()} tons</span>
                </div>
            </div>

            ${impacts.nearby_facilities && impacts.nearby_facilities.length > 0 ? `
            <div class="report-section">
                <h3>🏭 Nearby Facilities</h3>
                ${impacts.nearby_facilities.slice(0, 5).map(facility => `
                    <div class="report-row">
                        <span class="label">${facility.name || 'Facility'}</span>
                        <span class="value">${facility.distance_km?.toFixed(1) || '?'} km</span>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        `;
    }

    showReportError(message) {
        const reportContent = document.getElementById('report-content');
        reportContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <p style="color: #ef4444;">Analysis Failed</p>
                <p class="empty-hint">${message}</p>
            </div>
        `;
    }

    clearReport() {
        const reportContent = document.getElementById('report-content');
        reportContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>No analysis yet</p>
                <p class="empty-hint">Select a location and click "Analyze Impact" to see results</p>
            </div>
        `;
    }
}

