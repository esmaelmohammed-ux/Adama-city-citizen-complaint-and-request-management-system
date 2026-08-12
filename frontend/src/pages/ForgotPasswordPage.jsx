import { useState } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import '../components/BrandLogo.css';
import '../components/LanguageSwitcher.css';
import { useLanguage } from '../context/LanguageContext';
import { api, ApiError } from '../services/api';
import { MailIcon } from '../components/auth/AuthIcons';
import './Auth.css';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(res.message || t('auth.forgotSuccess'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('auth.forgotFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      <aside className="auth-sidebar" aria-label={t('auth.forgotTitle')}>
        <div className="auth-sidebar-top">
          <BrandLogo className="sidebar-brand" to="/" />
          <LanguageSwitcher className="language-switcher--sidebar" />
        </div>
        <div className="auth-sidebar-content">
          <h1>{t('auth.forgotTitle')}</h1>
          <p>{t('auth.forgotSidebar')}</p>
        </div>
        <p className="auth-sidebar-footer">{t('auth.copyright')}</p>
      </aside>

      <main className="auth-main">
        <div className="auth-card auth-card--login">
          <div className="auth-card-header">
            <h2>{t('auth.forgotTitle')}</h2>
            <p>{t('auth.forgotCardSubtitle')}</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="auth-form auth-form--login">
            <label className="auth-field">
              <span>{t('auth.emailAddress')}</span>
              <span className="auth-input-wrap">
                <MailIcon />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete="email"
                />
              </span>
            </label>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit-btn"
              disabled={loading}
            >
              {loading ? t('auth.sendingReset') : t('auth.sendResetLink')}
            </button>
          </form>

          <p className="auth-footer">
            <Link to="/login">{t('auth.backToSignIn')}</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
