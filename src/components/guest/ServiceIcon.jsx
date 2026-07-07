import { useState } from 'react';
import { DEFAULT_SERVICE_ICON, getServiceIcon } from '../../data/serviceIcons';

export default function ServiceIcon({ iconKey, alt = '' }) {
  const [src, setSrc] = useState(() => getServiceIcon(iconKey));

  const handleError = () => {
    if (src !== DEFAULT_SERVICE_ICON) {
      setSrc(DEFAULT_SERVICE_ICON);
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className="guest-service-icon-img"
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}
