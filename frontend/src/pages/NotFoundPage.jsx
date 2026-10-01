import React from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import ErrorState from '../components/ErrorState';

const NotFoundPage = () => {
  return (
    <AppLayout>
      <ErrorState
        title="404 - Page Not Found"
        message="The page or route you requested does not exist."
      />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/dashboard" className="todohub-btn todohub-btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </AppLayout>
  );
};

export default NotFoundPage;
