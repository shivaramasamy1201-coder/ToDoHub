import { supabase } from '../lib/supabaseClient';

/**
 * Utility to test connection to Supabase instance.
 * Performs a read-only query against the public.profiles table.
 */
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Supabase Connection Failed:', error.message);
      return { success: false, error: error.message, data: null };
    }

    console.log('✅ Supabase Connection Successful! Profiles query returned:', data);
    return { success: true, error: null, data };
  } catch (err) {
    console.error('❌ Unexpected error during Supabase connection test:', err.message);
    return { success: false, error: err.message, data: null };
  }
};
