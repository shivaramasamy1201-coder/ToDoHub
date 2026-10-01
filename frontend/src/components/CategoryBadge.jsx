import React from 'react';

/**
 * CategoryBadge Component
 */
const CategoryBadge = ({ category }) => {
  const name = typeof category === 'object' && category ? category.name : (category || 'General');

  return (
    <span className="todohub-badge">
      #{name}
    </span>
  );
};

export default CategoryBadge;
