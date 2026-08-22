/** Mirrors Adama Citizen complaint domain (read-only copy). */

export const COMPLAINT_CATEGORIES = [
  'roadMaintenance',
  'wasteManagement',
  'waterSupply',
  'streetLighting',
  'drainage',
  'publicSafety',
  'noisePollution',
  'other',
];

export const CATEGORY_LABELS = {
  roadMaintenance: 'Road Maintenance',
  wasteManagement: 'Waste Management',
  waterSupply: 'Water Supply',
  streetLighting: 'Street Lighting',
  drainage: 'Drainage',
  publicSafety: 'Public Safety',
  noisePollution: 'Noise Pollution',
  other: 'Other',
};

export const DEPARTMENTS = [
  'Roads & Infrastructure',
  'Water Supply',
  'Sanitation',
  'Public Utilities',
];

/** Default department routing for each complaint category. */
export const CATEGORY_TO_DEPARTMENT = {
  roadMaintenance: 'Roads & Infrastructure',
  drainage: 'Roads & Infrastructure',
  waterSupply: 'Water Supply',
  wasteManagement: 'Sanitation',
  streetLighting: 'Public Utilities',
  publicSafety: 'Public Utilities',
  noisePollution: 'Sanitation',
  other: 'Roads & Infrastructure',
};

