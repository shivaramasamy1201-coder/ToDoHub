import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LoadingState Component Placeholder
 */
const LoadingState = ({ message = 'Loading content...' }) => {
  return (
    <div className="state-container" role="status">
      <Loader2 size={28} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      <p style={{ fontSize: '0.875rem' }}>{message}</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
