// State Management Module - Handles caching of location and configuration data
// Uses localStorage for persistence across page navigation

const STATE_KEY = 'evolv_app_state';

export class StateManager {
    constructor() {
        this.state = this.loadState();
    }

    /**
     * Load state from localStorage
     */
    loadState() {
        try {
            const stored = localStorage.getItem(STATE_KEY);
            if (stored) {
                const state = JSON.parse(stored);
                console.log('📦 Loaded cached state:', state);
                return state;
            }
        } catch (error) {
            console.error('Error loading state:', error);
        }
        return this.getDefaultState();
    }

    /**
     * Save state to localStorage
     */
    saveState(state) {
        try {
            this.state = { ...this.state, ...state };
            localStorage.setItem(STATE_KEY, JSON.stringify(this.state));
            console.log('💾 Saved state:', this.state);
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    /**
     * Get default/empty state
     */
    getDefaultState() {
        return {
            location: null,
            config: null,
            lastAnalysis: null,
            timestamp: null
        };
    }

    /**
     * Save location data
     */
    saveLocation(location) {
        this.saveState({
            location: {
                lat: location.lat,
                lng: location.lng
            },
            timestamp: Date.now()
        });
    }

    /**
     * Save configuration data
     */
    saveConfig(config) {
        this.saveState({
            config: {
                power_mw: config.power_mw,
                servers: config.servers,
                square_feet: config.square_feet,
                employees: config.employees,
                data_center_type: config.data_center_type || 'colocation'
            },
            timestamp: Date.now()
        });
    }

    /**
     * Save analysis results
     */
    saveAnalysisResults(results) {
        this.saveState({
            lastAnalysis: results,
            timestamp: Date.now()
        });
    }

    /**
     * Get cached location
     */
    getLocation() {
        return this.state.location;
    }

    /**
     * Get cached configuration
     */
    getConfig() {
        return this.state.config;
    }

    /**
     * Get last analysis results
     */
    getLastAnalysis() {
        return this.state.lastAnalysis;
    }

    /**
     * Check if we have valid cached data
     */
    hasValidCache() {
        return !!(this.state.location && this.state.config);
    }

    /**
     * Get cache age in minutes
     */
    getCacheAge() {
        if (!this.state.timestamp) return null;
        return Math.floor((Date.now() - this.state.timestamp) / 1000 / 60);
    }

    /**
     * Clear all cached state
     */
    clearState() {
        this.state = this.getDefaultState();
        localStorage.removeItem(STATE_KEY);
        console.log('🗑️ Cleared cached state');
    }

    /**
     * Get formatted cache info for display
     */
    getCacheInfo() {
        if (!this.hasValidCache()) {
            return null;
        }

        const age = this.getCacheAge();
        const ageText = age < 60 
            ? `${age} minute${age !== 1 ? 's' : ''} ago`
            : `${Math.floor(age / 60)} hour${Math.floor(age / 60) !== 1 ? 's' : ''} ago`;

        return {
            location: this.state.location,
            config: this.state.config,
            age: ageText,
            timestamp: this.state.timestamp
        };
    }
}

// Create and export a singleton instance
export const stateManager = new StateManager();


