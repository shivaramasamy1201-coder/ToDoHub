import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, PlusCircle, Sparkles, User } from 'lucide-react';

/**
 * MobileNavigation Component
 */
const MobileNavigation = () => {
  const items = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', path: '/tasks', icon: ListTodo },
    { label: 'AI', path: '/assistant', icon: Sparkles },
    { label: 'New', path: '/tasks/new', icon: PlusCircle },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <nav className="mobile-nav" aria-label="Mobile Navigation Bar">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontSize: '0.6875rem',
              gap: '2px'
            })}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNavigation;
