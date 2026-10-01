import { supabase } from '../../lib/supabaseClient';

/**
 * Category Service for Supabase REST Queries
 */
export const categoryService = {
  /**
   * Fetch all categories for the authenticated user
   */
  async getCategories() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: [], error: 'User is not authenticated.' };
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { data: [], error: err.message || 'Failed to fetch categories.' };
    }
  },

  /**
   * Fetch single category by ID for the authenticated user
   */
  async getCategoryById(categoryId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: 'User is not authenticated.' };
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message || 'Failed to fetch category.' };
    }
  },

  /**
   * Create a new category for the authenticated user
   */
  async createCategory(categoryData) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User is not authenticated.', data: null };
      }

      const name = (categoryData.name || '').trim();
      if (!name) {
        return { success: false, error: 'Category name is required.', data: null };
      }

      if (name.length > 50) {
        return { success: false, error: 'Category name must be 50 characters or less.', data: null };
      }

      // Check for duplicate category name for this user
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .ilike('name', name)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'A category with this name already exists.', data: null };
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          user_id: user.id,
          name,
          description: (categoryData.description || '').trim() || null,
          color: categoryData.color || null,
          icon: categoryData.icon || null
        }])
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message, data: null };
      }

      return { success: true, error: null, data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to create category.', data: null };
    }
  }
};
