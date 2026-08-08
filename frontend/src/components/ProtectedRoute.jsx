import { Navigate, Outlet } from 'react-router-dom';
import { ROLES } from '../constants';
import { useApp } from '../context/AppContext';
import Layout from './Layout';

// comment

export function ProtectedRoute({ allowedRoles }) {
  const { currentUser, initializing } = useApp();

  if (initializing) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const redirect = {
      [ROLES.CITIZEN]: '/citizen',
      [ROLES.ADMIN]: '/admin',
      [ROLES.OFFICER]: '/officer',
    }[currentUser.role];
    return <Navigate to={redirect || '/'} replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export function PublicOnlyRoute() {
  const { currentUser, initializing } = useApp();
  if (initializing) {
    return <div className="auth-loading">Loading...</div>;
  }
  if (currentUser) {
    const redirect = {
      [ROLES.CITIZEN]: '/citizen',
      [ROLES.ADMIN]: '/admin',
      [ROLES.OFFICER]: '/officer',
    }[currentUser.role];
    return <Navigate to={redirect || '/'} replace />;
  }
  return <Outlet />;
}
