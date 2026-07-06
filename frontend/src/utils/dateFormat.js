const LOCALE_MAP = {
  en: 'en-ET',
  am: 'am-ET',
  om: 'om-ET',
};

export function formatLocalizedDate(isoDate, language) {
  const locale = LOCALE_MAP[language] || LOCALE_MAP.en;
  return new Date(isoDate).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
