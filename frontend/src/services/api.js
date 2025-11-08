// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// AI Service for interacting with the backend
export const aiService = {
  /**
   * Ask a question to the AI agent
   * @param {string} teamId - The team ID
   * @param {string} question - The question to ask
   * @returns {Promise<{answer: string}>}
   */
  async askQuestion(teamId, question) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId, question }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error asking AI:', error);
      throw error;
    }
  },

  /**
   * Get AI-generated team summary
   * @param {string} teamId - The team ID
   * @returns {Promise<{summary: string}>}
   */
  async getTeamSummary(teamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/team-summary/${teamId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting team summary:', error);
      throw error;
    }
  },

  /**
   * Get AI suggestions for team improvements
   * @param {string} teamId - The team ID
   * @returns {Promise<{suggestions: Array}>}
   */
  async getTeamSuggestions(teamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/suggestions/${teamId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  },
};

// Notifications Service
export const notificationsService = {
  /**
   * Get all notifications
   * @returns {Promise<Array>}
   */
  async getNotifications() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - The notification ID
   * @returns {Promise<void>}
   */
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<void>}
   */
  async markAllAsRead() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },
};

// Teams Service
export const teamsService = {
  /**
   * Get all teams
   * @returns {Promise<Array>}
   */
  async getTeams() {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  /**
   * Get team details
   * @param {string} teamId - The team ID
   * @returns {Promise<Object>}
   */
  async getTeamDetails(teamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching team details:', error);
      throw error;
    }
  },

  /**
   * Get team activity
   * @param {string} teamId - The team ID
   * @returns {Promise<Array>}
   */
  async getTeamActivity(teamId) {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}/activity`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching team activity:', error);
      throw error;
    }
  },
};

export default {
  ai: aiService,
  notifications: notificationsService,
  teams: teamsService,
};
