import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import LoadingState from '../components/LoadingState';

// Public Auth Pages Lazy Imports
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('../pages/VerifyEmailPage'));

// Protected App Pages Lazy Imports
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const TasksPage = lazy(() => import('../pages/TasksPage'));
const CompletedTasksPage = lazy(() => import('../pages/CompletedTasksPage'));
const PendingTasksPage = lazy(() => import('../pages/PendingTasksPage'));
const OverdueTasksPage = lazy(() => import('../pages/OverdueTasksPage'));
const TaskDetailPage = lazy(() => import('../pages/TaskDetailPage'));
const TaskEditPage = lazy(() => import('../pages/TaskEditPage'));
const TaskNewPage = lazy(() => import('../pages/TaskNewPage'));

const CategoriesPage = lazy(() => import('../pages/CategoriesPage'));
const CategoryDetailPage = lazy(() => import('../pages/CategoryDetailPage'));

const CalendarPage = lazy(() => import('../pages/CalendarPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const AssistantPage = lazy(() => import('../pages/AssistantPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingState message="Loading page..." />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Auth Routes (Redirects to /dashboard if logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Protected App Routes (Redirects to /login if unauthenticated) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/completed" element={<CompletedTasksPage />} />
          <Route path="/tasks/pending" element={<PendingTasksPage />} />
          <Route path="/tasks/overdue" element={<OverdueTasksPage />} />
          <Route path="/tasks/new" element={<TaskNewPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/tasks/:id/edit" element={<TaskEditPage />} />

          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:id" element={<CategoryDetailPage />} />

          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/assistant" element={<AssistantPage />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
