import React, { useRef, useEffect } from 'react';
import { Send, Paperclip, Mic } from 'lucide-react';

/**
 * MessageComposer Component
 * Bottom chat input bar with auto-expanding textarea, Enter-to-send, and Shift+Enter newline
 */
const MessageComposer = ({ value, onChange, onSend, disabled = false }) => {
  const textareaRef = useRef(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && onSend) {
        onSend();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !disabled && onSend) {
      onSend();
    }
  };

  return (
    <div className="composer-container">
      <form onSubmit={handleSubmit}>
        <div className="composer-box">
          <textarea
            ref={textareaRef}
            className="composer-textarea"
            placeholder="Ask AI Assistant anything about your tasks... (Press Enter to send, Shift+Enter for newline)"
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            aria-label="Message prompt composer"
          />

          <div className="composer-actions">
            {/* Visual placeholder for Attachment (Disabled for current stage) */}
            <button
              type="button"
              className="todohub-btn todohub-btn-icon"
              style={{ opacity: 0.4, cursor: 'not-allowed', border: 'none', background: 'transparent' }}
              title="Attachment support coming in next update"
              aria-label="Attach file (coming soon)"
              disabled
            >
              <Paperclip size={18} />
            </button>

            {/* Visual placeholder for Voice input (Disabled for current stage) */}
            <button
              type="button"
              className="todohub-btn todohub-btn-icon"
              style={{ opacity: 0.4, cursor: 'not-allowed', border: 'none', background: 'transparent' }}
              title="Voice input coming in next update"
              aria-label="Voice input (coming soon)"
              disabled
            >
              <Mic size={18} />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              className="todohub-btn todohub-btn-primary todohub-btn-icon"
              disabled={!value.trim() || disabled}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageComposer;
