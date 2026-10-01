import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../layouts/AppLayout';
import StatisticsCard from '../components/StatisticsCard';
import TaskList from '../components/TaskList';
import FilterBar from '../components/FilterBar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import { taskService } from '../services/supabase/taskService';
import { ListTodo, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, overdue: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const tasksRes = await taskService.getTasks();

    if (tasksRes.error) {
      setError(tasksRes.error);
      setLoading(false);
      return;
    }

    const fetchedTasks = tasksRes.data || [];
    setTasks(fetchedTasks);

    const statsRes = await taskService.getTaskStatistics(fetchedTasks);
    if (!statsRes.error && statsRes.stats) {
      setStats(statsRes.stats);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleToggleStatus = async (taskId, currentStatus) => {
    const res = await taskService.toggleTaskStatus(taskId, currentStatus);
    if (!res.success) {
      setToast({ type: 'error', message: res.error || 'Failed to update task status.' });
      return;
    }

    setToast({ type: 'success', message: 'Task status updated.' });
    fetchDashboardData();
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
    fetchDashboardData();
  };

  const recentTasks = tasks.slice(0, 6);

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back to ToDoHub task manager</p>
        </div>
        <Link to="/tasks/new" className="todohub-btn todohub-btn-primary">
          <Plus size={16} /> New Task
        </Link>
      </div>

      <div className="grid-stats">
        <StatisticsCard title="Total Tasks" value={stats.total} icon={ListTodo} description="Across all categories" />
        <StatisticsCard title="Completed" value={stats.completed} icon={CheckCircle2} description={`${stats.completionRate}% completion rate`} />
        <StatisticsCard title="Pending" value={stats.pending} icon={Clock} description="Awaiting action" />
        <StatisticsCard title="Overdue" value={stats.overdue} icon={AlertCircle} description="Past due date" />
      </div>

      {loading ? (
        <LoadingState message="Loading your dashboard tasks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDashboardData} />
      ) : (
        <section style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Recent Tasks</h2>
            <Link to="/tasks" style={{ fontSize: '0.875rem', fontWeight: 600 }}>View All →</Link>
          </div>
          <TaskList
            tasks={recentTasks}
            onToggleStatus={handleToggleStatus}
            onDelete={(id) => setDeleteTargetId(id)}
            emptyMessage="No tasks found. Create a new task to get started!"
          />
        </section>
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

export default DashboardPage;
