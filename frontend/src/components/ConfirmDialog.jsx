import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog Component Placeholder
 */
const ConfirmDialog = ({ isOpen, title = 'Confirm Action', message, onConfirm, onCancel }) => {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onCancel}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <AlertTriangle size={24} style={{ color: 'var(--color-text)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {message || 'Are you sure you want to proceed with this action? This step cannot be undone.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button className="todohub-btn" onClick={onCancel}>Cancel</button>
          <button className="todohub-btn todohub-btn-primary" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
