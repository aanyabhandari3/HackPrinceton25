// API Module - Handles backend communication

import { API_CONFIG } from './config.js';

export class APIClient {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
    }

    async analyzeImpact(location, config) {
        try {
            const payload = {
                latitude: location.lat,
                longitude: location.lng,
                // ...config
            };

            const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.analyze}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error analyzing impact:', error);
            throw error;
        }
    }

    async getDataCenterTypes() {
        try {
            const response = await fetch(`${this.baseUrl}${API_CONFIG.endpoints.dataCenterTypes}`);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data center types:', error);
            throw error;
        }
    }
}

