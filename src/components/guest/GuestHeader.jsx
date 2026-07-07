import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROLES } from '../../constants';
import { useApp } from '../../context/AppContext';
import { navLinks } from '../../data/guestContent';
import { useLanguage } from '../../context/LanguageContext';
import BrandLogo from '../BrandLogo';
import GuestIcon from './GuestIcon';
import LanguageSwitcher from '../LanguageSwitcher';
import '../BrandLogo.css';
import '../LanguageSwitcher.css';

const DASHBOARD_PATHS = {
  [ROLES.CITIZEN]: '/citizen',
  [ROLES.ADMIN]: '/admin',
  [ROLES.OFFICER]: '/officer',
};

export default function GuestHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { currentUser } = useApp();
  const { t } = useLanguage();
  const dashboardPath = currentUser ? DASHBOARD_PATHS[currentUser.role] : null;

  useEffect(() => {
    const sectionIds = navLinks
      .map((link) => link.href.replace('#', ''))
      .filter(Boolean);

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.15, 0.4] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="guest-header">
      <div className="guest-topbar">
        <div className="guest-container guest-topbar-inner">
          <div className="guest-topbar-left">
            <span className="guest-topbar-item">
              <GuestIcon name="phone" className="guest-topbar-icon" />
              +251-22-110-0000
            </span>
            <span className="guest-topbar-item">
              <GuestIcon name="mail" className="guest-topbar-icon" />
              info@adama.gov.et
            </span>
          </div>
          <div className="guest-topbar-right">
            <LanguageSwitcher className="language-switcher--guest-topbar" />
            <span>{t('header.hours')}</span>
            <span>{t('header.orgName')}</span>
          </div>
        </div>
      </div>

      <nav className="guest-nav" aria-label={t('header.mainNav')}>
        <div className="guest-container guest-nav-inner">
          <BrandLogo className="guest-nav-logo" to="/" />

          <button
            type="button"
            className="guest-menu-toggle"
            aria-label={t('header.toggleMenu')}
            aria-expanded={menuOpen}
            aria-controls="guest-nav-links"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          <div
            id="guest-nav-links"
            className={`guest-nav-links ${menuOpen ? 'open' : ''}`}
          >
            {navLinks.map((link) => {
              const sectionId = link.href.replace('#', '');
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={sectionId === activeSection ? 'active' : ''}
                  onClick={() => setMenuOpen(false)}
                  aria-current={sectionId === activeSection ? 'true' : undefined}
                >
                  {t(link.labelKey)}
                </a>
              );
            })}
          </div>

          <div className="guest-nav-actions">
            <LanguageSwitcher className="language-switcher--guest-nav guest-nav-lang-mobile" />
            {dashboardPath ? (
              <Link to={dashboardPath} className="guest-btn-cta guest-btn-cta-sm">
                {t('header.goToDashboard')}
              </Link>
            ) : (
              <>
                <Link to="/login" className="guest-link-login">{t('common.login')}</Link>
                <Link to="/register" className="guest-btn-cta guest-btn-cta-sm">{t('common.register')}</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
