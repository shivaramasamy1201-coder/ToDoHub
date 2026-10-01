import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import TaskList from '../components/TaskList';
import CategoryBadge from '../components/CategoryBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { taskService } from '../services/supabase/taskService';
import { categoryService } from '../services/supabase/categoryService';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

const CategoryDetailPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchCategoryTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [catRes, taskRes] = await Promise.all([
      categoryService.getCategoryById(id),
      taskService.getTasks()
    ]);

    if (catRes.error) {
      setError(catRes.error);
    } else if (!catRes.data) {
      setError('Category not found or access denied.');
    } else {
      setCategory(catRes.data);
    }

    if (!taskRes.error) {
      const categoryTasks = (taskRes.data || []).filter(
        (t) => t.category_id === id || t.category?.id === id
      );
      setTasks(categoryTasks);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchCategoryTasks();
  }, [fetchCategoryTasks]);

  const handleToggleStatus = async (taskId, currentStatus) => {
    const res = await taskService.toggleTaskStatus(taskId, currentStatus);
    if (!res.success) {
      setToast({ type: 'error', message: res.error || 'Failed to update task status.' });
      return;
    }
    setToast({ type: 'success', message: 'Task status updated.' });
    fetchCategoryTasks();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    const res = await taskService.deleteTask(deleteTargetId);
    setDeleteTargetId(null);

    if (!res.success) {
      setToast({ type: 'error', message: res.error || 'Failed to delete task.' });
      return;
    }

    setToast({ type: 'success', message: 'Task deleted successfully.' });
    fetchCategoryTasks();
  };

  const formattedDate = category?.created_at
    ? new Date(category.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <Link to="/categories" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Categories
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1>Category: {category?.name || 'Category Details'}</h1>
            {category && <CategoryBadge category={category} />}
          </div>
          <p className="page-subtitle">
            {category?.description || 'Showing all tasks assigned to this category'}
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading category details..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCategoryTasks} />
      ) : (
        <>
          <div className="todohub-card" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Tag size={16} color="var(--color-text-secondary)" />
              <span style={{ fontWeight: 600 }}>Total Tasks:</span>
              <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
            </div>
            {formattedDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Calendar size={16} color="var(--color-text-secondary)" />
                <span style={{ fontWeight: 600 }}>Created:</span>
                <span>{formattedDate}</span>
              </div>
            )}
          </div>

          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Category Tasks</h2>
          <TaskList
            tasks={tasks}
            onToggleStatus={handleToggleStatus}
            onDelete={(taskId) => setDeleteTargetId(taskId)}
            emptyMessage="No tasks found for this category."
          />
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
    </AppLayout>
  );
};

export default CategoryDetailPage;
