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
}

