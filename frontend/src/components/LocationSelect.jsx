import { useEffect, useId, useRef, useState } from 'react';
import { ADAMA_LOCATION_GROUPS, ADAMA_LOCATIONS } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { locationLabel } from '../utils/location';
import './LocationSelect.css';

export default function LocationSelect({ location = '', landmark = '', onChange }) {
  const { t } = useLanguage();
  const known = !location || ADAMA_LOCATIONS.includes(location);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const display = location
    ? (known ? locationLabel(location, t) : location)
    : t('form.selectLocation');

  const handleSelect = (value) => {
    onChange({ location: value });
    setOpen(false);
  };

  return (
    <>
      <label>
        {t('form.location')}
        <div
          ref={rootRef}
          className={`location-select ${open ? 'open' : ''}`.trim()}
        >
          <button
            type="button"
            className={`location-select-trigger ${location ? '' : 'placeholder'}`.trim()}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span>{display}</span>
            <span className="location-select-chevron" aria-hidden="true">▾</span>
          </button>
          <input
            className="location-select-required"
            value={location}
            required
            readOnly
            tabIndex={-1}
            aria-hidden="true"
          />
          {open && (
            <div id={listId} className="location-select-menu" role="listbox">
              {!known && (
                <button
                  type="button"
                  role="option"
                  aria-selected
                  className="active"
                  onClick={() => handleSelect(location)}
                >
                  {location}
                </button>
              )}
              {ADAMA_LOCATION_GROUPS.map((group) => (
                <div
                  key={group.id}
                  className="location-select-group"
                  role="group"
                  aria-label={t(`locationGroups.${group.id}`)}
                >
                  <div className="location-select-group-label">
                    {t(`locationGroups.${group.id}`)}
                  </div>
                  {group.keys.map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="option"
                      aria-selected={location === id}
                      className={location === id ? 'active' : undefined}
                      onClick={() => handleSelect(id)}
                    >
                      {t(`locations.${id}`)}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </label>
      <label>
        {t('form.landmark')}
        <input
          value={landmark}
          onChange={(e) => onChange({ landmark: e.target.value })}
          placeholder={t('form.landmarkPlaceholder')}
          maxLength={120}
        />
        <small className="field-hint">{t('form.landmarkHint')}</small>
      </label>
    </>
  );
}
