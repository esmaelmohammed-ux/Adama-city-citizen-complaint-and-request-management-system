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

/** Adama areas for the complaint location dropdown. */
export const ADAMA_LOCATION_GROUPS = [
  {
    id: 'subCities',
    keys: ['lugo', 'dabe', 'bole', 'dembela', 'abaGeda', 'hawas'],
  },
  {
    id: 'kebeles',
    keys: [
      'kebele01',
      'kebele02',
      'kebele03',
      'kebele04',
      'kebele05',
      'kebele06',
      'kebele07',
      'kebele08',
      'kebele09',
      'kebele10',
      'kebele11',
      'kebele12',
      'kebele13',
      'kebele14',
      'kebele15',
      'kebele16',
      'kebele17',
      'kebele18',
    ],
  },
  {
    id: 'landmarks',
    keys: [
      'medhanialem',
      'adamaStadium',
      'centralBusStation',
      'chinaAvenue',
      'astu',
      'wonji',
    ],
  },
];

export const ADAMA_LOCATIONS = ADAMA_LOCATION_GROUPS.flatMap((group) => group.keys);

export const DEMO_ACCOUNTS = [
  { email: 'citizen@test.com', password: 'citizen123', label: 'Citizen' },
  { email: 'admin@test.com', password: 'admin123', label: 'Administrator' },
  { email: 'officer@test.com', password: 'officer123', label: 'Department Officer' },
];
