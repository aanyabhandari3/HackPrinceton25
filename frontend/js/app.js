// Main Application - Orchestrates all modules

import { MapManager } from './map.js';
import { UIManager } from './ui.js';
import { APIClient } from './api.js';

class DataCenterApp {
    constructor() {
        this.mapManager = new MapManager();
        this.forecastMapManager = null; // Lazy initialize
        this.uiManager = new UIManager();
        this.apiClient = new APIClient();
        this.currentView = 'analyze';
        this.forecastSettings = {
            years: 5,
            growthRate: 15,
            scenario: 'moderate',
            initialSize: 1
        };
    }

    initialize() {
        console.log('🌐 Initializing Data Center Impact Analyzer...');

        // Initialize analyze map
        this.mapManager.initialize('map');

        // Initialize UI
        this.uiManager.initialize();

        // Setup event handlers
        this.setupEventHandlers();
        
        // Setup forecast controls
        this.setupForecastControls();

        console.log('✅ Application initialized successfully!');
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
            // Show loading state in button and report panel
            const analyzeBtn = document.getElementById('analyze-btn');
            const originalText = analyzeBtn.textContent;
            analyzeBtn.textContent = 'Analyzing...';
            analyzeBtn.disabled = true;

            // Show loading in report panel
            this.uiManager.showReportLoading();

            // Call API
            const result = await this.apiClient.analyzeImpact(location, config);
            
            console.log('Analysis result:', result);
            
            // Display results in report panel
            this.uiManager.displayReport(result);

            // Reset button
            analyzeBtn.textContent = originalText;
            analyzeBtn.disabled = false;

        } catch (error) {
            console.error('Analysis failed:', error);
            
            // Show error in report panel
            this.uiManager.showReportError(
                error.message || 'Failed to analyze impact. Make sure the backend is running.'
            );

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
        this.uiManager.clearReport();
        console.log('🔄 Application reset');
    }

    toggleCustomConfig() {
        this.uiManager.toggleCustomConfig();
    }

    switchView(viewName) {
        // Update active view
        document.querySelectorAll('.view-container').forEach(view => {
            view.classList.remove('active');
        });
        
        // Update navbar links
        document.querySelectorAll('.navbar-link').forEach(link => {
            link.classList.remove('active');
            // Set active based on view name
            const linkText = link.textContent.trim().toLowerCase();
            if (linkText === viewName) {
                link.classList.add('active');
            }
        });
        
        const viewElement = document.getElementById(`${viewName}-view`);
        if (viewElement) {
            viewElement.classList.add('active');
            
            this.currentView = viewName;
            
            // Initialize forecast map when switching to forecast view
            if (viewName === 'forecast' && !this.forecastMapManager) {
                this.initializeForecastMap();
            }
            
            console.log(`Switched to ${viewName} view`);
        }
    }

    initializeForecastMap() {
        this.forecastMapManager = new MapManager();
        this.forecastMapManager.initialize('forecast-map');
        console.log('📊 Forecast map initialized');
    }

    setupForecastControls() {
        // Time horizon buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.forecastSettings.years = parseInt(btn.dataset.years);
                this.updateForecastSummary();
            });
        });

        // Scenario buttons
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.forecastSettings.scenario = btn.dataset.scenario;
                
                // Update growth rate based on scenario
                const growthRates = {
                    'conservative': 5,
                    'moderate': 15,
                    'aggressive': 30
                };
                this.forecastSettings.growthRate = growthRates[this.forecastSettings.scenario];
                this.updateForecastSummary();
            });
        });

        // Preset buttons in forecast
        document.querySelectorAll('#forecast-view .preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#forecast-view .preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const sizes = {
                    'small': 1,
                    'medium': 10,
                    'large': 50,
                    'mega': 150
                };
                this.forecastSettings.initialSize = sizes[btn.dataset.size];
                this.updateForecastSummary();
            });
        });
    }

    updateForecastSummary() {
        document.getElementById('forecast-years').textContent = this.forecastSettings.years;
        document.getElementById('forecast-growth').textContent = this.forecastSettings.growthRate;
        document.getElementById('forecast-size').textContent = this.forecastSettings.initialSize;
        
        // Calculate projected final size
        const growthMultiplier = Math.pow(1 + this.forecastSettings.growthRate / 100, this.forecastSettings.years);
        const finalSize = this.forecastSettings.initialSize * growthMultiplier;
        document.getElementById('forecast-final').textContent = finalSize.toFixed(1);
    }

    runForecast() {
        console.log('🔮 Running forecast with settings:', this.forecastSettings);
        alert(`Forecast simulation will be implemented soon!\n\nSettings:\n- Time: ${this.forecastSettings.years} years\n- Growth: ${this.forecastSettings.growthRate}% annually\n- Initial: ${this.forecastSettings.initialSize} MW\n- Final: ${document.getElementById('forecast-final').textContent} MW`);
    }

    resetForecast() {
        // Reset to defaults
        this.forecastSettings = {
            years: 5,
            growthRate: 15,
            scenario: 'moderate',
            initialSize: 1
        };
        
        // Reset UI
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.years === '5') btn.classList.add('active');
        });
        
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.scenario === 'moderate') btn.classList.add('active');
        });
        
        document.querySelectorAll('#forecast-view .preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.size === 'small') btn.classList.add('active');
        });
        
        this.updateForecastSummary();
        
        if (this.forecastMapManager) {
            this.forecastMapManager.reset();
        }
        
        console.log('🔄 Forecast reset');
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
window.switchView = (viewName) => window.app.switchView(viewName);
window.runForecast = () => window.app.runForecast();
window.resetForecast = () => window.app.resetForecast();
window.exportReport = () => {
    console.log('Export report functionality - to be implemented');
    alert('Export functionality coming soon!');
};

