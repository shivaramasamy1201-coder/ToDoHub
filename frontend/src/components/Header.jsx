import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { taskService } from '../services/supabase/taskService';
import { generateNotifications } from '../utils/notificationGenerator';
import logoSvg from '../assets/logo.svg';

/**
 * Header Component
 */
const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    let isMounted = true;
    if (user) {
      taskService.getTasks().then((res) => {
        if (isMounted && !res.error && res.data) {
          const notifs = generateNotifications(res.data);
          setNotifCount(notifs.length);
        }
      });
    }
    return () => { isMounted = false; };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="app-header" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <button
          className="todohub-btn todohub-btn-icon"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          style={{ display: 'flex' }}
        >
          <Menu size={18} />
        </button>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>
          <img src={logoSvg} alt="ToDoHub Logo" style={{ width: '26px', height: '26px' }} />
          <span>ToDoHub</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'none', mdDisplay: 'inline' }}>
          {fullName}
        </span>
        <Link
          to="/notifications"
          className="todohub-btn todohub-btn-icon"
          aria-label="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {notifCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                minWidth: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: '#131313',
                fontSize: '0.625rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px'
              }}
            >
              {notifCount > 99 ? '99+' : notifCount}
            </span>
          )}
        </Link>
        <Link to="/profile" className="todohub-btn todohub-btn-icon" aria-label="User Profile">
          <User size={18} />
        </Link>
        <button className="todohub-btn todohub-btn-icon" onClick={handleLogout} aria-label="Sign Out" title="Sign Out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
