import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import TaskForm from '../components/TaskForm';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import Toast from '../components/Toast';
import { taskService } from '../services/supabase/taskService';
import { categoryService } from '../services/supabase/categoryService';
import { ArrowLeft } from 'lucide-react';

const TaskEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialTask, setInitialTask] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [toast, setToast] = useState(null);

  const loadEditData = useCallback(async () => {
    if (!id) {
      setError('Invalid Task ID.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [taskRes, categoriesRes] = await Promise.all([
      taskService.getTaskById(id),
      categoryService.getCategories()
    ]);

    if (taskRes.error || !taskRes.data) {
      setError(taskRes.error || 'Task not found or permission denied.');
    } else {
      setInitialTask(taskRes.data);
    }

    if (!categoriesRes.error) {
      setCategories(categoriesRes.data || []);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadEditData();
  }, [loadEditData]);

  const handleSubmit = async (taskPayload) => {
    setIsSubmitting(true);
    setSubmitError('');

    const res = await taskService.updateTask(id, taskPayload);
    setIsSubmitting(false);

    if (!res.success) {
      setSubmitError(res.error || 'Failed to update task.');
      return;
    }

    setToast({ type: 'success', message: 'Task updated successfully!' });
    setTimeout(() => {
      navigate(`/tasks/${id}`);
    }, 500);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <Link to="/tasks" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Tasks
          </Link>
          <h1>Edit Task</h1>
          <p className="page-subtitle">Update task settings and due dates</p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Fetching task details..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadEditData} />
      ) : (
        <div className="todohub-card" style={{ maxWidth: '640px' }}>
          <TaskForm
            initialValues={initialTask}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/tasks/${id}`)}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </div>
      )}

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

export default TaskEditPage;
