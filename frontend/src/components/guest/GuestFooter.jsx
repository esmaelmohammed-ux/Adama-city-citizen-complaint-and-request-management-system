import { Link } from 'react-router-dom';
import { footerQuickLinks, footerServices, footerSocialLinks } from '../../data/guestContent';
import { useLanguage } from '../../context/LanguageContext';
import BrandLogo from '../BrandLogo';
import SocialIcon from './SocialIcons';
import '../BrandLogo.css';

export default function GuestFooter() {
  const { t } = useLanguage();

  return (
    <>
      <section className="guest-cta">
        <div className="guest-container guest-cta-inner">
          <h2>{t('footer.ctaTitle')}</h2>
          <p>{t('footer.ctaDesc')}</p>
          <div className="guest-cta-buttons">
            <Link to="/register" className="guest-btn-cta">{t('footer.registerNow')}</Link>
            <a href="#contact" className="guest-btn-outline-white">{t('footer.contactUs')}</a>
          </div>
        </div>
      </section>

      <footer className="guest-footer" id="contact">
        <div className="guest-container guest-footer-grid">
          <div className="guest-footer-brand">
            <BrandLogo className="footer-brand guest-footer-logo" to="/" />
            <p>{t('footer.brandDesc')}</p>
            <div className="guest-social">
              {footerSocialLinks.map((link) => (
                <a
                  key={link.icon}
                  href={link.href}
                  className="guest-social-icon"
                  aria-label={link.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon name={link.icon} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4>{t('footer.quickLinks')}</h4>
            <ul>
              {footerQuickLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href}>› {t(link.labelKey)}</Link>
                  ) : (
                    <a href={link.href}>› {t(link.labelKey)}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{t('footer.services')}</h4>
            <ul>
              {footerServices.map((key) => (
                <li key={key}><a href="#services">› {t(key)}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4>{t('footer.contactTitle')}</h4>
            <ul className="guest-contact-list">
              <li><span className="guest-contact-label">{t('footer.addressLabel')}</span> {t('footer.address')}</li>
              <li><span className="guest-contact-label">{t('footer.phoneLabel')}</span> +251-22-110-0000</li>
              <li><span className="guest-contact-label">{t('footer.emailLabel')}</span> info@adama.gov.et</li>
              <li><span className="guest-contact-label">{t('footer.hoursLabel')}</span> {t('footer.hours')}<br />{t('footer.satHours')}</li>
            </ul>
          </div>
        </div>

        <div className="guest-footer-bottom">
          <div className="guest-container">
            <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </>
  );
}
