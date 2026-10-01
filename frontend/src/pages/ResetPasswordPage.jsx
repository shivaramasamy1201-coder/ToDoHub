import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, CheckCircle2 } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('New Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const res = await updatePassword(password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to update password. Please make sure your recovery session is active.');
      return;
    }

    setIsSuccess(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundColor: 'var(--color-background)'
    }}>
      <div className="todohub-card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Reset Password</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Enter your new password</p>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem'
          }} role="alert">
            {error}
          </div>
        )}

        {isSuccess ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#f4f4f5',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={18} />
              <span>Password successfully updated!</span>
            </div>
            <button className="todohub-btn todohub-btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="reset-new-password" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>New Password</label>
              <input
                id="reset-new-password"
                type="password"
                className="todohub-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="reset-confirm-password" style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Confirm Password</label>
              <input
                id="reset-confirm-password"
                type="password"
                className="todohub-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className="todohub-btn todohub-btn-primary"
              style={{ width: '100%' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', fontSize: '0.8125rem' }}>
          <Link to="/login" style={{ color: 'var(--color-text-secondary)' }}>Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
