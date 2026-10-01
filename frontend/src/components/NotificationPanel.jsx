import React, { useState } from 'react';
import { Bell, AlertCircle, Clock, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * NotificationPanel Component
 */
const NotificationPanel = ({ notifications = [], onMarkRead }) => {
  const [filter, setFilter] = useState('all');
  const [readIds, setReadIds] = useState(new Set());

  const handleToggleRead = (id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMarkAllRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    if (onMarkRead) onMarkRead();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'overdue') return n.category === 'overdue';
    if (filter === 'today') return n.category === 'today';
    if (filter === 'upcoming') return n.category === 'upcoming';
    return true;
  });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'overdue':
        return <AlertCircle size={16} color="#ef4444" />;
      case 'today':
        return <Clock size={16} color="#f59e0b" />;
      case 'upcoming':
        return <Calendar size={16} color="#3b82f6" />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <div className="todohub-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.125rem' }}>
          <Bell size={20} />
          <span>Notifications</span>
          <span className="todohub-badge">{notifications.length}</span>
        </div>
        {notifications.length > 0 && (
          <button className="todohub-btn todohub-btn-sm" onClick={handleMarkAllRead}>
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
        {['all', 'overdue', 'today', 'upcoming'].map((tab) => (
          <button
            key={tab}
            className={`todohub-btn todohub-btn-sm ${filter === tab ? 'todohub-btn-primary' : ''}`}
            onClick={() => setFilter(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredNotifications.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', textAlign: 'center', padding: '1.5rem 0' }}>
            No notifications in this view.
          </p>
        ) : (
          filteredNotifications.map((n) => {
            const isRead = readIds.has(n.id);
            return (
              <div
                key={n.id}
                style={{
                  padding: '0.875rem 1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isRead ? 'var(--color-surface)' : 'var(--color-surface-secondary)',
                  opacity: isRead ? 0.7 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9375rem' }}>
                    {getCategoryIcon(n.category)}
                    <span>{n.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{n.time}</span>
                    <button
                      className="todohub-btn todohub-btn-sm"
                      style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                      onClick={() => handleToggleRead(n.id)}
                      title={isRead ? 'Mark Unread' : 'Mark Read'}
                    >
                      {isRead ? 'Unread' : <CheckCircle size={14} />}
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {n.message}
                </p>

                {n.taskId && (
                  <div style={{ marginTop: '0.25rem' }}>
                    <Link
                      to={`/tasks/${n.taskId}`}
                      style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)' }}
                    >
                      View Task →
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
