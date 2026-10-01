import React from 'react';
import { Info, CheckCircle, AlertCircle, X } from 'lucide-react';

/**
 * Toast Component Placeholder
 */
const Toast = ({ message = 'Action performed successfully.', type = 'info', onClose }) => {
  const renderIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={18} />;
      case 'error': return <AlertCircle size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className="toast-container">
      <div className="toast" role="alert">
        {renderIcon()}
        <span>{message}</span>
        {onClose && (
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
            aria-label="Close Toast"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
