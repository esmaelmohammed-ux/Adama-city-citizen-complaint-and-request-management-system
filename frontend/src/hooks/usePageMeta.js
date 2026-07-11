import { useEffect } from 'react';

function upsertMeta(name, content, attribute = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function usePageMeta({ title, description, language }) {
  useEffect(() => {
    if (title) document.title = title;
    upsertMeta('description', description);
    upsertMeta('og:title', title, 'property');
    upsertMeta('og:description', description, 'property');
    upsertMeta('og:type', 'website', 'property');
    if (language) {
      document.documentElement.lang = language;
    }
  }, [title, description, language]);
}
