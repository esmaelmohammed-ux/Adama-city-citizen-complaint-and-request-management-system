import { useRef, useState } from 'react';
import './ImageUpload.css';

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
// Commen
export default function ImageUpload({
  value,
  onChange,
  label = 'Photo',
  hint = 'JPG, PNG, or WebP. Max 2 MB.',
  optional = true,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError('Image must be 2 MB or smaller.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.onerror = () => setError('Could not read the selected image.');
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
        {label}
        {optional && <span className="image-upload-optional"> (optional)</span>}
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
          <img src={value} alt="Selected upload preview" />
          <div className="image-upload-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => inputRef.current?.click()}
            >
              Change photo
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="image-upload-trigger"
          onClick={() => inputRef.current?.click()}
        >
          Choose photo
        </button>
      )}

      {hint && !error && <small className="field-hint">{hint}</small>}
      {error && <small className="image-upload-error">{error}</small>}
    </div>
  );
}

