import React from 'react';
import SearchBar from './SearchBar';
import { Filter } from 'lucide-react';

/**
 * FilterBar Component Placeholder
 */
const FilterBar = () => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      marginBottom: '1.25rem'
    }}>
      <SearchBar />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          <Filter size={16} />
          <span>Filters:</span>
        </div>

        <select className="todohub-input" style={{ width: 'auto', padding: '0.375rem 0.625rem' }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>

        <select className="todohub-input" style={{ width: 'auto', padding: '0.375rem 0.625rem' }}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
