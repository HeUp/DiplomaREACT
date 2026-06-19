import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../../data-access/types';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Layout from '../components/common/Layout';

import LoginPage from '../pages/LoginPage';
import RegistrationPage from '../pages/RegistrationPage';
import ForemanTasksPage from '../pages/ForemanTasksPage';
import TaskDetailPage from '../pages/TaskDetailPage';
import ManagerDashboardPage from '../pages/ManagerDashboardPage';
import ManagerTasksPage from '../pages/ManagerTasksPage';
import ApprovalsPage from '../pages/ApprovalsPage';
import ReportsPage from '../pages/ReportsPage';
import SupplyPage from '../pages/SupplyPage';
import SupplySummaryPage from '../pages/SupplySummaryPage';
import AdminPage from '../pages/AdminPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

const roleHome = {
  [ROLES.FOREMAN]: '/tasks',
  [ROLES.MANAGER]: '/dashboard',
  [ROLES.SUPPLIER]: '/materials',
  [ROLES.ADMIN]: '/admin/users',
};

const AppRouter = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to={roleHome[user?.role] || '/tasks'} replace />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute roles={[ROLES.FOREMAN]}>
              <ForemanTasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute roles={[ROLES.FOREMAN, ROLES.MANAGER]}>
              <TaskDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={[ROLES.MANAGER]}>
              <ManagerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/manage"
          element={
            <ProtectedRoute roles={[ROLES.MANAGER]}>
              <ManagerTasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvals"
          element={
            <ProtectedRoute roles={[ROLES.MANAGER]}>
              <ApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={[ROLES.MANAGER]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/materials"
          element={
            <ProtectedRoute roles={[ROLES.SUPPLIER]}>
              <SupplyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials/summary"
          element={
            <ProtectedRoute roles={[ROLES.SUPPLIER]}>
              <SupplySummaryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/references"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
