import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import TaskForm from '../components/TaskForm';
import Toast from '../components/Toast';
import { taskService } from '../services/supabase/taskService';
import { categoryService } from '../services/supabase/categoryService';
import { ArrowLeft } from 'lucide-react';

const TaskNewPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (!res.error) {
        setCategories(res.data || []);
      }
    });
  }, []);

  const handleSubmit = async (taskPayload) => {
    setIsSubmitting(true);
    setSubmitError('');

    const res = await taskService.createTask(taskPayload);
    setIsSubmitting(false);

    if (!res.success) {
      setSubmitError(res.error || 'Failed to create task. Please try again.');
      return;
    }

    setToast({ type: 'success', message: 'Task created successfully!' });
    setTimeout(() => {
      navigate('/tasks');
    }, 500);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <Link to="/tasks" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Tasks
          </Link>
          <h1>Create New Task</h1>
          <p className="page-subtitle">Add a new item to your task list</p>
        </div>
      </div>

      <div className="todohub-card" style={{ maxWidth: '640px' }}>
        <TaskForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/tasks')}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </div>

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

export default TaskNewPage;
