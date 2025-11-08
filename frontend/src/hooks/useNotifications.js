import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsService } from '../services/api.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

/**
 * Custom hook for managing notifications
 * @returns {Object} Notifications state and methods
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);

  /**
   * Fetch notifications from the backend
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await notificationsService.getNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
      
      // Use mock data as fallback
      setNotifications([
        {
          id: 1,
          type: 'mention',
          title: 'Sarah Chen mentioned you',
          message: 'in #backend-team: "Can you review the API changes?"',
          time: '5 min ago',
          unread: true
        },
        {
          id: 2,
          type: 'update',
          title: 'Sprint Planning Complete',
          message: 'Backend Team has completed sprint planning for Sprint 24',
          time: '1 hour ago',
          unread: true
        },
        {
          id: 3,
          type: 'alert',
          title: 'Critical Issue Detected',
          message: 'Production API response time exceeded threshold',
          time: '2 hours ago',
          unread: false
        },
        {
          id: 4,
          type: 'success',
          title: 'Deployment Successful',
          message: 'v2.3.0 deployed to production successfully',
          time: '3 hours ago',
          unread: false
        },
        {
          id: 5,
          type: 'mention',
          title: 'Alex Kumar assigned you',
          message: 'to task BACK-235: Optimize database queries',
          time: '5 hours ago',
          unread: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mark a notification as read
   * @param {string} notificationId - The notification ID
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, unread: false } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      
      // Update locally even if API fails
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, unread: false } : notif
        )
      );
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, unread: false }))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
      
      // Update locally even if API fails
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, unread: false }))
      );
    }
  }, []);

  /**
   * Add a new notification (for real-time updates)
   * @param {Object} notification - The notification object
   */
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up Server-Sent Events for real-time notifications
  useEffect(() => {
    const sseUrl = `${API_BASE_URL.replace('/api', '')}/api/sse/notifications`;
    
    try {
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            // Add new notification to the list
            addNotification(data.data);
          } else if (data.type === 'connected') {
            console.log('✅ Connected to notification stream');
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    } catch (err) {
      console.error('Error setting up SSE:', err);
    }
  }, [addNotification]);

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    addNotification,
    refresh: fetchNotifications,
  };
};

export default useNotifications;
