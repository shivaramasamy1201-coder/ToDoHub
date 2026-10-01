import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../layouts/AppLayout';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import Toast from '../components/Toast';
import { User, Mail, Calendar, Shield, LogOut, Loader2, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/supabase/profileService';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [fullNameInput, setFullNameInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await profileService.getProfile();
    if (res.error) {
      setError(res.error);
    } else if (res.data) {
      setProfile(res.data);
      setFullNameInput(res.data.full_name || '');
      setAvatarUrlInput(res.data.avatar_url || '');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullNameInput.trim()) {
      setToast({ type: 'error', message: 'Full name is required.' });
      return;
    }

    setIsSaving(true);
    const res = await profileService.updateProfile({
      full_name: fullNameInput.trim(),
      avatar_url: avatarUrlInput.trim() || null
    });
    setIsSaving(false);

    if (!res.success) {
      setToast({ type: 'error', message: res.error || 'Failed to update profile.' });
      return;
    }

    setToast({ type: 'success', message: 'Profile updated successfully!' });
    fetchProfile();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const email = user?.email || profile?.email || 'N/A';
  const displayName = profile?.full_name || user?.user_metadata?.full_name || email.split('@')[0];
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const createdAtFormatted = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Profile Settings</h1>
          <p className="page-subtitle">Manage your account information and preferences</p>
        </div>
        <button className="todohub-btn" onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {loading ? (
        <LoadingState message="Loading user profile..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProfile} />
      ) : (
        <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Profile Header Card */}
          <div className="todohub-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-border)'
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-text)',
                color: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700
              }}>
                {avatarLetter}
              </div>
            )}

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{displayName}</h2>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                {email}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <Shield size={14} /> Supabase Authenticated User
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="todohub-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              Edit Account Information
            </h3>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label htmlFor="profile-fullname" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="profile-fullname"
                    type="text"
                    className="todohub-input"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profile-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                  Email Address (Read-Only)
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="todohub-input"
                  value={email}
                  disabled
                  style={{ backgroundColor: 'var(--color-surface-secondary)', cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Email address is managed by Supabase Authentication.
                </span>
              </div>

              <div>
                <label htmlFor="profile-avatar" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                  Avatar Image URL (Optional)
                </label>
                <input
                  id="profile-avatar"
                  type="url"
                  className="todohub-input"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              {createdAtFormatted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', paddingTop: '0.5rem' }}>
                  <Calendar size={16} /> Member since {createdAtFormatted}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="submit" className="todohub-btn todohub-btn-primary" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
    </AppLayout>
  );
};

export default ProfilePage;
