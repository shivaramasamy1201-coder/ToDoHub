import {
  get_tasks,
  get_categories,
  get_calendar_tasks,
  get_productivity_stats
} from './assistantTools.js';
import { searchWeb, formatSearchResultsForAgent, isWebSearchAvailable } from './webSearchService.js';

/**
 * Enhanced Local Intent Matcher and Execution Service
 * Handles user queries locally when Gemini API is unavailable or rate limited.
 * Now supports:
 * - All 8 original ToDoHub productivity intents
 * - Web search fallback for general questions
 * - Productivity coaching and general help
 */
export const handleLocalAssistantQuery = async (userMessage, userContext) => {
  const msg = (userMessage || '').toLowerCase().trim();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  // Intent 1: Overdue Tasks
  if (msg.includes('overdue')) {
    const res = await get_tasks({ status: 'pending' }, userContext);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    const overdueTasks = (res.tasks || []).filter((t) => t.due_date && t.due_date < todayStr);
    if (overdueTasks.length === 0) {
      return {
        success: true,
        message: 'Great news! You have no overdue tasks right now.',
        intent: 'overdue_tasks'
      };
    }
    const taskListStr = overdueTasks
      .map((t) => `• **${t.title}** (Due: ${t.due_date}${t.priority ? `, Priority: ${t.priority}` : ''})`)
      .join('\n');
    return {
      success: true,
      message: `⚠️ **Here are your overdue tasks (${overdueTasks.length}):**\n\n${taskListStr}`,
      intent: 'overdue_tasks'
    };
  }

  // Intent 2: Pending / Incomplete Tasks
  if (msg.includes('pending') || msg.includes('incomplete') || (msg.includes('to') && msg.includes('do') && !msg.includes('how'))) {
    const res = await get_tasks({ status: 'pending' }, userContext);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    const tasks = res.tasks || [];
    if (tasks.length === 0) {
      return {
        success: true,
        message: 'You currently have no pending tasks! All caught up.',
        intent: 'pending_tasks'
      };
    }
    const taskListStr = tasks
      .slice(0, 15)
      .map((t) => `• **${t.title}** [${t.priority.toUpperCase()}]${t.due_date ? ` - Due: ${t.due_date}` : ''}`)
      .join('\n');
    return {
      success: true,
      message: `📋 **Here are your pending tasks (${tasks.length}):**\n\n${taskListStr}`,
      intent: 'pending_tasks'
    };
  }

  // Intent 3: Completed Tasks
  if (msg.includes('completed') || msg.includes('done') || msg.includes('finished')) {
    const res = await get_tasks({ status: 'completed' }, userContext);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    const tasks = res.tasks || [];
    if (tasks.length === 0) {
      return {
        success: true,
        message: 'You have not completed any tasks yet. Keep going!',
        intent: 'completed_tasks'
      };
    }
    const taskListStr = tasks
      .slice(0, 15)
      .map((t) => `• ✅ **${t.title}**${t.completed_at ? ` (Completed: ${new Date(t.completed_at).toLocaleDateString()})` : ''}`)
      .join('\n');
    return {
      success: true,
      message: `🎉 **Here are your completed tasks (${tasks.length}):**\n\n${taskListStr}`,
      intent: 'completed_tasks'
    };
  }

  // Intent 4: Today's Tasks
  if (msg.includes('today') || msg.includes("today's")) {
    const res = await get_calendar_tasks({ start_date: todayStr, end_date: todayStr }, userContext);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    const tasks = res.tasks || [];
    if (tasks.length === 0) {
      return {
        success: true,
        message: `📅 You have no tasks scheduled for today (${todayStr}).`,
        intent: 'today_tasks'
      };
    }
    const taskListStr = tasks
      .map((t) => `• **${t.title}** [${t.status.toUpperCase()}]${t.due_time ? ` at ${t.due_time}` : ''}`)
      .join('\n');
    return {
      success: true,
      message: `📅 **Here are your tasks for today (${todayStr}):**\n\n${taskListStr}`,
      intent: 'today_tasks'
    };
  }

  // Intent 5: Upcoming Deadlines / Calendar
  if (msg.includes('upcoming') || msg.includes('deadline') || msg.includes('calendar') || msg.includes('this week') || msg.includes('next week')) {
    const res = await get_calendar_tasks({ start_date: todayStr, end_date: nextWeekStr }, userContext);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    const tasks = res.tasks || [];
    if (tasks.length === 0) {
      return {
        success: true,
        message: '📅 You have no upcoming deadlines scheduled for the next 7 days.',
        intent: 'upcoming_deadlines'
      };
    }
    const taskListStr = tasks
      .map((t) => `• **${t.title}** - Due: ${t.due_date}${t.due_time ? ` ${t.due_time}` : ''} [${t.priority.toUpperCase()}]`)
      .join('\n');
    return {
      success: true,
      message: `🗓️ **Here are your upcoming tasks & deadlines (next 7 days):**\n\n${taskListStr}`,
      intent: 'upcoming_deadlines'
    };
  }

  // Intent 6: Productivity Statistics
  if (msg.includes('stat') || msg.includes('statistic') || msg.includes('productivity') || msg.includes('performance') || msg.includes('rate') || msg.includes('progress')) {
    const res = await get_productivity_stats({}, userContext);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    const s = res.stats;
    return {
      success: true,
      message: `📊 **Here are your ToDoHub productivity statistics:**\n\n• **Total Tasks:** ${s.total_tasks}\n• **Completed Tasks:** ${s.completed_tasks}\n• **Pending Tasks:** ${s.pending_tasks}\n• **Overdue Tasks:** ${s.overdue_tasks}\n• **High Priority Pending:** ${s.high_priority_tasks}\n• **Completion Rate:** ${s.completion_rate}`,
      intent: 'productivity_stats'
    };
  }

  // Intent 7: Categories
  if (msg.includes('category') || msg.includes('categories')) {
    const res = await get_categories({}, userContext);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    const categories = res.categories || [];
    if (categories.length === 0) {
      return {
        success: true,
        message: 'You have not created any categories yet.',
        intent: 'categories'
      };
    }
    const catListStr = categories
      .map((c) => `• **${c.name}**${c.description ? ` - ${c.description}` : ''}`)
      .join('\n');
    return {
      success: true,
      message: `🏷️ **Here are your task categories (${categories.length}):**\n\n${catListStr}`,
      intent: 'categories'
    };
  }

  // Intent 8: High Priority Tasks
  if (msg.includes('high priority') || msg.includes('urgent') || msg.includes('important')) {
    const res = await get_tasks({ status: 'pending', priority: 'high' }, userContext);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    const tasks = res.tasks || [];
    if (tasks.length === 0) {
      return {
        success: true,
        message: '✅ You have no high-priority pending tasks. Nice work!',
        intent: 'high_priority_tasks'
      };
    }
    const taskListStr = tasks
      .slice(0, 15)
      .map((t) => `• 🔴 **${t.title}**${t.due_date ? ` - Due: ${t.due_date}` : ''}`)
      .join('\n');
    return {
      success: true,
      message: `🔴 **Here are your high-priority pending tasks (${tasks.length}):**\n\n${taskListStr}`,
      intent: 'high_priority_tasks'
    };
  }

  // Intent 9: General "Show my tasks" / "tasks" fallback
  if (msg.includes('task') || msg.includes('tasks') || msg.includes('show my')) {
    const res = await get_tasks({}, userContext);
    if (!res.success) {
      return { success: false, error: res.error };
    }
    const tasks = res.tasks || [];
    if (tasks.length === 0) {
      return {
        success: true,
        message: 'You do not have any tasks in your ToDoHub account yet.',
        intent: 'all_tasks'
      };
    }
    const taskListStr = tasks
      .slice(0, 15)
      .map((t) => `• **${t.title}** [${t.status.toUpperCase()}]${t.due_date ? ` - Due: ${t.due_date}` : ''}`)
      .join('\n');
    return {
      success: true,
      message: `📝 **Here are your tasks (${tasks.length} total):**\n\n${taskListStr}`,
      intent: 'all_tasks'
    };
  }

  // Intent 10: Productivity Coaching (local response, no API needed)
  if (msg.includes('tip') || msg.includes('advice') || msg.includes('help me focus') || msg.includes('procrastinat') || msg.includes('prioriti') || msg.includes('time manage')) {
    return {
      success: true,
      message: `💡 **Productivity Tips:**\n\n` +
        `• **Eisenhower Matrix** — Categorize tasks by urgency and importance.\n` +
        `• **Pomodoro Technique** — Work in 25-minute focused intervals with 5-minute breaks.\n` +
        `• **Two-Minute Rule** — If a task takes less than 2 minutes, do it immediately.\n` +
        `• **Eat the Frog** — Tackle your hardest task first thing in the morning.\n` +
        `• **Time Blocking** — Schedule specific blocks of time for different types of work.\n\n` +
        `Try asking me to "show my overdue tasks" or "show my high priority tasks" to get started!`,
      intent: 'productivity_coaching'
    };
  }

  // Intent 11: Greetings
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|greetings)\b/.test(msg)) {
    return {
      success: true,
      message: `👋 Hello! I'm ToDoHub AI. I can help you with:\n\n` +
        `• **Task management** — "Show my tasks", "What's due today?"\n` +
        `• **Productivity stats** — "Show my productivity statistics"\n` +
        `• **Categories** — "Show my categories"\n` +
        `• **Web search** — "Search for time management techniques"\n` +
        `• **General questions** — Ask me anything!\n\n` +
        `What would you like to do?`,
      intent: 'greeting'
    };
  }

  // Intent 12: Help
  if (msg.includes('help') || msg === 'what can you do' || msg === '?') {
    return {
      success: true,
      message: `🤖 **ToDoHub AI — What I Can Do:**\n\n` +
        `**📋 Task Management:**\n` +
        `• "Show my tasks" / "Show pending tasks" / "Show completed tasks"\n` +
        `• "Show overdue tasks" / "Show today's tasks"\n` +
        `• "Show upcoming deadlines" / "Show high priority tasks"\n\n` +
        `**📊 Analytics:**\n` +
        `• "Show my productivity statistics"\n` +
        `• "Show my categories"\n\n` +
        `**🌐 General (requires Gemini API):**\n` +
        `• Web search, writing help, general knowledge\n` +
        `• Task creation, updates, completion, deletion\n\n` +
        `_Note: Some features require Gemini API availability._`,
      intent: 'help'
    };
  }

  // Intent 13: Web Search fallback (if search keywords detected and Tavily is available)
  const searchPatterns = /^(search|google|look up|find out|what is|what are|who is|who are|when was|when is|where is|how to|how do|tell me about|explain|define)/;
  if (searchPatterns.test(msg) && isWebSearchAvailable()) {
    // Extract query: remove the leading verb/phrase
    const searchQuery = userMessage.trim().replace(/^(search\s+(for\s+)?|google\s+|look\s+up\s+|find\s+out\s+(about\s+)?|tell\s+me\s+about\s+)/i, '');
    try {
      const searchResult = await searchWeb(searchQuery, { maxResults: 5, includeAnswer: true });
      if (searchResult.success) {
        const formatted = formatSearchResultsForAgent(searchResult);
        return {
          success: true,
          message: `🌐 **Web Search Results:**\n\n${formatted}`,
          intent: 'web_search'
        };
      }
    } catch (err) {
      console.warn('Web search fallback failed:', err.message);
    }
  }

  // Unrecognized intent when Gemini is unavailable
  return {
    success: true,
    message: `I understand you're asking about something outside of task management. When Gemini AI is available, I can help with:\n\n` +
      `• 🌐 Web search and current information\n` +
      `• ✍️ Writing assistance (emails, reports, summaries)\n` +
      `• 🧠 General knowledge and reasoning\n` +
      `• 💡 Productivity coaching\n\n` +
      `**Right now, I can help with your ToDoHub data.** Try:\n` +
      `• "Show my tasks"\n` +
      `• "Show overdue tasks"\n` +
      `• "Show my productivity statistics"`,
    intent: 'unrecognized'
  };
};
