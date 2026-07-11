export const ROLES = {
  CITIZEN: 'citizen',
  ADMIN: 'admin',
  OFFICER: 'officer',
};

export const STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  CLOSED: 'closed',
};

export const STATUS_LIST = Object.values(STATUSES);

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

export const SERVICE_TYPES = [
  'Waste Collection Request',
  'Street Cleaning',
  'Water Connection Inquiry',
  'Public Facility Access',
  'General Information',
  'Other',
];
