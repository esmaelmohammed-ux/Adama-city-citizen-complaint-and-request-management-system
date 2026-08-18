import { NavLink, useNavigate } from 'react-router-dom';
import { ROLES } from '../constants';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import BrandLogo from './BrandLogo';
import LanguageSwitcher from './LanguageSwitcher';
import './BrandLogo.css';
import './LanguageSwitcher.css';
import './Layout.css';
// commen
const navByRole = {
  [ROLES.CITIZEN]: [
    { to: '/citizen', labelKey: 'sidebar.dashboard', end: true },
    { to: '/citizen/complaints/new', labelKey: 'sidebar.newComplaint' },
    { to: '/citizen/requests/new', labelKey: 'sidebar.newRequest' },
    { to: '/citizen/submissions', labelKey: 'sidebar.mySubmissions' },
    { to: '/citizen/notifications', labelKey: 'sidebar.notifications' },
    { to: '/citizen/profile', labelKey: 'sidebar.profile' },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', labelKey: 'sidebar.dashboard', end: true },
    { to: '/admin/complaints', labelKey: 'sidebar.complaints' },
    { to: '/admin/requests', labelKey: 'sidebar.serviceRequests' },
    { to: '/admin/users', labelKey: 'sidebar.users' },
    { to: '/admin/departments', labelKey: 'sidebar.departments' },
    { to: '/admin/reports', labelKey: 'sidebar.reports' },
    { to: '/admin/activity', labelKey: 'sidebar.activityLog' },
  ],
  [ROLES.OFFICER]: [
    { to: '/officer', labelKey: 'sidebar.dashboard', end: true },
    { to: '/officer/tasks', labelKey: 'sidebar.assignedTasks' },
    { to: '/officer/notifications', labelKey: 'sidebar.notifications' },
  ],
};

export default function Layout({ children }) {
  const { currentUser, logout, notifications } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const unread = notifications.filter(
    (n) => n.userId === currentUser?.id && !n.isRead
  ).length;
  const links = navByRole[currentUser?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <BrandLogo className="sidebar-brand" to="/" />
        <LanguageSwitcher className="language-switcher--sidebar" />
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {t(link.labelKey)}
              {link.labelKey === 'sidebar.notifications' && unread > 0 && (
                <span className="nav-badge">{unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{currentUser?.fullName?.charAt(0)}</div>
            <div>
              <strong>{currentUser?.fullName}</strong>
              <span>{t(`roles.${currentUser?.role}`)}</span>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            {t('common.signOut')}
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
