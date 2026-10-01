import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, LogOut, Search, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { taskService } from '../services/supabase/taskService';
import { generateNotifications } from '../utils/notificationGenerator';
import todoHubLogo from '../assets/todohub-logo.png';

/**
 * Header Component with Centered Unique Search Bar
 */
const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  // Sync search input with URL search param if navigating
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Handle Ctrl+K / Cmd+K keyboard shortcut focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/tasks');
    }
    setIsMobileSearchOpen(false);
  };

  return (
    <header className="app-header" role="banner" style={{ position: 'relative' }}>
      {/* LEFT: Menu Toggle + Brand Logo & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
        <button
          className="todohub-btn todohub-btn-icon"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          style={{ display: 'flex' }}
        >
          <Menu size={18} />
        </button>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
          <img
            src={todoHubLogo}
            alt="ToDoHub Logo"
            style={{
              height: '30px',
              width: '30px',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
            lineHeight: 1,
            whiteSpace: 'nowrap'
          }}>
            ToDoHub
          </span>
        </Link>
      </div>

      {/* CENTER: Centered Unique Search Bar (Desktop/Tablet) */}
      <div className="header-search-container">
        <form onSubmit={handleSearchSubmit} className="header-search-form" role="search">
          <Search size={16} className="header-search-icon" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="search"
            className="header-search-input"
            placeholder="Search tasks, categories, or anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tasks, categories, or anything"
          />
          <kbd className="header-search-kbd">
            {isMac ? '⌘ K' : 'Ctrl K'}
          </kbd>
        </form>
      </div>

      {/* RIGHT: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {/* Mobile Search Toggle Icon */}
        <button
          className="todohub-btn todohub-btn-icon header-search-mobile-btn"
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          aria-label="Toggle mobile search"
        >
          {isMobileSearchOpen ? <X size={18} /> : <Search size={18} />}
        </button>

        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'none' }}>
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

      {/* Mobile Search Overlay Bar */}
      {isMobileSearchOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          padding: '0.75rem 1rem',
          backgroundColor: '#0d0f17',
          borderBottom: '1px solid rgba(139, 92, 246, 0.25)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 30
        }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.45)' }} />
            <input
              type="search"
              className="header-search-input"
              style={{ paddingRight: '1rem' }}
              placeholder="Search tasks, categories, or anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              aria-label="Mobile Search"
            />
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
