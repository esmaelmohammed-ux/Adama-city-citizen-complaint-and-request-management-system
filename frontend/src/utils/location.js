import { ADAMA_LOCATIONS } from '../constants';

export function locationLabel(location, t) {
  if (!location) return '';
  if (ADAMA_LOCATIONS.includes(location)) return t(`locations.${location}`);
  return location;
}

export function formatComplaintLocation(item, t) {
  if (!item) return '';
  const area = locationLabel(item.location, t);
  if (item.landmark) return `${area} — ${item.landmark}`;
  return area;
}
