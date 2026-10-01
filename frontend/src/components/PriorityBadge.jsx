import React from 'react';

/**
 * PriorityBadge Component Placeholder
 */
const PriorityBadge = ({ priority = 'medium' }) => {
  const norm = priority.toLowerCase();
  const badgeClass = `todohub-badge badge-priority-${norm}`;

  return (
    <span className={badgeClass}>
      ● {norm.charAt(0).toUpperCase() + norm.slice(1)} Priority
    </span>
  );
};

export default PriorityBadge;
