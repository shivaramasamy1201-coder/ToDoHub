import React from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';

const VerifyEmailPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundColor: 'var(--color-background)'
    }}>
      <div className="todohub-card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
        <MailCheck size={48} style={{ margin: '0 auto', color: 'var(--color-text)' }} />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Verify Email</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
            A verification link has been sent to your email address. Please check your inbox.
          </p>
        </div>

        <Link to="/login" className="todohub-btn todohub-btn-primary" style={{ width: '100%' }}>
          Return to Sign In
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
