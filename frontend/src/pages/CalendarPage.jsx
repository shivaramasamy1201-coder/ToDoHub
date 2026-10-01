import React, { useState, useEffect } from 'react';
import AppLayout from '../layouts/AppLayout';
import Calendar from '../components/Calendar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { taskService } from '../services/supabase/taskService';

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    taskService.getTasks().then((res) => {
      if (res.error) {
        setError(res.error);
      } else {
        setTasks(res.data || []);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Calendar View</h1>
          <p className="page-subtitle">Schedule and upcoming task deadlines</p>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading calendar tasks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <Calendar tasks={tasks} />
      )}
    </AppLayout>
  );
};

export default CalendarPage;
