import React, { useState, useEffect } from 'react';
import { Sparkles, X, Bot, Minus } from 'lucide-react';
import ChatWindow from './ChatWindow';
import MessageComposer from './MessageComposer';
import { sendAssistantMessage } from '../../services/api/assistantService';

/**
 * FloatingAIAgent Component
 * Fixed floating AI Agent button and anchored compact chat panel for ToDoHub
 */
const FloatingAIAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Keyboard Escape listener to close panel when open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const result = await sendAssistantMessage(text, messages);

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: result.success
          ? result.message
          : result.error || "Sorry, I couldn't connect to ToDoHub AI right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: result.source || null
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Floating AI Agent submit error:', err);
      const errorMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: "Sorry, I couldn't connect to ToDoHub AI right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectSuggestion = (promptText) => {
    setInputValue(promptText);
  };

  return (
    <div className="floating-ai-agent-wrapper">
      {/* Anchored Compact Chat Panel */}
      {isOpen && (
        <div 
          className="floating-ai-panel"
          role="dialog"
          aria-label="ToDoHub AI Assistant Panel"
        >
          {/* Header Bar */}
          <div className="floating-ai-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div className="floating-ai-avatar">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', margin: 0, lineHeight: 1.2 }}>
                  ToDoHub AI
                </h3>
                <span style={{ fontSize: '0.6875rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  Ready to help
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="todohub-btn todohub-btn-icon"
              aria-label="Close AI Assistant"
              style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px', padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Chat Window Container */}
          <div className="floating-ai-body">
            <ChatWindow
              messages={messages}
              isTyping={isTyping}
              onSelectSuggestion={handleSelectSuggestion}
            />
          </div>

          {/* Message Composer */}
          <div className="floating-ai-footer">
            <MessageComposer
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              disabled={isTyping}
            />
          </div>
        </div>
      )}

      {/* Desktop Hover Tooltip */}
      {showTooltip && !isOpen && (
        <div className="floating-ai-tooltip">
          <span>Ask ToDoHub AI</span>
        </div>
      )}

      {/* Fixed Floating Action Button */}
      <button
        type="button"
        className={`floating-ai-button ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        {isOpen ? <X size={22} /> : <Sparkles size={22} />}
      </button>
    </div>
  );
};

export default FloatingAIAgent;
