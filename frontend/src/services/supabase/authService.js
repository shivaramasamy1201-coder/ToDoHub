import { supabase } from '../../lib/supabaseClient';

/**
 * Format raw Supabase Auth errors into user-friendly messages
 */
export const formatAuthError = (errorObj) => {
  if (!errorObj) return 'An unexpected authentication error occurred.';
  
  const msg = (typeof errorObj === 'string' ? errorObj : errorObj.message || '').toLowerCase();
  const code = (errorObj.code || errorObj.status || '').toString().toLowerCase();

  // Rate Limit / 429 Error Detection
  if (
    code === '429' || 
    code === 'over_email_send_rate_limit' || 
    msg.includes('rate limit') || 
    msg.includes('over_email_send_rate_limit') ||
    msg.includes('too many requests')
  ) {
    return 'Too many verification emails have been requested. Please wait before trying again.';
  }

  // Account Exists
  if (msg.includes('user already registered') || msg.includes('already exists') || code === 'user_already_exists') {
    return 'An account with this email address already exists. Please try signing in instead.';
  }

  // Invalid Email
  if (msg.includes('invalid email') || msg.includes('email address is invalid') || code === 'validation_failed') {
    return 'Please enter a valid email address.';
  }

  // Weak Password
  if (msg.includes('password should be at least') || msg.includes('weak password') || code === 'weak_password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }

  // Network Error
  if (msg.includes('network') || msg.includes('failed to fetch') || msg.includes('fetch failed')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  return errorObj.message || 'Authentication request failed. Please try again.';
};

/**
 * Supabase Authentication Service
 * Wraps Supabase Auth SDK operations for user registration, login, logout, and password recovery.
 */
export const authService = {
  /**
   * Register a new user with email, password, and full name metadata
   */
  async registerUser(fullName, email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        return { success: false, error: formatAuthError(error), data: null };
      }

      return { success: true, error: null, data };
    } catch (err) {
      return { success: false, error: formatAuthError(err), data: null };
    }
  },

  /**
   * Log in an existing user using email and password
   */
  async loginUser(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: formatAuthError(error), data: null };
      }

      return { success: true, error: null, data };
    } catch (err) {
      return { success: false, error: formatAuthError(err), data: null };
    }
  },

  /**
   * Log out the current user session
   */
  async logoutUser() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: formatAuthError(error) };
      }
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  },

  /**
   * Retrieve the current active session
   */
  async getCurrentSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        return { session: null, error: error.message };
      }
      return { session: data.session, error: null };
    } catch (err) {
      return { session: null, error: err.message };
    }
  },

  /**
   * Retrieve the current authenticated user object
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        return { user: null, error: error.message };
      }
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: err.message };
    }
  },

  /**
   * Send a password reset email
   */
  async resetPassword(email) {
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });

      if (error) {
        return { success: false, error: formatAuthError(error) };
      }

      return { success: true, error: null, data };
    } catch (err) {
      return { success: false, error: formatAuthError(err) };
    }
  },

  /**
   * Update password for an authenticated session
   */
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: formatAuthError(error), data: null };
      }

      return { success: true, error: null, data };
    } catch (err) {
      return { success: false, error: formatAuthError(err), data: null };
    }
  },

  /**
   * Subscribe to auth state changes (sign in, sign out, token refresh)
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  }
};
