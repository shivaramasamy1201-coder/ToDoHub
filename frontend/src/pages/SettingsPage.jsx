import React, { useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Bell, Palette, LogOut, Loader2, ArrowRight } from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, updatePassword, logout } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [toast, setToast] = useState(null);

  // Preference state
  const [emailReminders, setEmailReminders] = useState(true);

  const email = user?.email || 'N/A';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword) {
      setPasswordError('New password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    const res = await updatePassword(newPassword);
    setIsUpdatingPassword(false);

    if (!res.success) {
      setPasswordError(res.error || 'Failed to update password. Please try again.');
      return;
    }

    setToast({ type: 'success', message: 'Password updated successfully!' });
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Settings</h1>
          <p className="page-subtitle">Configure application preferences and security</p>
        </div>
      </div>

      <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Account Section */}
        <div className="todohub-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.125rem' }}>
            <User size={20} />
            <span>Account</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Email Address</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{email}</div>
            </div>

            <Link to="/profile" className="todohub-btn todohub-btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              Edit Profile <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Security / Password Section */}
        <div className="todohub-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.125rem' }}>
            <Lock size={20} />
            <span>Security & Password</span>
          </div>

          {passwordError && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem'
            }} role="alert">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="new-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                className="todohub-input"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isUpdatingPassword}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="todohub-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isUpdatingPassword}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button type="submit" className="todohub-btn todohub-btn-primary" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? (
                  <>
                    <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Notifications Section */}
        <div className="todohub-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.125rem' }}>
            <Bell size={20} />
            <span>Notification Preferences</span>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={emailReminders}
              onChange={(e) => setEmailReminders(e.target.checked)}
            />
            <span>Enable in-app reminders and notifications for upcoming task deadlines</span>
          </label>
        </div>

        {/* Appearance Section */}
        <div className="todohub-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.125rem' }}>
            <Palette size={20} />
            <span>Appearance & Theme</span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            ToDoHub strictly follows the Google Stitch high-contrast monochrome design system.
          </p>
        </div>

        {/* Logout Section */}
        <div className="todohub-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Sign Out of ToDoHub</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>End your current active session securely.</div>
          </div>
          <button className="todohub-btn" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
    </AppLayout>
  );
};

export default SettingsPage;
