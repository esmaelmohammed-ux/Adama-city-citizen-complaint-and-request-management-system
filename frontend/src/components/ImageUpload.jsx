import { useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './ImageUpload.css';
// comment added by me
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export default function ImageUpload({
  value,
  onChange,
  label,
  hint,
  optional = true,
}) {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const resolvedLabel = label ?? t('form.photo');
  const resolvedHint = hint ?? t('form.photoHint');

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(t('form.photoNotImage'));
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(t('form.photoTooLarge'));
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.onerror = () => setError(t('form.photoReadError'));
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const clear = () => {
    onChange(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="image-upload">
      <span className="image-upload-label">
        {resolvedLabel}
        {optional && <span className="image-upload-optional"> {t('form.optional')}</span>}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/*"
        className="image-upload-input"
        onChange={handleChange}
      />

      {value ? (
        <div className="image-upload-preview">
          <img src={value} alt={t('detail.photoAlt')} />
          <div className="image-upload-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => inputRef.current?.click()}
            >
              {t('form.changePhoto')}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
              {t('form.remove')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="image-upload-trigger"
          onClick={() => inputRef.current?.click()}
        >
          {t('form.choosePhoto')}
        </button>
      )}

      {resolvedHint && !error && <small className="field-hint">{resolvedHint}</small>}
      {error && <small className="image-upload-error">{error}</small>}
    </div>
  );
}
