// React Hook for Push Notifications
// Provides easy access to push notification functionality

import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService, PushNotification } from '@/services/pushNotifications';

interface UsePushNotificationsOptions {
  userId?: number;
  userRole?: 'driver' | 'manager';
  autoSubscribe?: boolean;
}

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
  currentToken: string | null;
}

export function usePushNotifications(options: UsePushNotificationsOptions = {}): UsePushNotificationsReturn {
  const { userId, userRole, autoSubscribe = false } = options;

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Check if notifications are supported
  const isSupported = pushNotificationService.isSupported();

  // Initialize
  useEffect(() => {
    if (!isSupported) return;

    // Initialize service
    pushNotificationService.initialize().then(() => {
      setPermission(pushNotificationService.getPermission());
      setIsSubscribed(pushNotificationService.isSubscribed());
      setCurrentToken(pushNotificationService.getCurrentToken());
    });
  }, [isSupported]);

  // Auto-subscribe if enabled
  useEffect(() => {
    if (autoSubscribe && userId && userRole && !isSubscribed && permission === 'default') {
      subscribe();
    }
  }, [autoSubscribe, userId, userRole, isSubscribed, permission]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!userId || !userRole) {
      console.warn('userId and userRole are required to subscribe');
      return false;
    }

    try {
      const token = await pushNotificationService.subscribe(userId, userRole);
      
      if (token) {
        setIsSubscribed(true);
        setPermission('granted');
        setCurrentToken(token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      return false;
    }
  }, [userId, userRole]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      console.warn('userId is required to unsubscribe');
      return false;
    }

    try {
      const success = await pushNotificationService.unsubscribe(userId);
      
      if (success) {
        setIsSubscribed(false);
        setCurrentToken(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }, [userId]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const perm = await pushNotificationService.requestPermission();
    setPermission(perm);
    return perm;
  }, []);

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
    currentToken
  };
}

// Hook for listening to foreground messages
export function usePushNotificationListener(
  callback: (notification: PushNotification) => void
): void {
  useEffect(() => {
    const unsubscribe = pushNotificationService.addMessageListener(callback);
    return unsubscribe;
  }, [callback]);
}

// Hook for getting notification history
export function useNotificationHistory(userId: number) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications/history/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load notifications');
      }
      
      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch(`/api/notifications/read-all/${userId}`, {
        method: 'POST'
      });
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date() }))
      );
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [userId]);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  const refresh = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  };
}
