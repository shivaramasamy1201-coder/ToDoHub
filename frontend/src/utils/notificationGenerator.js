/**
 * Notification Generator Utility
 * Generates real in-app notifications from authenticated user's task data
 */
export const generateNotifications = (tasks = []) => {
  const notifications = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  tasks.forEach((task) => {
    // Only pending tasks generate deadline notifications
    if (task.status !== 'pending' || !task.due_date) return;

    const dueDateStr = task.due_date;
    const taskTitle = task.title || 'Untitled Task';

    const [year, month, day] = dueDateStr.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // Overdue
      const daysOverdue = Math.abs(diffDays);
      notifications.push({
        id: `notif-overdue-${task.id}`,
        taskId: task.id,
        title: 'Task Overdue',
        message: `"${taskTitle}" was due on ${dueDateStr} (${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} ago).`,
        category: 'overdue',
        date: dueDateStr,
        time: task.due_time || 'Overdue',
        priority: task.priority || 'medium'
      });
    } else if (diffDays === 0) {
      // Due Today
      notifications.push({
        id: `notif-today-${task.id}`,
        taskId: task.id,
        title: 'Due Today',
        message: `"${taskTitle}" is due today${task.due_time ? ' at ' + task.due_time : ''}.`,
        category: 'today',
        date: dueDateStr,
        time: task.due_time || 'Today',
        priority: task.priority || 'medium'
      });
    } else if (diffDays > 0 && diffDays <= 3) {
      // Upcoming (next 3 days)
      const dayLabel = diffDays === 1 ? 'tomorrow' : `in ${diffDays} days`;
      notifications.push({
        id: `notif-upcoming-${task.id}`,
        taskId: task.id,
        title: 'Upcoming Deadline',
        message: `"${taskTitle}" is due ${dayLabel} (${dueDateStr}).`,
        category: 'upcoming',
        date: dueDateStr,
        time: task.due_time || `${diffDays}d left`,
        priority: task.priority || 'medium'
      });
    }
  });

  // Sort notifications: Overdue first, then Today, then Upcoming
  const categoryOrder = { overdue: 1, today: 2, upcoming: 3 };
  notifications.sort((a, b) => (categoryOrder[a.category] || 4) - (categoryOrder[b.category] || 4));

  return notifications;
};
