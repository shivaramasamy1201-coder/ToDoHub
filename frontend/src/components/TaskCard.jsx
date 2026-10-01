import React from 'react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import CategoryBadge from './CategoryBadge';
import { Calendar, Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * TaskCard Component
 */
const TaskCard = ({ task, onToggleStatus, onDelete }) => {
  if (!task) return null;

  const isCompleted = task.status === 'completed';

  return (
    <article className="todohub-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <CategoryBadge category={task.category} />
        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <button
            onClick={() => onToggleStatus && onToggleStatus(task.id, task.status)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: isCompleted ? 'var(--color-text)' : 'var(--color-text-muted)',
              marginTop: '2px',
              flexShrink: 0
            }}
            title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
            aria-label={isCompleted ? 'Mark Pending' : 'Mark Completed'}
          >
            {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          </button>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '0.25rem',
            textDecoration: isCompleted ? 'line-through' : 'none',
            color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)'
          }}>
            <Link to={`/tasks/${task.id}`}>{task.title}</Link>
          </h3>
        </div>
        
        {task.description && (
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.4,
            marginLeft: '1.625rem'
          }}>
            {task.description}
          </p>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        paddingTop: '0.5rem', 
        borderTop: '1px solid var(--color-border)',
        fontSize: '0.75rem',
        color: 'var(--color-text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Calendar size={14} />
          <span>Due: {task.due_date ? `${task.due_date}${task.due_time ? ' ' + task.due_time : ''}` : 'No date'}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
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
      </div>
    </article>
  );
};

export default TaskCard;
