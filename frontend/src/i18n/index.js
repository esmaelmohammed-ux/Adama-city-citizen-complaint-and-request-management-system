import en from './en';
import am from './am';
import om from './om';

export const translations = { en, am, om };

export function translate(lang, key) {
  const parts = key.split('.');
  let value = translations[lang] ?? translations.en;

  for (const part of parts) {
    value = value?.[part];
    if (value === undefined) break;
  }

  if (value !== undefined) return value;

  let fallback = translations.en;
  for (const part of parts) {
    fallback = fallback?.[part];
    if (fallback === undefined) break;
  }

  return fallback ?? key;
}
