import React from 'react';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';

/**
 * TaskList Component
 */
const TaskList = ({ tasks = [], onToggleStatus, onDelete, emptyMessage = 'No tasks found.' }) => {
  if (!tasks || tasks.length === 0) {
    return <EmptyState title="No Tasks Found" description={emptyMessage} />;
  }

  return (
    <div className="grid-cards" aria-label="Task List Grid">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TaskList;
