import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../services/api';

const AppContext = createContext(null);

const EMPTY_DATA = {
  users: [],
  departments: [],
  complaints: [],
  serviceRequests: [],
  notifications: [],
  statusHistories: [],
  activityLogs: [],
};

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState(EMPTY_DATA);
  const [initializing, setInitializing] = useState(true);

  const refreshData = useCallback(async (user) => {
    if (!user) return;
    try {
      const isAdmin = user.role === 'admin';

      const [departments, complaints, serviceRequests, notifications, statusHistories, users, activityLogs] =
        await Promise.all([
          api.get('/departments'),
          api.get('/complaints'),
          api.get('/service-requests'),
          api.get('/notifications'),
          api.get('/status-histories'),
          isAdmin ? api.get('/users') : Promise.resolve(null),
          isAdmin ? api.get('/activity-logs') : Promise.resolve(null),
        ]);

      setData({
        departments: departments.departments,
        complaints: complaints.complaints,
        serviceRequests: serviceRequests.serviceRequests,
        notifications: notifications.notifications,
        statusHistories: statusHistories.statusHistories,
        users: users?.users || [],
        activityLogs: activityLogs?.activityLogs || [],
      });
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  useEffect(() => {
    async function restoreSession() {
      if (!getToken()) {
        setInitializing(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setCurrentUser(res.user);
        await refreshData(res.user);
      } catch {
        setToken(null);
      } finally {
        setInitializing(false);
      }
    }
    restoreSession();
  }, [refreshData]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.token);
      setCurrentUser(res.user);
      await refreshData(res.user);
      return { success: true, role: res.role };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async ({ fullName, email, password, phoneNumber }) => {
    try {
      const res = await api.post('/auth/register', { fullName, email, password, phoneNumber });
      setToken(res.token);
      setCurrentUser(res.user);
      await refreshData(res.user);
      return { success: true, role: res.role };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setData(EMPTY_DATA);
  };

  const updateProfile = async (updates) => {
    try {
      const res = await api.patch('/users/me', updates);
      setCurrentUser(res.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const submitComplaint = async (formData) => {
    const res = await api.post('/complaints', formData);
    await refreshData(currentUser);
    return res.referenceId;
  };

  const submitServiceRequest = async (formData) => {
    const res = await api.post('/service-requests', formData);
    await refreshData(currentUser);
    return res.referenceId;
  };

  const assignSubmission = async (type, id, departmentId, officerId = null) => {
    const base = type === 'complaint' ? '/complaints' : '/service-requests';
    try {
      await api.patch(`${base}/${id}/assign`, { departmentId, officerId });
      await refreshData(currentUser);
      return { success: true };
    } catch (err) {
      console.error('Assign failed:', err);
      return { success: false, message: err.message || 'Assign failed.' };
    }
  };

  const updateSubmissionStatus = async (type, id, status, note = '') => {
    const base = type === 'complaint' ? '/complaints' : '/service-requests';
    try {
      await api.patch(`${base}/${id}/status`, { status, note });
      await refreshData(currentUser);
      return { success: true };
    } catch (err) {
      console.error('Status update failed:', err);
      return { success: false, message: err.message || 'Status update failed.' };
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      }));
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
      }));
    } catch (err) {
      console.error('Mark all read failed:', err);
    }
  };

  const addDepartment = async (formData) => {
    try {
      await api.post('/departments', formData);
      await refreshData(currentUser);
      return { success: true };
    } catch (err) {
      console.error('Add department failed:', err);
      return { success: false, message: err.message || 'Failed to add department.' };
    }
  };

  const toggleUserActive = async (userId) => {
    try {
      const res = await api.patch(`/users/${userId}/active`);
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? res.user : u)),
      }));
      return { success: true };
    } catch (err) {
      console.error('Toggle user failed:', err);
      return { success: false, message: err.message || 'Failed to update user.' };
    }
  };

  const value = {
    ...data,
    currentUser,
    initializing,
    login,
    register,
    logout,
    updateProfile,
    submitComplaint,
    submitServiceRequest,
    assignSubmission,
    updateSubmissionStatus,
    markNotificationRead,
    markAllNotificationsRead,
    addDepartment,
    toggleUserActive,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
