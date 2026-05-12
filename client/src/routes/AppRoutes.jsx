import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import SubmitterDashboard from '../pages/SubmitterDashboard';
import ReviewerDashboard from '../pages/ReviewerDashboard';
import ProposalSubmissionPage from '../pages/ProposalSubmissionPage';
import EvaluationsPage from '../pages/EvaluationsPage';
import ProposalDetailPage from '../pages/ProposalDetailPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import ReviewerProposalsPage from '../pages/ReviewerProposalsPage';
import ReviewersPage from '../pages/ReviewersPage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Submitter Routes */}
      <Route path="/submitter/dashboard" element={
        <ProtectedRoute allowedRoles={['submitter']}>
          <SubmitterDashboard />
        </ProtectedRoute>
      } />
      <Route path="/submitter/submit" element={
        <ProtectedRoute allowedRoles={['submitter']}>
          <ProposalSubmissionPage />
        </ProtectedRoute>
      } />

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

      {/* Shared Routes */}
      <Route path="/proposal/:id" element={
        <ProtectedRoute allowedRoles={['submitter', 'reviewer']}>
          <ProposalDetailPage />
        </ProtectedRoute>
      } />

      {/* Default Redirect */}
      <Route path="/" element={
        user ? (
          <Navigate to={user.role === 'reviewer' ? '/reviewer/dashboard' : '/submitter/dashboard'} replace />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
