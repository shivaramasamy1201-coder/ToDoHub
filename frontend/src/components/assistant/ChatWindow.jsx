import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import EmptyChatState from './EmptyChatState';
import TypingIndicator from './TypingIndicator';

/**
 * ChatWindow Component
 * Conversation view containing empty state or message stream with typing indicator
 */
const ChatWindow = ({ messages = [], isTyping = false, onSelectSuggestion }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <EmptyChatState onSelectSuggestion={onSelectSuggestion} />
      ) : (
        <>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
};

export default ChatWindow;
