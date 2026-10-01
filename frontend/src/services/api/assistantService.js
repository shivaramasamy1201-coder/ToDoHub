import { supabase } from '../../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Send user prompt to backend Assistant API
 * @param {string} message - User message
 * @param {Array} history - Optional previous messages [{role: 'user'|'model', content: string}]
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const sendAssistantMessage = async (message, history = []) => {
  try {
    // 1. Get current authenticated Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      return {
        success: false,
        error: 'You must be logged in to use ToDoHub AI Assistant.'
      };
    }

    // 2. Format history for backend
    const formattedHistory = history.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      content: msg.text
    }));

    // 3. Make API request to backend
    const response = await fetch(`${API_BASE_URL}/api/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        message,
        history: formattedHistory
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.message || data.error || "Sorry, I couldn't connect to ToDoHub AI right now. Please try again."
      };
    }

    return {
      success: true,
      message: data.message,
      source: data.source || null
    };
  } catch (err) {
    console.error('Frontend Assistant Service Exception:', err);
    return {
      success: false,
      error: "Sorry, I couldn't connect to ToDoHub AI right now. Please try again."
    };
  }
};
