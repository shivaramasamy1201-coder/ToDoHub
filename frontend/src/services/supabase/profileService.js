import { supabase } from '../../lib/supabaseClient';

/**
 * Profile Service for Supabase REST Operations
 */
export const profileService = {
  /**
   * Fetch profile for current authenticated user
   */
  async getProfile() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: 'User is not authenticated.' };
      }

      // Query public.profiles using authenticated user's ID
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        return { data: null, error: error.message };
      }

      // Fallback if profile row is missing
      if (!data) {
        const fallbackProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || null,
          created_at: user.created_at
        };
        return { data: fallbackProfile, error: null };
      }

      return {
        data: {
          ...data,
          email: user.email || data.email,
          created_at: data.created_at || user.created_at
        },
        error: null
      };
    } catch (err) {
      return { data: null, error: err.message || 'Failed to fetch profile.' };
    }
  },

  /**
   * Update profile details for current authenticated user
   */
  async updateProfile(profileUpdates) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { success: false, error: 'User is not authenticated.', data: null };
      }

      const fullName = (profileUpdates.full_name || '').trim();
      if (!fullName) {
        return { success: false, error: 'Full name is required.', data: null };
      }

      const avatarUrl = profileUpdates.avatar_url !== undefined
        ? (profileUpdates.avatar_url || '').trim() || null
        : undefined;

      const payload = {
        id: user.id,
        full_name: fullName,
        email: user.email,
        updated_at: new Date().toISOString()
      };

      if (avatarUrl !== undefined) {
        payload.avatar_url = avatarUrl;
      }

      // Upsert into public.profiles
      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message, data: null };
      }

      // Sync metadata to auth.users
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl || null
        }
      });

      return { success: true, error: null, data };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update profile.', data: null };
    }
  }
};
