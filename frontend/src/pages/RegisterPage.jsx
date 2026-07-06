import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { EyeIcon, LockIcon, MailIcon, PhoneIcon, UserIcon } from '../components/auth/AuthIcons';
import '../components/BrandLogo.css';
import '../components/LanguageSwitcher.css';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import './Auth.css';

const REGISTER_FEATURES = [
  'auth.regFeatureFree',
  'auth.regFeatureComplaints',
  'auth.regFeatureTrack',
  'auth.regFeatureDepartments',
];

export default function RegisterPage() {
  const { register } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(t('common.passwordsMismatch'));
      return;
    }
    const result = await register({
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      password: form.password,
    });
    if (!result.success) {
      setError(result.message === 'Email already registered.'
        ? t('common.emailRegistered')
        : result.message);
      return;
    }
    navigate('/citizen');
  };

  return (
    <div className="auth-split-page">
      <aside className="auth-sidebar" aria-label={t('auth.joinPortal')}>
        <div className="auth-sidebar-top">
          <BrandLogo className="sidebar-brand" to="/" />
          <LanguageSwitcher className="language-switcher--sidebar" />
        </div>

        <div className="auth-sidebar-content">
          <h1>{t('auth.joinPortal')}</h1>
          <p>{t('auth.registerSidebarDescription')}</p>
          <ul className="auth-feature-list auth-feature-list--checks">
            {REGISTER_FEATURES.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>

        <p className="auth-sidebar-footer">{t('auth.copyright')}</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card auth-card--register">
          <div className="auth-card-header">
            <h2>{t('auth.createAccountTitle')}</h2>
            <p>{t('auth.registerCardSubtitle')}</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form auth-form--register">
            <label className="auth-field">
              <span>{t('auth.fullName')} *</span>
              <span className="auth-input-wrap">
                <UserIcon />
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                  placeholder={t('auth.fullNamePlaceholder')}
                  autoComplete="name"
                />
              </span>
            </label>

            <label className="auth-field">
              <span>{t('auth.emailAddress')} *</span>
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

            <label className="auth-field">
              <span>{t('auth.phoneNumber')} *</span>
              <span className="auth-input-wrap">
                <PhoneIcon />
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  required
                  placeholder={t('auth.phonePlaceholder')}
                  autoComplete="tel"
                />
              </span>
            </label>

            <div className="auth-field">
              <span>{t('common.password')} *</span>
              <span className="auth-input-wrap">
                <LockIcon />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  placeholder={t('auth.passwordMinPlaceholder')}
                  autoComplete="new-password"
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

            <div className="auth-field">
              <span>{t('auth.confirmPassword')} *</span>
              <span className="auth-input-wrap">
                <LockIcon />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  minLength={8}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </span>
            </div>

            <button type="submit" className="btn btn-primary btn-block auth-submit-btn">
              {t('auth.createAccountTitle')}
            </button>
          </form>

          <p className="auth-footer">
            {t('auth.alreadyRegistered')}{' '}
            <Link to="/login">{t('common.signIn')}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
