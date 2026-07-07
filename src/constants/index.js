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

export const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
  closed: 'Closed',
};

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

export const DEMO_ACCOUNTS = [
  { email: 'citizen@test.com', password: 'citizen123', label: 'Citizen' },
  { email: 'admin@test.com', password: 'admin123', label: 'Administrator' },
  { email: 'officer@test.com', password: 'officer123', label: 'Department Officer' },
];
