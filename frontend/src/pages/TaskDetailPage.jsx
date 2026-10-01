import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import CategoryBadge from '../components/CategoryBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { taskService } from '../services/supabase/taskService';
import { Edit2, ArrowLeft, Trash2, CheckCircle2, Circle, Calendar, Clock, Bell } from 'lucide-react';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchTaskDetail = useCallback(async () => {
    if (!id) {
      setError('Invalid Task ID.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const res = await taskService.getTaskById(id);
    if (res.error || !res.data) {
      setError(res.error || 'Task not found.');
    } else {
      setTask(res.data);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchTaskDetail();
  }, [fetchTaskDetail]);

  const handleToggleStatus = async () => {
    if (!task) return;
    const res = await taskService.toggleTaskStatus(task.id, task.status);
    if (!res.success) {
      setToast({ type: 'error', message: res.error || 'Failed to update task status.' });
      return;
    }
    setToast({ type: 'success', message: 'Task status updated.' });
    fetchTaskDetail();
  };

  const handleDeleteConfirm = async () => {
    if (!task) return;
    const res = await taskService.deleteTask(task.id);
    setShowDeleteConfirm(false);

    if (!res.success) {
      setToast({ type: 'error', message: res.error || 'Failed to delete task.' });
      return;
    }

    setToast({ type: 'success', message: 'Task deleted successfully.' });
    setTimeout(() => {
      navigate('/tasks');
    }, 500);
  };

  const isCompleted = task?.status === 'completed';

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <Link to="/tasks" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Tasks
          </Link>
          <h1>Task Details</h1>
          <p className="page-subtitle">Viewing details for task #{id}</p>
        </div>

        {task && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="todohub-btn" onClick={handleToggleStatus}>
              {isCompleted ? <Circle size={16} /> : <CheckCircle2 size={16} />}
              {isCompleted ? 'Mark Pending' : 'Mark Complete'}
            </button>
            <Link to={`/tasks/${task.id}/edit`} className="todohub-btn todohub-btn-primary">
              <Edit2 size={16} /> Edit
            </Link>
            <button className="todohub-btn" onClick={() => setShowDeleteConfirm(true)} aria-label="Delete Task">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingState message="Loading task details..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTaskDetail} />
      ) : task ? (
        <article className="todohub-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <CategoryBadge category={task.category} />
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>

          <div>
            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '0.5rem',
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)'
            }}>
              {task.title}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {task.description || 'No description provided.'}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--color-surface-secondary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                <Calendar size={15} /> <strong>Due Date:</strong>
              </div>
              <div>{task.due_date || 'Not specified'}</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                <Clock size={15} /> <strong>Due Time:</strong>
              </div>
              <div>{task.due_time || 'Not specified'}</div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                <Bell size={15} /> <strong>Reminder:</strong>
              </div>
              <div>{task.reminder ? 'Enabled' : 'Disabled'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                <strong>Created At:</strong>
              </div>
              <div>{new Date(task.created_at).toLocaleString()}</div>
            </div>

            {task.updated_at && (
              <div>
                <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                  <strong>Updated At:</strong>
                </div>
                <div>{new Date(task.updated_at).toLocaleString()}</div>
              </div>
            )}

            {task.completed_at && (
              <div>
                <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                  <strong>Completed At:</strong>
                </div>
                <div>{new Date(task.completed_at).toLocaleString()}</div>
              </div>
            )}
          </div>
        </article>
      ) : null}

      {/* Delete Modal */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  );
};

export default TaskDetailPage;
