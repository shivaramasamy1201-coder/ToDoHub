import React from 'react';
import { AlertOctagon } from 'lucide-react';

/**
 * ErrorState Component Placeholder
 */
const ErrorState = ({ title = 'Something Went Wrong', message = 'Failed to load resources. Please try again later.', onRetry }) => {
  return (
    <div className="state-container todohub-card" role="alert">
      <AlertOctagon size={40} style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }} />
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '360px' }}>{message}</p>
      {onRetry && (
        <button className="todohub-btn" onClick={onRetry} style={{ marginTop: '0.75rem' }}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
