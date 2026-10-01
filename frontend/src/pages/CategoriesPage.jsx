import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../layouts/AppLayout';
import CategoryBadge from '../components/CategoryBadge';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { categoryService } from '../services/supabase/categoryService';
import { taskService } from '../services/supabase/taskService';
import { Link } from 'react-router-dom';
import { FolderPlus } from 'lucide-react';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#000000');
  const [modalError, setModalError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState(null);

  const loadCategoryData = useCallback(async () => {
    setLoading(true);
    const [catRes, taskRes] = await Promise.all([
      categoryService.getCategories(),
      taskService.getTasks()
    ]);

    if (!catRes.error) {
      setCategories(catRes.data || []);
    }
    if (!taskRes.error) {
      setTasks(taskRes.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCategoryData();
  }, [loadCategoryData]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setModalError('');

    const trimmedName = newCatName.trim();
    if (!trimmedName) {
      setModalError('Category name is required.');
      return;
    }
    if (trimmedName.length > 50) {
      setModalError('Category name must be 50 characters or less.');
      return;
    }

    setIsCreating(true);
    const res = await categoryService.createCategory({
      name: trimmedName,
      description: newCatDesc.trim() || null,
      color: newCatColor || null
    });
    setIsCreating(false);

    if (!res.success) {
      setModalError(res.error || 'Failed to create category.');
      return;
    }

    setToast({ type: 'success', message: `Category "${trimmedName}" created successfully!` });
    setNewCatName('');
    setNewCatDesc('');
    setNewCatColor('#000000');
    setShowModal(false);
    loadCategoryData();
  };

  const getTaskCountForCategory = (catId) => {
    return tasks.filter((t) => t.category_id === catId || t.category?.id === catId).length;
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Categories</h1>
          <p className="page-subtitle">Organize tasks into workspace categories</p>
        </div>
        <button
          className="todohub-btn todohub-btn-primary"
          onClick={() => {
            setModalError('');
            setShowModal(true);
          }}
        >
          <FolderPlus size={16} /> New Category
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading categories..." />
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Categories Created"
          description="Create custom categories to organize your tasks."
          actionLabel="Create Category"
          onAction={() => {
            setModalError('');
            setShowModal(true);
          }}
        />
      ) : (
        <div className="grid-cards">
          {categories.map((c) => (
            <div key={c.id} className="todohub-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <CategoryBadge category={c} />
                {c.description && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.375rem' }}>
                    {c.description}
                  </p>
                )}
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                  {getTaskCountForCategory(c.id)} {getTaskCountForCategory(c.id) === 1 ? 'task' : 'tasks'} assigned
                </div>
              </div>
              <Link to={`/categories/${c.id}`} className="todohub-btn todohub-btn-sm">
                View Tasks
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal for creating a new category */}
      <Modal isOpen={showModal} title="Create New Category" onClose={() => setShowModal(false)}>
        <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modalError && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem'
            }} role="alert">
              {modalError}
            </div>
          )}

          <div>
            <label htmlFor="cat-name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              Category Name *
            </label>
            <input
              id="cat-name"
              type="text"
              className="todohub-input"
              placeholder="e.g. Work, Personal, Projects"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              disabled={isCreating}
              required
            />
          </div>
          <div>
            <label htmlFor="cat-desc" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              Description
            </label>
            <textarea
              id="cat-desc"
              className="todohub-input"
              rows={3}
              placeholder="Optional category description..."
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              disabled={isCreating}
            />
          </div>
          <div>
            <label htmlFor="cat-color" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              Color Tag
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                id="cat-color"
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ width: '36px', height: '36px', border: 'none', cursor: 'pointer', background: 'none' }}
                disabled={isCreating}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{newCatColor}</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="todohub-btn" onClick={() => setShowModal(false)} disabled={isCreating}>Cancel</button>
            <button type="submit" className="todohub-btn todohub-btn-primary" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
    </AppLayout>
  );
};

export default CategoriesPage;
