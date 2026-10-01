import React from 'react';

/**
 * PageTransition Component
 * Provides subtle opacity, scale, and translateY entry transitions for page routes
 */
const PageTransition = ({ children }) => {
  return (
    <div className="page-transition-wrapper">
      {children}
    </div>
  );
};

export default PageTransition;
