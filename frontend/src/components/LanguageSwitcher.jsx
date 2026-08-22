import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSwitcher.css';

export default function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage, languages, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = languages[language];

  const handleSelect = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`language-switcher ${className} ${open ? 'open' : ''}`.trim()}
    >
      <span className="language-switcher-label">{t('language.label')}</span>
      <div className="language-switcher-control">
        <button
          type="button"
          className="language-switcher-trigger"
          aria-label={t('language.label')}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span>{current?.nativeLabel}</span>
          <span className="language-switcher-chevron" aria-hidden="true">▾</span>
        </button>
        {open && (
          <ul className="language-switcher-menu" role="listbox">
            {Object.entries(languages).map(([code, info]) => (
              <li key={code} role="option" aria-selected={code === language}>
                <button
                  type="button"
                  className={code === language ? 'active' : ''}
                  onClick={() => handleSelect(code)}
                >
                  {info.nativeLabel}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
