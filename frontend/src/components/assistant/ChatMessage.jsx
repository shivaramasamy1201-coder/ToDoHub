import React, { useState } from 'react';
import { Sparkles, User, Copy, Check, Globe, Cpu, Zap } from 'lucide-react';

/**
 * Simple markdown-like renderer for assistant messages
 * Handles: **bold**, bullet points (• and -), [links](url), and newlines
 */
const renderFormattedText = (text) => {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    // Process inline formatting
    const parts = [];
    let remaining = line;
    let partIndex = 0;

    while (remaining.length > 0) {
      // Check for markdown links [text](url)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
      // Check for bold **text**
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

      // Find the earliest match
      const linkIdx = linkMatch ? remaining.indexOf(linkMatch[0]) : Infinity;
      const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;

      if (linkIdx === Infinity && boldIdx === Infinity) {
        // No more formatting — push rest as plain text
        if (remaining) parts.push(<span key={partIndex++}>{remaining}</span>);
        break;
      }

      if (linkIdx <= boldIdx) {
        // Link comes first
        if (linkIdx > 0) {
          parts.push(<span key={partIndex++}>{remaining.substring(0, linkIdx)}</span>);
        }
        parts.push(
          <a
            key={partIndex++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-accent, #6366f1)', textDecoration: 'underline' }}
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.substring(linkIdx + linkMatch[0].length);
      } else {
        // Bold comes first
        if (boldIdx > 0) {
          parts.push(<span key={partIndex++}>{remaining.substring(0, boldIdx)}</span>);
        }
        parts.push(<strong key={partIndex++}>{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldIdx + boldMatch[0].length);
      }
    }

    return (
      <React.Fragment key={lineIndex}>
        {parts}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

/**
 * Source badge component — shows where the response came from
 */
const SourceBadge = ({ source }) => {
  if (!source) return null;

  const config = {
    gemini: { label: 'Gemini AI', icon: <Sparkles size={10} />, color: '#8b5cf6' },
    local: { label: 'Local', icon: <Cpu size={10} />, color: '#6b7280' },
    web_search: { label: 'Web', icon: <Globe size={10} />, color: '#3b82f6' }
  };

  const badge = config[source];
  if (!badge) return null;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '3px',
      fontSize: '0.625rem',
      padding: '1px 6px',
      borderRadius: '9999px',
      backgroundColor: `${badge.color}20`,
      color: badge.color,
      fontWeight: 500,
      letterSpacing: '0.02em'
    }}>
      {badge.icon}
      {badge.label}
    </span>
  );
};

/**
 * ChatMessage Component
 * Formats individual user and assistant messages with avatars, timestamps, source badges, and copy action
 */
const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`chat-message-group ${isUser ? 'user' : 'assistant'}`}>
      <div className={`chat-avatar ${isUser ? 'user' : 'assistant'}`}>
        {isUser ? <User size={16} /> : <Sparkles size={16} />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '100%' }}>
        <div className={`chat-bubble ${isUser ? 'user' : 'assistant'}`}>
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {isUser ? message.text : renderFormattedText(message.text)}
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          gap: '8px',
          padding: '0 4px',
          fontSize: '0.6875rem',
          color: 'var(--color-text-muted)'
        }}>
          <span>{message.timestamp || 'Just now'}</span>
          {!isUser && message.source && <SourceBadge source={message.source} />}
          {!isUser && (
            <button
              onClick={handleCopy}
              type="button"
              aria-label="Copy message text"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.6875rem',
                padding: '2px'
              }}
            >
              {copied ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
