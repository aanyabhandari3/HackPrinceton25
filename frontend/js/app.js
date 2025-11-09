// Main Application - Orchestrates all modules

import { MapManager } from './map.js';
import { UIManager } from './ui.js';
import { APIClient } from './api.js';

class DataCenterApp {
    constructor() {
        this.mapManager = new MapManager();
        this.uiManager = new UIManager();
        this.apiClient = new APIClient();
    }

    initialize() {
        console.log('Initializing Data Center Impact Analyzer...');

        // Initialize map
        this.mapManager.initialize('map');

        // Initialize UI
        this.uiManager.initialize();

        // Setup event handlers
        this.setupEventHandlers();

        console.log('Application initialized successfully!');
    }

    setupEventHandlers() {
        // Map location selection
        this.mapManager.onLocationSelect((location) => {
            this.uiManager.updateLocationDisplay(location);
            this.uiManager.enableAnalyzeButton();
        });

        // Config change (optional logging)
        this.uiManager.onConfigChange((config) => {
            console.log('Configuration updated:', config);
        });
    }

    async analyzeImpact() {
        const location = this.mapManager.getSelectedLocation();
        
        if (!location) {
            alert('Please select a location on the map first');
            return;
        }

        const config = this.uiManager.getCurrentConfig();

        console.log('Analyzing impact with config:', {
            location,
            config
        });

        try {
            // Show loading state (you can add a loading spinner here)
            const analyzeBtn = document.getElementById('analyze-btn');
            const originalText = analyzeBtn.textContent;
            analyzeBtn.textContent = 'Analyzing...';
            analyzeBtn.disabled = true;

            // Call API
            const result = await this.apiClient.analyzeImpact(location, config);
            
            console.log('Analysis result:', result);
            
            // TODO: Display results in a modal or side panel
            alert(`Analysis Complete!\n\nLocation: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}\nData Center: ${config.name}\n\nCheck console for full results.`);

            // Reset button
            analyzeBtn.textContent = originalText;
            analyzeBtn.disabled = false;

        } catch (error) {
            console.error('Analysis failed:', error);
            
            // Show error (temporary alert - you can make this prettier)
            alert(`Analysis failed. Is the backend running?\n\nError: ${error.message}\n\nTo start backend:\ncd backend && python app.py`);

            // Reset button
            const analyzeBtn = document.getElementById('analyze-btn');
            analyzeBtn.textContent = 'Analyze Impact';
            analyzeBtn.disabled = false;
        }
    }

    reset() {
        this.mapManager.reset();
        this.uiManager.hideLocationDisplay();
        this.uiManager.disableAnalyzeButton();
        console.log('🔄 Application reset');
    }

    toggleCustomConfig() {
        this.uiManager.toggleCustomConfig();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DataCenterApp();
    window.app.initialize();
});

// Expose functions for HTML onclick handlers
window.analyzeImpact = () => window.app.analyzeImpact();
window.resetMap = () => window.app.reset();
window.toggleCustom = () => window.app.toggleCustomConfig();

