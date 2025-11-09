// API Module - Handles backend communication

import { API_CONFIG } from './config.js';

export class APIClient {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
    }

    async analyzeImpactStream(location, config, onUpdate, onComplete, onError) {
        try {
            const payload = {
                latitude: location.lat,
                longitude: location.lng,
                ...config
            };

            const response = await fetch(`${this.baseUrl}/api/analyze/stream`, {
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
                buffer = lines.pop(); // Keep incomplete line in buffer
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonData = line.slice(6);
                        try {
                            const data = JSON.parse(jsonData);
                            
                            if (data.status === 'complete') {
                                onComplete(data.report);
                            } else if (data.status === 'error') {
                                onError(new Error(data.message));
                            } else {
                                onUpdate(data);
                            }
                        } catch (e) {
                            console.warn('Failed to parse SSE data:', jsonData);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error analyzing impact:', error);
            onError(error);
        }
    }

    async analyzeImpact(location, config) {
        try {
            const payload = {
                latitude: location.lat,
                longitude: location.lng,
                ...config
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

