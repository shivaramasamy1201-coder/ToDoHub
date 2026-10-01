import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * SuggestionCard Component
 * Renders quick prompt suggestions on the assistant welcome screen
 */
const SuggestionCard = ({ text, description, onSelect }) => {
  return (
    <button
      className="suggestion-card"
      onClick={() => onSelect && onSelect(text)}
      type="button"
      aria-label={`Select suggestion: ${text}`}
    >
      <Sparkles size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-text-secondary)' }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text)' }}>
          {text}
        </div>
        {description && (
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {description}
          </div>
        )}
      </div>
    </button>
  );
};

export default SuggestionCard;
