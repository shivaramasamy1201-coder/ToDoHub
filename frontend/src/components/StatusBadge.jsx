import React from 'react';

/**
 * StatusBadge Component Placeholder
 */
const StatusBadge = ({ status = 'pending' }) => {
  const norm = status.toLowerCase();
  const badgeClass = `todohub-badge badge-status-${norm}`;

  return (
    <span className={badgeClass}>
      {norm.charAt(0).toUpperCase() + norm.slice(1)}
    </span>
  );
};

export default StatusBadge;
