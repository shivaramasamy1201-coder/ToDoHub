import React from 'react';
import { Search } from 'lucide-react';

/**
 * SearchBar Component Placeholder
 */
const SearchBar = ({ value, onChange, placeholder = 'Search tasks...' }) => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-text-muted)',
          pointerEvents: 'none'
        }}
      />
      <input
        type="search"
        className="todohub-input"
        style={{ paddingLeft: '2.25rem' }}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        aria-label="Search"
      />
    </div>
  );
};

export default SearchBar;
