import React from 'react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
import EmptyState from './EmptyState';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';

/**
 * TaskTable Component
 */
const TaskTable = ({ tasks = [], onToggleStatus, onDelete, emptyMessage = 'No tasks found.' }) => {
  if (!tasks || tasks.length === 0) {
    return <EmptyState title="No Tasks Found" description={emptyMessage} />;
  }

  return (
    <div className="todohub-table-container">
      <table className="todohub-table" aria-label="Tasks Table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}></th>
            <th>Task Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due Date</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <tr key={task.id}>
                <td>
                  <button
                    onClick={() => onToggleStatus && onToggleStatus(task.id, task.status)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isCompleted ? 'var(--color-text)' : 'var(--color-text-muted)'
                    }}
                    title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                    aria-label={isCompleted ? 'Mark Pending' : 'Mark Completed'}
                  >
                    {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </button>
                </td>
                <td style={{ fontWeight: 500 }}>
                  <Link
                    to={`/tasks/${task.id}`}
                    style={{
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)'
                    }}
                  >
                    {task.title}
                  </Link>
                </td>
                <td><CategoryBadge category={task.category} /></td>
                <td><PriorityBadge priority={task.priority} /></td>
                <td><StatusBadge status={task.status} /></td>
                <td style={{ color: 'var(--color-text-secondary)' }}>
                  {task.due_date ? `${task.due_date}${task.due_time ? ' ' + task.due_time : ''}` : '-'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.375rem' }}>
                    <Link to={`/tasks/${task.id}/edit`} className="todohub-btn todohub-btn-sm" aria-label="Edit Task" title="Edit Task">
                      <Edit2 size={14} />
                    </Link>
                    {onDelete && (
                      <button
                        className="todohub-btn todohub-btn-sm"
                        onClick={() => onDelete(task.id)}
                        aria-label="Delete Task"
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
