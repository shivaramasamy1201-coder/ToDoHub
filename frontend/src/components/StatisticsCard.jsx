import React from 'react';

/**
 * StatisticsCard Component Placeholder
 */
const StatisticsCard = ({ title, value, description, icon: Icon }) => {
  return (
    <div className="todohub-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {title || 'Statistic'}
        </span>
        {Icon && <Icon size={20} style={{ color: 'var(--color-text-secondary)' }} />}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
        {value !== undefined ? value : '0'}
      </div>
      {description && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {description}
        </span>
      )}
    </div>
  );
};

export default StatisticsCard;
