import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuestHeader from '../components/guest/GuestHeader';
import GuestFooter from '../components/guest/GuestFooter';
import GuestIcon from '../components/guest/GuestIcon';
import ServiceIcon from '../components/guest/ServiceIcon';
import NewsImage from '../components/guest/NewsImage';
import TestimonialAvatar from '../components/guest/TestimonialAvatar';
import HeritageDivider from '../components/guest/HeritageDivider';
import adamaHero from '../assets/hero/adama-hero.png';
import { COMPLAINT_CATEGORIES } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatLocalizedDate } from '../utils/dateFormat';
import { handleHashLinkClick } from '../utils/smoothScroll';
import {
  complaintCategories,
  faqItems,
  guestStats,
  heroStats,
  howItWorks,
  municipalServices,
  newsItems,
  testimonials,
} from '../data/guestContent';
import './GuestDashboard.css';

export default function GuestDashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [quickForm, setQuickForm] = useState({ title: '', category: '', description: '' });
  const [openFaq, setOpenFaq] = useState(0);

  usePageMeta({
    title: t('seo.title'),
    description: t('seo.description'),
    language,
  });

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    navigate('/login', { state: { message: t('common.signInToSubmit') } });
  };

  return (
    <div className="guest-page">
      <a
        href="#main-content"
        className="skip-link"
        onClick={handleHashLinkClick}
      >
        {t('common.skipToContent')}
      </a>
      <GuestHeader />

      <main id="main-content">
      <section
        className="guest-hero"
        id="home"
        aria-labelledby="hero-title"
        style={{ '--hero-image': `url(${adamaHero})` }}
      >
        <div className="guest-container guest-hero-grid">
          <div className="guest-hero-content">
            <span className="guest-badge">{t('hero.badge')}</span>
            <h1 id="hero-title">
              {t('hero.title')} <span className="guest-accent">{t('hero.titleAccent')}</span>
            </h1>
            <p>{t('hero.description')}</p>
            <div className="guest-hero-actions">
              <Link to="/register" className="guest-btn-cta">{t('hero.getStarted')}</Link>
              <a
                href="#services"
                className="guest-btn-ghost-white"
                onClick={handleHashLinkClick}
              >
                {t('hero.viewServices')}
              </a>
            </div>
            <div className="guest-hero-stats">
              {heroStats.map((s) => (
                <div key={s.labelKey}>
                  <strong>{s.value}</strong>
                  <span>{t(s.labelKey)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="guest-quick-submit">
            <h3>{t('hero.quickSubmit')}</h3>
            <form onSubmit={handleQuickSubmit}>
              <input
                placeholder={t('hero.titlePlaceholder')}
                value={quickForm.title}
                onChange={(e) => setQuickForm({ ...quickForm, title: e.target.value })}
                required
              />
              <select
                value={quickForm.category}
                onChange={(e) => setQuickForm({ ...quickForm, category: e.target.value })}
                required
              >
                <option value="">{t('hero.selectCategory')}</option>
                {COMPLAINT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t(`categories.${c}`)}</option>
                ))}
              </select>
              <textarea
                rows={4}
                placeholder={t('hero.descriptionPlaceholder')}
                value={quickForm.description}
                onChange={(e) => setQuickForm({ ...quickForm, description: e.target.value })}
              />
              <button type="submit" className="guest-btn-cta guest-btn-cta-block">{t('hero.submitComplaint')}</button>
              <p className="guest-quick-note">{t('hero.loginRequired')}</p>
            </form>
          </div>
        </div>
        <div className="guest-hero-wave" />
      </section>

      <section className="guest-stats-section">
        <div className="guest-container guest-stats-grid">
          {guestStats.map((stat) => (
            <div key={stat.labelKey} className={`guest-stat-card tone-${stat.tone}`}>
              <GuestIcon name={stat.iconKey} className="guest-stat-icon" />
              <strong>{stat.value}</strong>
              <span>{t(stat.labelKey)}</span>
            </div>
          ))}
        </div>
      </section>

      <HeritageDivider />

      <section className="guest-section" id="services">
        <div className="guest-container">
          <p className="guest-eyebrow">{t('services.eyebrow')}</p>
          <h2 className="guest-section-title">{t('services.title')}</h2>
          <p className="guest-section-desc">{t('services.description')}</p>
          <div className="guest-services-grid">
            {municipalServices.map((service) => (
              <article key={service.titleKey} className="guest-service-card">
                <div className="guest-service-icon">
                  <ServiceIcon iconKey={service.iconKey} alt={t(service.titleKey)} />
                </div>
                <h3>{t(service.titleKey)}</h3>
                <p>{t(service.descKey)}</p>
                <Link to={service.link}>{t('common.applyNow')}</Link>
              </article>
            ))}
          </div>
          <div className="guest-section-cta">
            <Link to="/register" className="guest-btn-outline-blue">{t('services.viewAll')}</Link>
          </div>
        </div>
      </section>

      <HeritageDivider />

      <section className="guest-section guest-section-muted" id="complaints">
        <div className="guest-container">
          <p className="guest-eyebrow">{t('complaints.eyebrow')}</p>
          <h2 className="guest-section-title">{t('complaints.title')}</h2>
          <p className="guest-section-desc">{t('complaints.description')}</p>
          <div className="guest-categories-grid">
            {complaintCategories.map((cat) => (
              <Link key={cat.labelKey} to="/register" className="guest-category-card">
                <GuestIcon name={cat.iconKey} className="guest-category-icon" />
                <p>{t(cat.labelKey)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HeritageDivider />

      <section className="guest-how" id="about">
        <div className="guest-container">
          <p className="guest-eyebrow guest-eyebrow-light">{t('howItWorks.eyebrow')}</p>
          <h2 className="guest-section-title guest-title-light">{t('howItWorks.title')}</h2>
          <p className="guest-section-desc guest-desc-light">{t('howItWorks.description')}</p>
          <div className="guest-steps">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="guest-step">
                {i < howItWorks.length - 1 && <span className="guest-step-line" />}
                <div className="guest-step-icon-wrap">
                  <span className="guest-step-num">{step.step}</span>
                  <GuestIcon name={step.iconKey} className="guest-step-icon" />
                </div>
                <h3>{t(step.titleKey)}</h3>
                <p>{t(step.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HeritageDivider />

      <section className="guest-section" id="news">
        <div className="guest-container">
          <div className="guest-news-header">
            <h2 className="guest-section-title guest-title-left">{t('news.title')}</h2>
          </div>
          <div className="guest-news-grid">
            {newsItems.map((item) => (
              <article key={item.titleKey} className="guest-news-card">
                <div className="guest-news-visual">
                  <NewsImage imageKey={item.imageKey} alt={t(item.titleKey)} />
                </div>
                <div className="guest-news-body">
                  <div className="guest-news-meta">
                    <span className={`guest-tag tag-${item.tagTone}`}>{t(item.tagKey)}</span>
                    <span>{formatLocalizedDate(item.date, language)}</span>
                  </div>
                  <h3>{t(item.titleKey)}</h3>
                  <p>{t(item.excerptKey)}</p>
                  <Link to="/register">{t('common.readMore')}</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <HeritageDivider />

      <section className="guest-section guest-section-muted">
        <div className="guest-container">
          <p className="guest-eyebrow">{t('testimonials.eyebrow')}</p>
          <h2 className="guest-section-title">{t('testimonials.title')}</h2>
          <div className="guest-testimonials">
            {testimonials.map((item) => (
              <blockquote key={item.name} className="guest-testimonial">
                <div className="guest-stars" aria-label={t('testimonials.rating')}>★★★★★</div>
                <p>&ldquo;{t(item.quoteKey)}&rdquo;</p>
                <footer>
                  <TestimonialAvatar avatarKey={item.avatarKey} name={item.name} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{t(item.roleKey)}</span>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <HeritageDivider />

      <section className="guest-section" id="faq">
        <div className="guest-container guest-faq-wrap">
          <p className="guest-eyebrow">{t('faq.eyebrow')}</p>
          <h2 className="guest-section-title">{t('faq.title')}</h2>
          <div className="guest-faq-list">
            {faqItems.map((item, i) => {
              const panelId = `faq-panel-${i}`;
              const isOpen = openFaq === i;
              return (
              <div key={item.qKey} className={`guest-faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  id={`faq-trigger-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenFaq(isOpen ? -1 : i)}
                >
                  {t(item.qKey)}
                  <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <p id={panelId} role="region" aria-labelledby={`faq-trigger-${i}`}>
                    {t(item.aKey)}
                  </p>
                )}
              </div>
            );
            })}
          </div>
          <p className="guest-faq-more">
            {t('faq.stillHaveQuestions')}{' '}
            <a href="#contact" onClick={handleHashLinkClick}>{t('footer.contactUs')}</a>
          </p>
        </div>
      </section>
      </main>

      <GuestFooter />
    </div>
  );
}
