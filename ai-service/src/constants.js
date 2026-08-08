/** Mirrors Adama Citizen complaint / service domain (read-only copy). */

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

export const SERVICE_TYPES = [
  'Waste Collection Request',
  'Street Cleaning',
  'Water Connection Inquiry',
  'Public Facility Access',
  'General Information',
  'Other',
];

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

export const SERVICE_TO_DEPARTMENT = {
  'Waste Collection Request': 'Sanitation',
  'Street Cleaning': 'Sanitation',
  'Water Connection Inquiry': 'Water Supply',
  'Public Facility Access': 'Public Utilities',
  'General Information': 'Public Utilities',
  Other: 'Roads & Infrastructure',
};
