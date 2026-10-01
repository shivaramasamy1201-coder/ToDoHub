import { supabase } from '../../lib/supabaseClient';

/**
 * Task Data Validation Helper
 */
export const validateTaskData = (taskData) => {
  const errors = [];

  const title = (taskData.title || '').trim();
  if (!title) {
    errors.push('Task title is required.');
  }

  const validStatuses = ['pending', 'completed'];
  if (taskData.status && !validStatuses.includes(taskData.status)) {
    errors.push('Status must be either pending or completed.');
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (taskData.priority && !validPriorities.includes(taskData.priority)) {
    errors.push('Priority must be low, medium, or high.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanData: {
      title,
      description: (taskData.description || '').trim() || null,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      category_id: taskData.category_id || null,
      due_date: taskData.due_date || null,
      due_time: taskData.due_time || null,
      reminder: Boolean(taskData.reminder),
      reminder_at: taskData.reminder_at || null
    }
  };
};

/**
 * Task Service for Supabase REST Queries
 */
export const taskService = {
  /**
   * Fetch all tasks for the authenticated user
   */
  async getTasks() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: [], error: 'User is not authenticated.' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: [], error: err.message || 'Failed to fetch tasks.' };
    }
  },

  /**
   * Fetch a single task by ID for the authenticated user
   */
  async getTaskById(taskId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: 'User is not authenticated.' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message || 'Failed to fetch task details.' };
    }
  },

  /**
   * Create a new task for the authenticated user
   */
  async createTask(taskData) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User is not authenticated.', data: null };
      }

      const validation = validateTaskData(taskData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(' '), data: null };
      }

      // Enforce user_id from authenticated user session
      const recordToInsert = {
        ...validation.cleanData,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([recordToInsert])
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .single();

      if (error) {
        return { success: false, error: error.message, data: null };
      }

      return { success: true, error: null, data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to create task.', data: null };
    }
  },

  /**
   * Update an existing task for the authenticated user
   */
  async updateTask(taskId, taskData) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User is not authenticated.', data: null };
      }

      const validation = validateTaskData(taskData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(' '), data: null };
      }

      const updatePayload = {
        ...validation.cleanData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .single();

      if (error) {
        return { success: false, error: error.message, data: null };
      }

      return { success: true, error: null, data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update task.', data: null };
    }
  },

  /**
   * Delete a task by ID for the authenticated user
   */
  async deleteTask(taskId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User is not authenticated.' };
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to delete task.' };
    }
  },

  /**
   * Toggle task status between pending and completed
   */
  async toggleTaskStatus(taskId, currentStatus) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User is not authenticated.', data: null };
      }

      const isCompleting = currentStatus !== 'completed';
      const status = isCompleting ? 'completed' : 'pending';
      const completed_at = isCompleting ? new Date().toISOString() : null;

      const { data, error } = await supabase
        .from('tasks')
        .update({
          status,
          completed_at,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .single();

      if (error) {
        return { success: false, error: error.message, data: null };
      }

      return { success: true, error: null, data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update task status.', data: null };
    }
  },

  /**
   * Fetch completed tasks
   */
  async getCompletedTasks() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: [], error: 'User is not authenticated.' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: [], error: err.message || 'Failed to fetch completed tasks.' };
    }
  },

  /**
   * Fetch pending tasks
   */
  async getPendingTasks() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: [], error: 'User is not authenticated.' };
      }

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: [], error: err.message || 'Failed to fetch pending tasks.' };
    }
  },

  /**
   * Fetch overdue tasks (pending tasks with due_date before today)
   */
  async getOverdueTasks() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: [], error: 'User is not authenticated.' };
      }

      const todayStr = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(id, name, color, icon)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .lt('due_date', todayStr)
        .order('due_date', { ascending: true });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: [], error: err.message || 'Failed to fetch overdue tasks.' };
    }
  },

  /**
   * Fetch dashboard statistics for the authenticated user
   */
  async getTaskStatistics(existingTasks = null) {
    try {
      let tasks = existingTasks;
      if (!tasks) {
        const { data, error } = await this.getTasks();
        if (error) {
          return { stats: { total: 0, completed: 0, pending: 0, overdue: 0, completionRate: 0 }, error };
        }
        tasks = data;
      }

      const todayStr = new Date().toISOString().split('T')[0];

      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === 'completed').length;
      const pending = tasks.filter((t) => t.status === 'pending').length;
      const overdue = tasks.filter((t) => t.status === 'pending' && t.due_date && t.due_date < todayStr).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        stats: { total, completed, pending, overdue, completionRate },
        error: null
      };
    } catch (err) {
      return {
        stats: { total: 0, completed: 0, pending: 0, overdue: 0, completionRate: 0 },
        error: err.message || 'Failed to compute task statistics.'
      };
    }
  }
};
