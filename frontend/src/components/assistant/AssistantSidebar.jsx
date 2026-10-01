import React, { useState } from 'react';
import { Plus, MessageSquare, Search, X } from 'lucide-react';

/**
 * AssistantSidebar Component
 * Left panel displaying conversation history, new chat trigger, and chat search
 */
const AssistantSidebar = ({
  isOpen,
  onClose,
  conversations = [],
  activeId,
  onSelectConversation,
  onNewChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((c) =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={`assistant-sidebar ${isOpen ? 'open' : ''}`} aria-label="Chat History Sidebar">
      <div className="assistant-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Conversations</span>
          <button
            type="button"
            className="todohub-btn todohub-btn-icon"
            onClick={onClose}
            style={{ display: 'flex', border: 'none', background: 'transparent' }}
            aria-label="Close conversation drawer"
          >
            <X size={16} />
          </button>
        </div>

        <button
          type="button"
          className="todohub-btn todohub-btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={onNewChat}
        >
          <Plus size={16} /> New Chat
        </button>

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="todohub-input"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2rem', fontSize: '0.8125rem' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      <div className="assistant-sidebar-list">
        {filteredConversations.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem 0' }}>
            No past conversations.
          </p>
        ) : (
          filteredConversations.map((item) => (
            <div
              key={item.id}
              className={`conversation-item ${activeId === item.id ? 'active' : ''}`}
              onClick={() => {
                onSelectConversation(item.id);
                if (onClose) onClose();
              }}
            >
              <MessageSquare size={16} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default AssistantSidebar;
