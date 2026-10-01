import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ListTodo, 
  FolderKanban, 
  Calendar as CalendarIcon, 
  Bell, 
  Sparkles,
  Settings, 
  X,
  LogOut
} from 'lucide-react';

import todoHubLogo from '../assets/todohub-logo.png';

/**
 * Sidebar Component
 */
const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Handle ESC key press to close open sidebar
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'All Tasks', path: '/tasks', icon: ListTodo },
    { label: 'Completed', path: '/tasks/completed', icon: CheckCircle2 },
    { label: 'Pending', path: '/tasks/pending', icon: Clock },
    { label: 'Overdue', path: '/tasks/overdue', icon: AlertCircle },
    { label: 'Categories', path: '/categories', icon: FolderKanban },
    { label: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'AI Assistant', path: '/assistant', icon: Sparkles },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop overlay for drawer mode */}
      {isOpen && (
        <div 
          onClick={onClose} 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 25
          }}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`} aria-label="Sidebar Navigation">
        <div style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <img
              src={todoHubLogo}
              alt="ToDoHub Logo"
              style={{
                height: '26px',
                width: '26px',
                objectFit: 'contain',
                flexShrink: 0
              }}
            />
            <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              ToDoHub
            </span>
          </div>
          <button 
            className="todohub-btn todohub-btn-icon" 
            onClick={onClose} 
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? 'var(--color-surface-secondary)' : 'transparent',
                  color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)',
                  border: isActive ? '1px solid var(--color-border)' : '1px solid transparent'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              background: 'none',
              border: 'none',
              width: '100%',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
