import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../layouts/AppLayout';
import TaskList from '../components/TaskList';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import SearchBar from '../components/SearchBar';
import { taskService } from '../services/supabase/taskService';

const CompletedTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchCompleted = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await taskService.getCompletedTasks();
    if (res.error) {
      setError(res.error);
    } else {
      setTasks(res.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompleted();
  }, [fetchCompleted]);

  const handleToggleStatus = async (taskId, currentStatus) => {
    const res = await taskService.toggleTaskStatus(taskId, currentStatus);
    if (!res.success) {
      setToast({ type: 'error', message: res.error || 'Failed to update task status.' });
      return;
    }
    setToast({ type: 'success', message: 'Task marked as pending.' });
    fetchCompleted();
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
    fetchCompleted();
  };

  const filteredTasks = tasks.filter((t) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return t.title.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s));
  });

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Completed Tasks</h1>
          <p className="page-subtitle">View all finished task items</p>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search completed tasks..."
        />
      </div>

      {loading ? (
        <LoadingState message="Fetching completed tasks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCompleted} />
      ) : (
        <TaskList
          tasks={filteredTasks}
          onToggleStatus={handleToggleStatus}
          onDelete={(id) => setDeleteTargetId(id)}
          emptyMessage="No completed tasks found."
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
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

export default CompletedTasksPage;
