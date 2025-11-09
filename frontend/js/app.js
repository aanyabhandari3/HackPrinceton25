// Main Application - Orchestrates all modules

import { MapManager } from './map.js';
import { UIManager } from './ui.js';
import { APIClient } from './api.js';
import { stateManager } from './state.js';

// State FIPS to name mapping
const STATE_NAMES = {
    '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas',
    '06': 'California', '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware',
    '11': 'District of Columbia', '12': 'Florida', '13': 'Georgia', '15': 'Hawaii',
    '16': 'Idaho', '17': 'Illinois', '18': 'Indiana', '19': 'Iowa',
    '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine',
    '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
    '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska',
    '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
    '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
    '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island',
    '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas',
    '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
    '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming', '72': 'Puerto Rico'
};

class DataCenterApp {
    constructor() {
        this.mapManager = new MapManager();
        this.uiManager = new UIManager();
        this.apiClient = new APIClient();
    }

    initialize() {
        console.log('Initializing Data Center Impact Analyzer...');

        // Setup event handlers BEFORE initializing map
        this.setupEventHandlers();

        // Initialize map
        this.mapManager.initialize('map');

        // Initialize UI
        this.uiManager.initialize();

        console.log('Application initialized successfully!');
    }

    setupEventHandlers() {
        // Map location selection
        this.mapManager.onLocationSelect((location) => {
            console.log('Location selected:', location);
            this.uiManager.updateLocationDisplay(location);
            this.uiManager.enableAnalyzeButton();
            
            // Save location to state for persistence across pages
            stateManager.saveLocation(location);
            console.log('Button should be enabled now');
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

        // Save config to state for persistence across pages
        stateManager.saveConfig(config);

        try {
            // Show loading state
            const analyzeBtn = document.getElementById('analyze-btn');
            const originalText = analyzeBtn.textContent;
            analyzeBtn.textContent = 'Analyzing...';
            analyzeBtn.disabled = true;

            // Get results container and clear empty state
            const resultsContainer = document.getElementById('results-container');
            resultsContainer.innerHTML = `
                <div class="analysis-status">
                    <div class="status-text">Initializing analysis...</div>
                </div>
                <div class="analysis-content"></div>
            `;
            
            // Clear markdown buffer for new analysis
            this.markdownBuffer = '';

            // Animate panel expansion
            const rightSidebar = document.getElementById('right-sidebar');
            if (rightSidebar) {
                rightSidebar.classList.add('expanding');
                // Keep it expanded after animation
                setTimeout(() => {
                    rightSidebar.classList.remove('expanding');
                    rightSidebar.classList.add('expanded');
                }, 1200);
            }

            // Scroll to results section
            const sidebarContent = document.querySelector('.right-sidebar .sidebar-content');
            if (sidebarContent) {
                sidebarContent.scrollTop = 0;
            }

            // Stream the analysis
            await this.apiClient.analyzeImpactStream(
                location,
                config,
                // onUpdate callback
                (data) => {
                    this.updateAnalysisStatus(data);
                },
                // onComplete callback
                (report) => {
                    this.displayFinalReport(report);
                    analyzeBtn.textContent = originalText;
                    analyzeBtn.disabled = false;
                },
                // onError callback
                (error) => {
                    console.error('Analysis failed:', error);
                    resultsContainer.innerHTML = `
                        <div class="error-state">
                            <p><strong>Analysis Failed</strong></p>
                            <p>${error.message}</p>
                            <p style="font-size: 11px; margin-top: 8px;">Make sure the backend is running on port 5000</p>
                        </div>
                    `;
                    analyzeBtn.textContent = originalText;
                    analyzeBtn.disabled = false;
                }
            );

        } catch (error) {
            console.error('Analysis failed:', error);
            
            const resultsContainer = document.getElementById('results-container');
            resultsContainer.innerHTML = `
                <div class="error-state">
                    <p><strong>Error</strong></p>
                    <p>${error.message}</p>
                </div>
            `;

            // Reset button
            const analyzeBtn = document.getElementById('analyze-btn');
            analyzeBtn.textContent = 'Analyze Impact';
            analyzeBtn.disabled = false;
        }
    }

    updateAnalysisStatus(data) {
        const statusText = document.querySelector('.status-text');
        const content = document.querySelector('.analysis-content');
        
        if (!statusText) return;

        // Update status message
        switch (data.step) {
            case 'initializing':
                statusText.textContent = 'Initializing analysis...';
                break;
            case 'fetching_location_data':
                statusText.textContent = 'Fetching location data...';
                break;
            case 'location_data_complete':
                statusText.textContent = 'Location data received ✓';
                this.displayLocationData(data.data, content);
                break;
            case 'fetching_energy_data':
                statusText.textContent = 'Fetching energy data...';
                break;
            case 'energy_data_complete':
                statusText.textContent = 'Energy data received ✓';
                this.displayEnergyData(data.data, content);
                break;
            case 'fetching_climate_data':
                statusText.textContent = 'Fetching climate data...';
                break;
            case 'climate_data_complete':
                statusText.textContent = 'Climate data received ✓';
                this.displayClimateData(data.data, content);
                break;
            case 'calculating_impacts':
                statusText.textContent = 'Calculating impacts...';
                break;
            case 'impacts_complete':
                statusText.textContent = 'Impact calculations complete ✓';
                this.displayImpactData(data.data, content);
                break;
            case 'generating_analysis':
                statusText.textContent = 'Generating AI analysis...';
                break;
        }

        // Handle analysis chunks (streaming text from LLM)
        if (data.status === 'analysis_chunk') {
            if (!content.querySelector('.streaming-analysis')) {
                content.innerHTML += `
                    <div class="result-section analysis-section streaming">
                        <h3 class="result-title">AI Analysis</h3>
                        <div class="streaming-analysis markdown-content"></div>
                    </div>
                `;
                // Initialize markdown buffer
                if (!this.markdownBuffer) {
                    this.markdownBuffer = '';
                }
            }
            const analysisDiv = content.querySelector('.streaming-analysis');
            
            // Accumulate markdown text
            this.markdownBuffer = this.markdownBuffer || '';
            this.markdownBuffer += data.text;
            
            // Parse and render markdown with LaTeX support
            if (typeof marked !== 'undefined') {
                analysisDiv.innerHTML = this.renderMarkdownWithLatex(this.markdownBuffer);
            } else {
                // Fallback to plain text if marked is not loaded
                analysisDiv.textContent = this.markdownBuffer;
            }
            
            // Auto-scroll to keep latest content visible
            const rightSidebar = document.querySelector('.right-sidebar .sidebar-content');
            if (rightSidebar) {
                rightSidebar.scrollTop = rightSidebar.scrollHeight;
            }
        }
    }

    displayLocationData(data, container) {
        const locationSection = document.createElement('div');
        locationSection.className = 'result-section fade-in';
        
        // Get state name from FIPS code
        const stateName = STATE_NAMES[data.state_fips] || data.state_fips || 'Unknown';
        
        locationSection.innerHTML = `
            <h3 class="result-title">Location</h3>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-label">Area</span>
                    <span class="data-value">${data.location_name || 'Unknown'}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">State</span>
                    <span class="data-value">${stateName}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Population</span>
                    <span class="data-value">${data.population?.toLocaleString() || 'N/A'}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Median Income</span>
                    <span class="data-value">$${data.median_income?.toLocaleString() || 'N/A'}</span>
                </div>
            </div>
        `;
        container.appendChild(locationSection);
    }

    displayEnergyData(data, container) {
        const energySection = document.createElement('div');
        energySection.className = 'result-section fade-in';
        
        // Get state name
        const stateName = STATE_NAMES[data.state] || data.state || 'N/A';
        
        energySection.innerHTML = `
            <h3 class="result-title">Energy Grid</h3>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-label">State</span>
                    <span class="data-value">${stateName}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Electricity Rate</span>
                    <span class="data-value">$${data.price_per_kwh?.toFixed(3) || 'N/A'}/kWh</span>
                </div>
            </div>
        `;
        container.appendChild(energySection);
    }

    displayClimateData(data, container) {
        const climateSection = document.createElement('div');
        climateSection.className = 'result-section fade-in';
        climateSection.innerHTML = `
            <h3 class="result-title">Climate</h3>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-label">Temperature</span>
                    <span class="data-value">${data.temperature}°F</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Humidity</span>
                    <span class="data-value">${data.humidity}%</span>
                </div>
                <div class="data-item full-width">
                    <span class="data-label">Conditions</span>
                    <span class="data-value">${data.description}</span>
                </div>
            </div>
        `;
        container.appendChild(climateSection);
    }

    displayImpactData(data, container) {
        const impactSection = document.createElement('div');
        impactSection.className = 'result-section fade-in';
        impactSection.innerHTML = `
            <h3 class="result-title">Energy Impact</h3>
            <div class="impact-visual">
                <div class="impact-bar" style="--percentage: ${Math.min(data.energy.percent_increase * 10, 100)}%">
                    <span class="impact-label">Regional Increase</span>
                    <span class="impact-value">${data.energy.percent_increase.toFixed(2)}%</span>
                </div>
            </div>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-label">Annual Usage</span>
                    <span class="data-value">${data.energy.annual_mwh.toLocaleString()} MWh</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Annual Cost</span>
                    <span class="data-value">$${data.energy.annual_cost.toLocaleString()}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Cost Per Household</span>
                    <span class="data-value">$${data.energy.cost_per_household_annually.toFixed(2)}/yr</span>
                </div>
            </div>

            <h3 class="result-title">Carbon Impact</h3>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-label">Annual CO₂</span>
                    <span class="data-value">${data.carbon.annual_tons_co2.toLocaleString()} tons</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Car Equivalent</span>
                    <span class="data-value">${Math.round(data.carbon.equivalent_cars).toLocaleString()} cars</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Home Equivalent</span>
                    <span class="data-value">${Math.round(data.carbon.equivalent_homes).toLocaleString()} homes</span>
                </div>
            </div>

            <h3 class="result-title">Water Impact</h3>
            <div class="impact-visual">
                <div class="impact-bar" style="--percentage: ${Math.min(data.water.percent_increase * 10, 100)}%">
                    <span class="impact-label">Regional Increase</span>
                    <span class="impact-value">${data.water.percent_increase.toFixed(2)}%</span>
                </div>
            </div>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-label">Daily Usage</span>
                    <span class="data-value">${data.water.daily_gallons.toLocaleString()} gal</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Annual Usage</span>
                    <span class="data-value">${data.water.annual_gallons.toLocaleString()} gal</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Olympic Pools</span>
                    <span class="data-value">${data.water.olympic_pools_per_year.toFixed(1)}/yr</span>
                </div>
            </div>

            <h3 class="result-title">Economic Impact</h3>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-label">Jobs Created</span>
                    <span class="data-value">${data.economic.jobs_created}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Construction Cost</span>
                    <span class="data-value">$${(data.economic.estimated_construction_cost / 1000000).toFixed(1)}M</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Annual Operating Cost</span>
                    <span class="data-value">$${(data.economic.annual_operating_cost / 1000000).toFixed(1)}M</span>
                </div>
            </div>
        `;
        container.appendChild(impactSection);
    }

    displayFinalReport(report) {
        // Remove status indicator and replace streaming analysis with formatted version
        const statusDiv = document.querySelector('.analysis-status');
        if (statusDiv) {
            statusDiv.remove();
        }

        // Replace streaming analysis with formatted markdown version
        const streamingAnalysis = document.querySelector('.streaming-analysis');
        if (streamingAnalysis) {
            const formattedHTML = this.formatAnalysis(report.analysis);
            streamingAnalysis.innerHTML = formattedHTML;
            streamingAnalysis.classList.remove('streaming-analysis');
            streamingAnalysis.classList.add('llm-analysis');
        }

        // Show and populate charts
        this.displayCharts(report);

        // Store the report for future reference
        this.lastReport = report;
    }

    displayCharts(report) {
        const chartsContainer = document.getElementById('charts-container');
        if (!chartsContainer) return;

        chartsContainer.style.display = 'block';
        
        const impact = report.impact;
        
        // Chart.js colors - light palette with good contrast
        const colors = {
            primary: '#a8c9d4',      // Light blue
            secondary: '#c2d9a3',    // Light green
            tertiary: '#d4d18f',     // Light yellow-green
            accent: '#b8c9a0',       // Soft sage
            dark: '#15350e',         // Dark text
            border: '#588795'        // Darker border for definition
        };

        // 1. Energy & Carbon Chart (Bar chart)
        const energyCarbonCtx = document.getElementById('energyCarbonChart');
        if (energyCarbonCtx) {
            new Chart(energyCarbonCtx, {
                type: 'bar',
                data: {
                    labels: ['Annual Energy (MWh)', 'CO₂ Emissions (tons)', 'Car Equivalent', 'Home Equivalent'],
                    datasets: [{
                        label: 'Impact Metrics',
                        data: [
                            impact.energy.annual_mwh,
                            impact.carbon.annual_tons_co2,
                            impact.carbon.equivalent_cars,
                            impact.carbon.equivalent_homes
                        ],
                        backgroundColor: [colors.primary, colors.secondary, colors.tertiary, colors.accent],
                        borderColor: colors.border,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: colors.dark, font: { family: 'Space Mono' } },
                            grid: { color: 'rgba(194, 217, 163, 0.2)' }
                        },
                        x: {
                            ticks: { color: colors.dark, font: { family: 'Space Mono', size: 9 } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // 2. Resource Consumption (Doughnut chart)
        const resourceCtx = document.getElementById('resourceChart');
        if (resourceCtx) {
            new Chart(resourceCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Daily Water (k gal)', 'Annual Energy Cost ($k)', 'Operating Cost ($M)'],
                    datasets: [{
                        data: [
                            impact.water.daily_gallons / 1000,
                            impact.energy.annual_cost / 1000,
                            impact.economic.annual_operating_cost / 1000000
                        ],
                        backgroundColor: [colors.primary, colors.secondary, colors.tertiary],
                        borderColor: '#ffffff',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { 
                                color: colors.dark, 
                                font: { family: 'Space Mono', size: 10 },
                                padding: 12
                            }
                        }
                    }
                }
            });
        }

        // 3. Economic Impact (Horizontal bar)
        const economicCtx = document.getElementById('economicChart');
        if (economicCtx) {
            new Chart(economicCtx, {
                type: 'bar',
                data: {
                    labels: ['Jobs Created', 'Construction ($M)', 'Annual Op. Cost ($M)'],
                    datasets: [{
                        label: 'Economic Metrics',
                        data: [
                            impact.economic.jobs_created,
                            impact.economic.estimated_construction_cost / 1000000,
                            impact.economic.annual_operating_cost / 1000000
                        ],
                        backgroundColor: colors.accent,
                        borderColor: colors.border,
                        borderWidth: 2
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: { color: colors.dark, font: { family: 'Space Mono' } },
                            grid: { color: 'rgba(194, 217, 163, 0.2)' }
                        },
                        y: {
                            ticks: { color: colors.dark, font: { family: 'Space Mono', size: 10 } },
                            grid: { display: false }
                        }
                    }
                }
            });
        }

        // 4. Regional Impact (Radar chart)
        const regionalCtx = document.getElementById('regionalChart');
        if (regionalCtx) {
            // Normalize all values to 0-100 scale
            const energyImpact = Math.min(impact.energy.percent_increase * 10, 100);
            const waterImpact = Math.min(impact.water.percent_increase * 10, 100);
            const carbonImpact = Math.min((impact.carbon.annual_tons_co2 / 1000), 100);
            const economicBenefit = Math.min((impact.economic.jobs_created / 5), 100);
            const jobsImpact = Math.min((impact.economic.jobs_created / 5), 100);
            
            new Chart(regionalCtx, {
                type: 'radar',
                data: {
                    labels: ['Energy Impact', 'Water Impact', 'Carbon Impact', 'Economic Benefit', 'Jobs Impact'],
                    datasets: [{
                        label: 'Regional Impact Profile',
                        data: [energyImpact, waterImpact, carbonImpact, economicBenefit, jobsImpact],
                        backgroundColor: 'rgba(194, 217, 163, 0.3)',
                        borderColor: colors.border,
                        borderWidth: 2,
                        pointBackgroundColor: colors.border,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            min: 0,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                color: colors.dark,
                                font: { family: 'Space Mono', size: 9 },
                                backdropColor: 'rgba(255, 255, 255, 0.8)',
                                backdropPadding: 4
                            },
                            grid: { color: 'rgba(88, 135, 149, 0.2)' },
                            angleLines: { color: 'rgba(88, 135, 149, 0.2)' },
                            pointLabels: {
                                color: colors.dark,
                                font: { family: 'Space Mono', size: 10, weight: '600' }
                            }
                        }
                    }
                }
            });
        }

        // Scroll to show charts
        setTimeout(() => {
            const rightSidebar = document.querySelector('.right-sidebar .sidebar-content');
            if (rightSidebar) {
                rightSidebar.scrollTop = rightSidebar.scrollHeight;
            }
        }, 300);
    }

    formatAnalysis(text) {
        // Enhanced markdown formatting
        let html = text;
        
        // Convert headers (## Header -> <h3>Header</h3>)
        html = html.replace(/^### (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^# (.*$)/gim, '<h2>$1</h2>');
        
        // Convert bold (**text** -> <strong>text</strong>)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic (*text* -> <em>text</em>)
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert bullet lists (- item -> <li>item</li>)
        html = html.replace(/^\s*[-*]\s+(.+)$/gim, '<li>$1</li>');
        
        // Wrap consecutive <li> items in <ul>
        html = html.replace(/(<li>.*<\/li>)/s, function(match) {
            return '<ul>' + match + '</ul>';
        });
        
        // Convert numbered lists (1. item -> <li>item</li>)
        html = html.replace(/^\s*\d+\.\s+(.+)$/gim, '<li>$1</li>');
        
        // Wrap consecutive numbered <li> items in <ol>
        html = html.replace(/(<li>.*<\/li>)/s, function(match) {
            if (!match.includes('<ul>')) {
                return '<ol>' + match + '</ol>';
            }
            return match;
        });
        
        // Convert paragraphs (double newline -> </p><p>)
        html = html.replace(/\n\n+/g, '</p><p>');
        
        // Convert single newlines to <br> inside paragraphs
        html = html.replace(/\n/g, '<br>');
        
        // Wrap in paragraph tags if not already wrapped
        if (!html.startsWith('<')) {
            html = '<p>' + html + '</p>';
        }
        
        // Clean up empty tags
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<br><br>/g, '<br>');
        
        return html;
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

