import React from 'react';
import { Bot } from 'lucide-react';
import SuggestionCard from './SuggestionCard';

/**
 * EmptyChatState Component
 * Displays welcome screen and quick suggestion prompts
 */
const EmptyChatState = ({ onSelectSuggestion }) => {
  const suggestions = [
    { text: 'Show my overdue tasks', description: 'Review pending items past deadline' },
    { text: 'What should I focus on today?', description: 'Get a prioritized task overview' },
    { text: 'Write me a professional email', description: 'AI writing assistance' },
    { text: 'Give me productivity tips', description: 'Time management & focus advice' }
  ];

  return (
    <div className="assistant-welcome">
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-surface-secondary)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem'
      }}>
        <Bot size={28} />
      </div>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        How can I help you today?
      </h1>
      <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', maxWidth: '480px' }}>
        Your AI assistant for tasks, productivity analysis, web search, writing, and general knowledge.
      </p>

      <div className="suggestion-grid">
        {suggestions.map((item, index) => (
          <SuggestionCard
            key={index}
            text={item.text}
            description={item.description}
            onSelect={onSelectSuggestion}
          />
        ))}
      </div>
    </div>
  );
};

export default EmptyChatState;
