import { STATUSES } from '../constants';

export const seedDepartments = [
  { id: 'dept-1', name: 'Roads & Infrastructure', description: 'Road maintenance and drainage', isActive: true },
  { id: 'dept-2', name: 'Water Supply', description: 'Water services and connections', isActive: true },
  { id: 'dept-3', name: 'Sanitation', description: 'Waste collection and cleaning', isActive: true },
  { id: 'dept-4', name: 'Public Utilities', description: 'Street lighting and utilities', isActive: true },
];

export const seedUsers = [
  {
    id: 'user-citizen-1',
    fullName: 'Abebe Kebede',
    email: 'citizen@test.com',
    password: 'citizen123',
    role: 'citizen',
    phoneNumber: '+251911000001',
    departmentId: null,
    isActive: true,
  },
  {
    id: 'user-admin-1',
    fullName: 'Selam Tadesse',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    phoneNumber: '+251911000002',
    departmentId: null,
    isActive: true,
  },
  {
    id: 'user-officer-1',
    fullName: 'Dawit Hailu',
    email: 'officer@test.com',
    password: 'officer123',
    role: 'officer',
    phoneNumber: '+251911000003',
    departmentId: 'dept-2',
    isActive: true,
  },
];

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();

export const seedComplaints = [
  {
    id: 'cmp-1',
    referenceId: 'CMP-2025-0001',
    title: 'Broken streetlight on Main Road',
    description: 'The streetlight near Adama Stadium has been out for two weeks.',
    category: 'Street Lighting',
    location: 'Main Road, near Adama Stadium',
    status: STATUSES.IN_PROGRESS,
    citizenId: 'user-citizen-1',
    departmentId: 'dept-4',
    assignedOfficerId: null,
    resolutionNote: '',
    createdAt: yesterday,
    updatedAt: now,
    resolvedAt: null,
  },
  {
    id: 'cmp-2',
    referenceId: 'CMP-2025-0002',
    title: 'Water leak on Bole Road',
    description: 'Continuous water leak causing road damage.',
    category: 'Water Supply',
    location: 'Bole Road, Kebele 05',
    status: STATUSES.PENDING,
    citizenId: 'user-citizen-1',
    departmentId: null,
    assignedOfficerId: null,
    resolutionNote: '',
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
  },
];

export const seedServiceRequests = [
  {
    id: 'srv-1',
    referenceId: 'SRV-2025-0001',
    serviceType: 'Waste Collection Request',
    description: 'Need additional waste bin for residential block.',
    location: 'Kebele 03, Adama',
    status: STATUSES.RESOLVED,
    citizenId: 'user-citizen-1',
    departmentId: 'dept-3',
    assignedOfficerId: null,
    resolutionNote: 'Waste bin delivered and installed.',
    createdAt: yesterday,
    updatedAt: now,
    resolvedAt: now,
  },
];

export const seedNotifications = [
  {
    id: 'notif-1',
    userId: 'user-citizen-1',
    title: 'Complaint In Progress',
    message: 'Your complaint CMP-2025-0001 has been assigned to Public Utilities.',
    relatedEntityType: 'complaint',
    relatedEntityId: 'cmp-1',
    isRead: false,
    createdAt: now,
  },
];

export const seedStatusHistories = [
  {
    id: 'hist-1',
    entityType: 'complaint',
    entityId: 'cmp-1',
    fromStatus: STATUSES.PENDING,
    toStatus: STATUSES.IN_PROGRESS,
    note: 'Assigned to Public Utilities department',
    changedBy: 'user-admin-1',
    changedAt: now,
  },
];

export const seedActivityLogs = [
  {
    id: 'log-1',
    userId: 'user-admin-1',
    action: 'assign_complaint',
    entityType: 'complaint',
    entityId: 'cmp-1',
    details: 'Assigned CMP-2025-0001 to Public Utilities',
    createdAt: now,
  },
];

export function getInitialState() {
  return {
    users: seedUsers,
    departments: seedDepartments,
    complaints: seedComplaints,
    serviceRequests: seedServiceRequests,
    notifications: seedNotifications,
    statusHistories: seedStatusHistories,
    activityLogs: seedActivityLogs,
    currentUserId: null,
  };
}
