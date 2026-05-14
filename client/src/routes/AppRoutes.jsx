import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import ReviewerDashboard from '../pages/ReviewerDashboard';
import EvaluationsPage from '../pages/EvaluationsPage';
import ProposalDetailPage from '../pages/ProposalDetailPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import ReviewerProposalsPage from '../pages/ReviewerProposalsPage';
import ReviewersPage from '../pages/ReviewersPage';
import AdminDashboard from '../pages/AdminDashboard';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Reviewer Routes */}
      <Route path="/reviewer/dashboard" element={
        <ProtectedRoute allowedRoles={['reviewer']}>
          <ReviewerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/proposals" element={
        <ProtectedRoute allowedRoles={['reviewer']}>
          <ReviewerProposalsPage />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/evaluations" element={
        <ProtectedRoute allowedRoles={['reviewer']}>
          <EvaluationsPage />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/reviewers" element={
        <ProtectedRoute allowedRoles={['reviewer']}>
          <ReviewersPage />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/reports" element={
        <ProtectedRoute allowedRoles={['reviewer']}>
          <ReportsPage />
        </ProtectedRoute>
      } />
      <Route path="/reviewer/settings" element={
        <ProtectedRoute allowedRoles={['reviewer']}>
          <SettingsPage />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Shared Routes */}
      <Route path="/proposal/:id" element={
        <ProtectedRoute allowedRoles={['reviewer', 'admin']}>
          <ProposalDetailPage />
        </ProtectedRoute>
      } />

      {/* Default Redirect */}
      <Route path="/" element={
        user ? (
          <Navigate to={
            user.role === 'admin' ? '/admin/dashboard' : '/reviewer/dashboard'
          } replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
