import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../layouts/AppLayout';
import TaskList from '../components/TaskList';
import TaskTable from '../components/TaskTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import SearchBar from '../components/SearchBar';
import { taskService } from '../services/supabase/taskService';
import { categoryService } from '../services/supabase/categoryService';
import { Plus, LayoutGrid, List, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchTasksData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [tasksRes, categoriesRes] = await Promise.all([
      taskService.getTasks(),
      categoryService.getCategories()
    ]);

    if (tasksRes.error) {
      setError(tasksRes.error);
    } else {
      setTasks(tasksRes.data || []);
    }

    if (!categoriesRes.error) {
      setCategories(categoriesRes.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasksData();
  }, [fetchTasksData]);

  const handleToggleStatus = async (taskId, currentStatus) => {
    const res = await taskService.toggleTaskStatus(taskId, currentStatus);
    if (!res.success) {
      setToast({ type: 'error', message: res.error || 'Failed to update task status.' });
      return;
    }
    setToast({ type: 'success', message: 'Task status updated.' });
    fetchTasksData();
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
    fetchTasksData();
  };

  // Filter Tasks
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    // Search matching
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      t.title.toLowerCase().includes(searchLower) ||
      (t.description && t.description.toLowerCase().includes(searchLower));

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = t.status === 'pending';
    } else if (statusFilter === 'completed') {
      matchesStatus = t.status === 'completed';
    } else if (statusFilter === 'overdue') {
      matchesStatus = t.status === 'pending' && t.due_date && t.due_date < todayStr;
    }

    // Priority filter
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;

    // Category filter
    const taskCatId = t.category_id || t.category?.id;
    const matchesCategory = !categoryFilter || taskCatId === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <h1>All Tasks</h1>
          <p className="page-subtitle">Manage and track your active task items</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <button
              className="todohub-btn todohub-btn-sm"
              onClick={() => setViewMode('grid')}
              style={{
                backgroundColor: viewMode === 'grid' ? 'var(--color-surface-secondary)' : 'transparent',
                borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                border: 'none'
              }}
              aria-label="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className="todohub-btn todohub-btn-sm"
              onClick={() => setViewMode('table')}
              style={{
                backgroundColor: viewMode === 'table' ? 'var(--color-surface-secondary)' : 'transparent',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                border: 'none'
              }}
              aria-label="Table View"
            >
              <List size={16} />
            </button>
          </div>
          <Link to="/tasks/new" className="todohub-btn todohub-btn-primary">
            <Plus size={16} /> New Task
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title or description..."
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            <Filter size={16} />
            <span>Filters:</span>
          </div>

          <select
            className="todohub-input"
            style={{ width: 'auto', padding: '0.375rem 0.625rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            className="todohub-input"
            style={{ width: 'auto', padding: '0.375rem 0.625rem' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {categories.length > 0 && (
            <select
              className="todohub-input"
              style={{ width: 'auto', padding: '0.375rem 0.625rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading tasks from database..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTasksData} />
      ) : viewMode === 'grid' ? (
        <TaskList
          tasks={filteredTasks}
          onToggleStatus={handleToggleStatus}
          onDelete={(id) => setDeleteTargetId(id)}
        />
      ) : (
        <TaskTable
          tasks={filteredTasks}
          onToggleStatus={handleToggleStatus}
          onDelete={(id) => setDeleteTargetId(id)}
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

export default TasksPage;
