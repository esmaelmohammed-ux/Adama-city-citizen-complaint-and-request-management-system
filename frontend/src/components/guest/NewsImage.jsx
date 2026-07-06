import { useState } from 'react';
import { DEFAULT_NEWS_IMAGE, getNewsImage } from '../../data/newsImages';

export default function NewsImage({ imageKey, alt = '' }) {
  const [src, setSrc] = useState(() => getNewsImage(imageKey));

  const handleError = () => {
    if (src !== DEFAULT_NEWS_IMAGE) {
      setSrc(DEFAULT_NEWS_IMAGE);
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className="guest-news-visual-img"
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}
