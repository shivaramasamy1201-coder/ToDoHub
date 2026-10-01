import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * TaskForm Component
 */
const TaskForm = ({ initialValues, categories = [], onSubmit, onCancel, isSubmitting = false, submitError = '' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [reminder, setReminder] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || '');
      setDescription(initialValues.description || '');
      setPriority(initialValues.priority || 'medium');
      setCategoryId(initialValues.category_id || initialValues.category?.id || '');
      setDueDate(initialValues.due_date || '');
      setDueTime(initialValues.due_time || '');
      setReminder(Boolean(initialValues.reminder));
    }
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Task title is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      category_id: categoryId || null,
      due_date: dueDate || null,
      due_time: dueTime || null,
      reminder
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  const displayError = validationError || submitError;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {displayError && (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem'
        }} role="alert">
          {displayError}
        </div>
      )}

      <div>
        <label htmlFor="task-title" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
          Task Title *
        </label>
        <input
          id="task-title"
          type="text"
          className="todohub-input"
          placeholder="e.g. Complete quarterly report"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <label htmlFor="task-description" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
          Description
        </label>
        <textarea
          id="task-description"
          className="todohub-input"
          rows={3}
          placeholder="Add details, sub-tasks, or notes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        <div>
          <label htmlFor="task-priority" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
            Priority
          </label>
          <select
            id="task-priority"
            className="todohub-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="task-category" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
            Category
          </label>
          <select
            id="task-category"
            className="todohub-input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">No Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-duedate" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
            Due Date
          </label>
          <input
            id="task-duedate"
            type="date"
            className="todohub-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="task-duetime" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
            Due Time
          </label>
          <input
            id="task-duetime"
            type="time"
            className="todohub-input"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
            disabled={isSubmitting}
          />
          <span>Set Reminder</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        {onCancel && (
          <button type="button" className="todohub-btn" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="todohub-btn todohub-btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              Saving...
            </>
          ) : (
            'Save Task'
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
