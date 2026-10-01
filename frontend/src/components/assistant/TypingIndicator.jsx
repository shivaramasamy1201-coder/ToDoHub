import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * TypingIndicator Component
 * Renders pulsing animated dots when assistant is preparing a response
 */
const TypingIndicator = () => {
  return (
    <div className="chat-message-group assistant" role="status" aria-live="polite">
      <div className="chat-avatar assistant">
        <Sparkles size={16} />
      </div>
      <div className="chat-bubble assistant">
        <div className="typing-dots">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
