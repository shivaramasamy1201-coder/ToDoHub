import React, { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import AssistantSidebar from '../components/assistant/AssistantSidebar';
import AssistantHeader from '../components/assistant/AssistantHeader';
import ChatWindow from '../components/assistant/ChatWindow';
import MessageComposer from '../components/assistant/MessageComposer';

import { sendAssistantMessage } from '../services/api/assistantService';

/**
 * AssistantPage Component
 * Standalone AI Assistant route component (/assistant) connected to real Gemini API
 */
const AssistantPage = () => {
  const [conversations, setConversations] = useState([
    { id: 'chat-1', title: 'Task organization' }
  ]);
  const [activeConversationId, setActiveConversationId] = useState('chat-1');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    // Update current conversation title if it's the first message
    if (messages.length === 0) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, title: text.length > 28 ? `${text.substring(0, 28)}...` : text }
            : c
        )
      );
    }

    try {
      // Send conversation history excluding the latest user message which is passed separately
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
      console.error('Assistant page submit error:', err);
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

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newConv = { id: newId, title: 'New Conversation' };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setMessages([]);
    setInputValue('');
    setIsSidebarOpen(false);
  };

  const activeChatTitle =
    conversations.find((c) => c.id === activeConversationId)?.title || 'AI Assistant';

  return (
    <AppLayout>
      <div className="assistant-page-wrapper">
        <div className="assistant-container">
          <AssistantSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            conversations={conversations}
            activeId={activeConversationId}
            onSelectConversation={(id) => {
              setActiveConversationId(id);
              setIsSidebarOpen(false);
            }}
            onNewChat={handleNewChat}
          />

          <div className="assistant-main">
            <AssistantHeader
              title={activeChatTitle}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              onNewChat={handleNewChat}
            />

            <ChatWindow
              messages={messages}
              isTyping={isTyping}
              onSelectSuggestion={handleSelectSuggestion}
            />

            <MessageComposer
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              disabled={isTyping}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AssistantPage;
