import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../components/BrandLogo.css';
import '../components/LanguageSwitcher.css';
import { useLanguage } from '../context/LanguageContext';
import { api, ApiError } from '../services/api';
import { EyeIcon, LockIcon } from '../components/auth/AuthIcons';
import './Auth.css';

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError(t('auth.resetMissingToken'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.resetPasswordTooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('auth.passwordsMustMatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setSuccess(res.message || t('auth.resetSuccess'));
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('auth.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      <aside className="auth-sidebar" aria-label={t('auth.resetTitle')}>
        <div className="auth-sidebar-top">
          <BrandLogo className="sidebar-brand" to="/" />
          <LanguageSwitcher className="language-switcher--sidebar" />
        </div>
        <div className="auth-sidebar-content">
          <h1>{t('auth.resetTitle')}</h1>
          <p>{t('auth.resetSidebar')}</p>
        </div>
        <p className="auth-sidebar-footer">{t('auth.copyright')}</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card auth-card--login">
          <div className="auth-card-header">
            <h2>{t('auth.resetTitle')}</h2>
            <p>{t('auth.resetCardSubtitle')}</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {!token && (
            <div className="alert alert-error">{t('auth.resetMissingToken')}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form auth-form--login">
            <label className="auth-field">
              <span>{t('auth.newPassword')}</span>
              <span className="auth-input-wrap">
                <LockIcon />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={t('auth.passwordMinPlaceholder')}
                  autoComplete="new-password"
                  disabled={!token}
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
            </label>

            <label className="auth-field">
              <span>{t('auth.confirmPassword')}</span>
              <span className="auth-input-wrap">
                <LockIcon />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  autoComplete="new-password"
                  disabled={!token}
                />
              </span>
            </label>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit-btn"
              disabled={loading || !token}
            >
              {loading ? t('auth.savingPassword') : t('auth.saveNewPassword')}
            </button>
          </form>

          <p className="auth-footer">
            <Link to="/login">{t('auth.backToSignIn')}</Link>
            {' · '}
            <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
