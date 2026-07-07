import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROLES, DEMO_ACCOUNTS } from '../constants';
import BrandLogo from '../components/BrandLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../components/BrandLogo.css';
import '../components/LanguageSwitcher.css';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { loadRememberMe, saveRememberMe } from '../utils/storage';
import { EyeIcon, LockIcon, MailIcon } from '../components/auth/AuthIcons';
import './Auth.css';

const DEMO_BTN_KEYS = {
  Citizen: 'auth.demoCitizenBtn',
  Administrator: 'auth.demoAdminBtn',
  'Department Officer': 'auth.demoOfficerBtn',
};

const DEMO_ACCOUNT_ORDER = ['Citizen', 'Department Officer', 'Administrator'];

const SIDEBAR_FEATURES = [
  { icon: '📝', key: 'auth.featureComplaints' },
  { icon: '📋', key: 'auth.featureServices' },
  { icon: '🔔', key: 'auth.featureNotifications' },
];

function dashboardPathForRole(role) {
  return {
    [ROLES.CITIZEN]: '/citizen',
    [ROLES.ADMIN]: '/admin',
    [ROLES.OFFICER]: '/officer',
  }[role] || '/';
}

export default function LoginPage() {
  const { login } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const saved = loadRememberMe();
    if (saved?.rememberMe && saved.email) {
      setForm((prev) => ({ ...prev, email: saved.email }));
      setRememberMe(true);
    }
  }, []);

  const sortedDemoAccounts = [...DEMO_ACCOUNTS].sort(
    (a, b) => DEMO_ACCOUNT_ORDER.indexOf(a.label) - DEMO_ACCOUNT_ORDER.indexOf(b.label)
  );

  const completeLogin = async (email, password, shouldRemember = rememberMe) => {
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message || t('common.invalidCredentials'));
      setInfo('');
      return false;
    }
    saveRememberMe({ email, rememberMe: shouldRemember });
    setError('');
    setInfo('');
    navigate(dashboardPathForRole(result.role));
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    completeLogin(form.email, form.password);
  };

  const loginDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    completeLogin(account.email, account.password);
  };

  const handleForgotPassword = () => {
    setError('');
    setInfo(t('auth.forgotPasswordDemo'));
  };

  return (
    <div className="auth-split-page">
      <aside className="auth-sidebar" aria-label={t('auth.welcomeBack')}>
        <div className="auth-sidebar-top">
          <BrandLogo className="sidebar-brand" to="/" />
          <LanguageSwitcher className="language-switcher--sidebar" />
        </div>

        <div className="auth-sidebar-content">
          <h1>{t('auth.welcomeBack')}</h1>
          <p>{t('auth.sidebarDescription')}</p>
          <ul className="auth-feature-list">
            {SIDEBAR_FEATURES.map((item) => (
              <li key={item.key}>
                <span className="auth-feature-icon" aria-hidden="true">{item.icon}</span>
                {t(item.key)}
              </li>
            ))}
          </ul>
        </div>

        <p className="auth-sidebar-footer">{t('auth.copyright')}</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card auth-card--login">
          <div className="auth-card-header">
            <h2>{t('auth.signInTitle')}</h2>
            <p>{t('auth.signInCardSubtitle')}</p>
          </div>

          <div className="auth-demo-row">
            {sortedDemoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="auth-demo-btn"
                onClick={() => loginDemo(acc)}
              >
                {t(DEMO_BTN_KEYS[acc.label] || acc.label)}
              </button>
            ))}
          </div>

          <div className="auth-divider">
            <span>{t('auth.orContinueEmail')}</span>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {info && <div className="alert alert-info">{info}</div>}

          <form onSubmit={handleSubmit} className="auth-form auth-form--login">
            <label className="auth-field">
              <span>{t('auth.emailAddress')}</span>
              <span className="auth-input-wrap">
                <MailIcon />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                />
              </span>
            </label>

            <div className="auth-field">
              <div className="auth-field-label-row">
                <span>{t('common.password')}</span>
                <button type="button" className="auth-link-btn" onClick={handleForgotPassword}>
                  {t('auth.forgotPassword')}
                </button>
              </div>
              <span className="auth-input-wrap">
                <LockIcon />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder={t('auth.passwordPlaceholder')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </span>
            </div>

            <label className="auth-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>{t('auth.rememberMe')}</span>
            </label>

            <button type="submit" className="btn btn-primary btn-block auth-submit-btn">
              {t('common.signIn')}
            </button>
          </form>

          <p className="auth-footer">
            {t('auth.noAccount')}{' '}
            <Link to="/register">{t('auth.createOneFree')}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
