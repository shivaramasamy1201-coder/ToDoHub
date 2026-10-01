import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../layouts/AppLayout';
import NotificationPanel from '../components/NotificationPanel';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { taskService } from '../services/supabase/taskService';
import { generateNotifications } from '../utils/notificationGenerator';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await taskService.getTasks();
    if (res.error) {
      setError(res.error);
    } else {
      const notifs = generateNotifications(res.data || []);
      setNotifications(notifs);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Notifications</h1>
          <p className="page-subtitle">Alerts, updates and deadline reminders</p>
        </div>
      </div>

      <div style={{ maxWidth: '720px' }}>
        {loading ? (
          <LoadingState message="Loading notifications..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchNotifications} />
        ) : (
          <NotificationPanel notifications={notifications} />
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
