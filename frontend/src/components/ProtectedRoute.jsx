import { Navigate, Outlet } from 'react-router-dom';
import { ROLES } from '../constants';
import { useApp } from '../context/AppContext';
import Layout from './Layout';

export function ProtectedRoute({ allowedRoles }) {
  const { currentUser, initializing } = useApp();

  if (initializing) {
    return null;
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
    return null;
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
