import React from 'react';
import { Sparkles, Menu, Plus } from 'lucide-react';

/**
 * AssistantHeader Component
 * Top bar inside the chat main area with drawer toggle, title, and new chat action
 */
const AssistantHeader = ({ title = 'AI Assistant', onToggleSidebar, onNewChat }) => {
  return (
    <div className="assistant-header-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          className="todohub-btn todohub-btn-icon"
          onClick={onToggleSidebar}
          aria-label="Toggle chat history"
          style={{ display: 'flex' }}
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={14} />
          </div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h2>
        </div>
      </div>

      <button
        type="button"
        className="todohub-btn todohub-btn-sm"
        onClick={onNewChat}
        aria-label="Start new chat"
      >
        <Plus size={14} /> New Chat
      </button>
    </div>
  );
};

export default AssistantHeader;
