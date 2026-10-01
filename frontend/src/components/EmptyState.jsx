import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState Component Placeholder
 */
const EmptyState = ({ title = 'No Tasks Found', description = 'There are no items matching your criteria.', actionLabel, onAction }) => {
  return (
    <div className="state-container todohub-card">
      <Inbox size={40} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '360px' }}>{description}</p>
      {actionLabel && (
        <button className="todohub-btn todohub-btn-primary" onClick={onAction} style={{ marginTop: '0.75rem' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
