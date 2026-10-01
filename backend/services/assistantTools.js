import { getAuthenticatedSupabaseClient } from '../config/supabaseClient.js';

/**
 * Helper to get user-authenticated Supabase client
 */
const getClient = (userContext) => {
  if (!userContext || !userContext.userId) {
    throw new Error('User context missing or invalid.');
  }
  return getAuthenticatedSupabaseClient(userContext.authToken);
};

/**
 * 1. get_tasks
 * Retrieve authenticated user's tasks with optional filters
 */
export const get_tasks = async (args = {}, userContext) => {
  try {
    const supabase = getClient(userContext);
    const userId = userContext.userId;

    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        category_id,
        due_date,
        due_time,
        reminder,
        reminder_at,
        completed_at,
        created_at,
        category:categories(id, name, color, icon)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (args.status && ['pending', 'completed'].includes(args.status)) {
      query = query.eq('status', args.status);
    }

    if (args.priority && ['low', 'medium', 'high'].includes(args.priority)) {
      query = query.eq('priority', args.priority);
    }

    if (args.category_id && typeof args.category_id === 'string') {
      query = query.eq('category_id', args.category_id);
    }

    if (args.due_date && typeof args.due_date === 'string') {
      query = query.eq('due_date', args.due_date);
    }

    if (args.search && typeof args.search === 'string' && args.search.trim()) {
      const term = `%${args.search.trim()}%`;
      query = query.or(`title.ilike.${term},description.ilike.${term}`);
    }

    const limit = typeof args.limit === 'number' && args.limit > 0 ? Math.min(args.limit, 100) : 50;
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      count: data ? data.length : 0,
      tasks: data || []
    };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to retrieve tasks.' };
  }
};

/**
 * 2. get_task_by_id
 * Retrieve a single task by ID for authenticated user
 */
export const get_task_by_id = async (args = {}, userContext) => {
  try {
    if (!args.task_id || typeof args.task_id !== 'string') {
      return { success: false, error: 'task_id parameter is required.' };
    }

    const supabase = getClient(userContext);
    const userId = userContext.userId;

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        category_id,
        due_date,
        due_time,
        reminder,
        reminder_at,
        completed_at,
        created_at,
        category:categories(id, name, color, icon)
      `)
      .eq('id', args.task_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: 'Task not found or unauthorized.' };
    }

    return { success: true, task: data };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to retrieve task details.' };
  }
};

/**
 * 3. create_task
 * Create a new task for authenticated user
 */
export const create_task = async (args = {}, userContext) => {
  try {
    const title = (args.title || '').trim();
    if (!title) {
      return { success: false, error: 'Task title is required and cannot be empty.' };
    }

    if (title.length > 255) {
      return { success: false, error: 'Task title must be 255 characters or less.' };
    }

    const priority = ['low', 'medium', 'high'].includes(args.priority) ? args.priority : 'medium';
    const description = (args.description || '').trim() || null;
    const category_id = args.category_id || null;
    const due_date = args.due_date || null;
    const due_time = args.due_time || null;
    const reminder = Boolean(args.reminder);
    const reminder_at = args.reminder_at || null;

    const supabase = getClient(userContext);
    const userId = userContext.userId;

    // Verify category belongs to user if provided
    if (category_id) {
      const { data: catCheck } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category_id)
        .eq('user_id', userId)
        .maybeSingle();

      if (!catCheck) {
        return { success: false, error: 'Invalid or unauthorized category_id.' };
      }
    }

    const taskRecord = {
      user_id: userId,
      title,
      description,
      status: 'pending',
      priority,
      category_id,
      due_date,
      due_time,
      reminder,
      reminder_at
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([taskRecord])
      .select(`
        id,
        title,
        description,
        status,
        priority,
        category_id,
        due_date,
        due_time,
        reminder,
        reminder_at,
        created_at,
        category:categories(id, name, color, icon)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: `Task "${data.title}" created successfully.`, task: data };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to create task.' };
  }
};

/**
 * 4. update_task
 * Update fields of an existing task for authenticated user
 */
export const update_task = async (args = {}, userContext) => {
  try {
    if (!args.task_id || typeof args.task_id !== 'string') {
      return { success: false, error: 'task_id is required.' };
    }

    const supabase = getClient(userContext);
    const userId = userContext.userId;

    // Check existing task ownership
    const { data: existingTask, error: fetchErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', args.task_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !existingTask) {
      return { success: false, error: 'Task not found or unauthorized.' };
    }

    const updateData = { updated_at: new Date().toISOString() };

    if (args.title !== undefined && typeof args.title === 'string' && args.title.trim()) {
      updateData.title = args.title.trim();
    }
    if (args.description !== undefined) {
      updateData.description = typeof args.description === 'string' ? args.description.trim() || null : null;
    }
    if (args.priority !== undefined && ['low', 'medium', 'high'].includes(args.priority)) {
      updateData.priority = args.priority;
    }
    if (args.category_id !== undefined) {
      if (args.category_id === null || args.category_id === '') {
        updateData.category_id = null;
      } else {
        const { data: catCheck } = await supabase
          .from('categories')
          .select('id')
          .eq('id', args.category_id)
          .eq('user_id', userId)
          .maybeSingle();
        if (!catCheck) {
          return { success: false, error: 'Invalid or unauthorized category_id.' };
        }
        updateData.category_id = args.category_id;
      }
    }
    if (args.due_date !== undefined) updateData.due_date = args.due_date || null;
    if (args.due_time !== undefined) updateData.due_time = args.due_time || null;
    if (args.reminder !== undefined) updateData.reminder = Boolean(args.reminder);
    if (args.reminder_at !== undefined) updateData.reminder_at = args.reminder_at || null;

    if (args.status !== undefined && ['pending', 'completed'].includes(args.status)) {
      updateData.status = args.status;
      if (args.status === 'completed' && existingTask.status !== 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (args.status === 'pending') {
        updateData.completed_at = null;
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', args.task_id)
      .eq('user_id', userId)
      .select(`
        id,
        title,
        description,
        status,
        priority,
        category_id,
        due_date,
        due_time,
        reminder,
        reminder_at,
        completed_at,
        updated_at,
        category:categories(id, name, color, icon)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: `Task "${data.title}" updated successfully.`, task: data };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to update task.' };
  }
};

/**
 * 5. complete_task
 * Mark a task as completed for authenticated user
 */
export const complete_task = async (args = {}, userContext) => {
  try {
    if (!args.task_id || typeof args.task_id !== 'string') {
      return { success: false, error: 'task_id parameter is required.' };
    }

    const supabase = getClient(userContext);
    const userId = userContext.userId;

    const { data: existingTask, error: fetchErr } = await supabase
      .from('tasks')
      .select('id, title, status')
      .eq('id', args.task_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !existingTask) {
      return { success: false, error: 'Task not found or unauthorized.' };
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', args.task_id)
      .eq('user_id', userId)
      .select(`
        id,
        title,
        status,
        completed_at,
        category:categories(id, name, color, icon)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: `Task "${data.title}" marked as completed.`, task: data };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to mark task as completed.' };
  }
};

/**
 * 6. delete_task
 * Delete a task for authenticated user with required explicit confirmation
 */
export const delete_task = async (args = {}, userContext) => {
  try {
    if (!args.task_id || typeof args.task_id !== 'string') {
      return { success: false, error: 'task_id parameter is required.' };
    }

    const supabase = getClient(userContext);
    const userId = userContext.userId;

    // Check task existence and ownership
    const { data: task, error: fetchErr } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('id', args.task_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !task) {
      return { success: false, error: 'Task not found or unauthorized.' };
    }

    // Explicit confirmation check (Requirement 9)
    if (args.confirmed !== true) {
      return {
        success: false,
        confirmation_required: true,
        task_id: task.id,
        task_title: task.title,
        message: `Deletion requires explicit confirmation. Please ask the user: "I found the task '${task.title}'. Are you sure you want to permanently delete it?" before proceeding with confirmed=true.`
      };
    }

    // Execute deletion upon confirmation
    const { error: deleteErr } = await supabase
      .from('tasks')
      .delete()
      .eq('id', args.task_id)
      .eq('user_id', userId);

    if (deleteErr) {
      return { success: false, error: deleteErr.message };
    }

    return { success: true, message: `Task "${task.title}" deleted successfully.`, deleted_task_id: task.id };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to delete task.' };
  }
};

/**
 * 7. get_categories
 * Retrieve user's categories
 */
export const get_categories = async (args = {}, userContext) => {
  try {
    const supabase = getClient(userContext);
    const userId = userContext.userId;

    let query = supabase
      .from('categories')
      .select('id, name, description, color, icon, created_at')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (args.search && typeof args.search === 'string' && args.search.trim()) {
      query = query.ilike('name', `%${args.search.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      count: data ? data.length : 0,
      categories: data || []
    };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to fetch categories.' };
  }
};

/**
 * 8. get_calendar_tasks
 * Retrieve tasks within a date range for authenticated user
 */
export const get_calendar_tasks = async (args = {}, userContext) => {
  try {
    const supabase = getClient(userContext);
    const userId = userContext.userId;

    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_date,
        due_time,
        category:categories(id, name, color, icon)
      `)
      .eq('user_id', userId)
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true });

    if (args.start_date && typeof args.start_date === 'string') {
      query = query.gte('due_date', args.start_date);
    }
    if (args.end_date && typeof args.end_date === 'string') {
      query = query.lte('due_date', args.end_date);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      count: data ? data.length : 0,
      start_date: args.start_date || null,
      end_date: args.end_date || null,
      tasks: data || []
    };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to fetch calendar tasks.' };
  }
};

/**
 * 9. get_productivity_stats
 * Compute task productivity statistics for authenticated user
 */
export const get_productivity_stats = async (args = {}, userContext) => {
  try {
    const supabase = getClient(userContext);
    const userId = userContext.userId;

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, status, priority, due_date')
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const total_tasks = tasks ? tasks.length : 0;
    const completed_tasks = tasks ? tasks.filter((t) => t.status === 'completed').length : 0;
    const pending_tasks = tasks ? tasks.filter((t) => t.status === 'pending').length : 0;
    const overdue_tasks = tasks ? tasks.filter((t) => t.status === 'pending' && t.due_date && t.due_date < todayStr).length : 0;
    const high_priority_tasks = tasks ? tasks.filter((t) => t.status === 'pending' && t.priority === 'high').length : 0;
    const completion_rate = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

    return {
      success: true,
      stats: {
        total_tasks,
        completed_tasks,
        pending_tasks,
        overdue_tasks,
        high_priority_tasks,
        completion_rate: `${completion_rate}%`
      }
    };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to calculate productivity statistics.' };
  }
};

/**
 * Tool registry mapping function names to handler functions
 */
export const toolHandlers = {
  get_tasks,
  get_task_by_id,
  create_task,
  update_task,
  complete_task,
  delete_task,
  get_categories,
  get_calendar_tasks,
  get_productivity_stats
};
