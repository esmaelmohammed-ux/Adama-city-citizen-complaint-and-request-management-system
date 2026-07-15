import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ROLES } from './constants';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import GuestDashboard from './pages/GuestDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import NewComplaintPage from './pages/citizen/NewComplaintPage';
import NewServiceRequestPage from './pages/citizen/NewServiceRequestPage';
import MySubmissionsPage from './pages/citizen/MySubmissionsPage';
import ProfilePage from './pages/citizen/ProfilePage';
import NotificationsPage from './pages/shared/NotificationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminActivityPage from './pages/admin/AdminActivityPage';
import OfficerDashboard, { OfficerTasksPage } from './pages/officer/OfficerPages';

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <ToastProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<GuestDashboard />} />
          <Route path="/guest" element={<GuestDashboard />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.CITIZEN]} />}>
            <Route path="/citizen" element={<CitizenDashboard />} />
            <Route path="/citizen/complaints/new" element={<NewComplaintPage />} />
            <Route path="/citizen/requests/new" element={<NewServiceRequestPage />} />
            <Route path="/citizen/submissions" element={<MySubmissionsPage />} />
            <Route path="/citizen/notifications" element={<NotificationsPage />} />
            <Route path="/citizen/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
            <Route path="/admin/requests" element={<AdminRequestsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/activity" element={<AdminActivityPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.OFFICER]} />}>
            <Route path="/officer" element={<OfficerDashboard />} />
            <Route path="/officer/tasks" element={<OfficerTasksPage />} />
            <Route path="/officer/notifications" element={<NotificationsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
        </ToastProvider>
    </AppProvider>
    </LanguageProvider>
  );
}
