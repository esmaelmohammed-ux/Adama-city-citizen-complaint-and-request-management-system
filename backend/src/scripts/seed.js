import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { ROLES, STATUSES } from '../constants/index.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Notification from '../models/Notification.js';
import StatusHistory from '../models/StatusHistory.js';
import ActivityLog from '../models/ActivityLog.js';

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Complaint.deleteMany({}),
    ServiceRequest.deleteMany({}),
    Notification.deleteMany({}),
    StatusHistory.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  const passwordHash = async (pw) => bcrypt.hash(pw, 12);

  const departments = await Department.insertMany([
    { name: 'Roads & Infrastructure', description: 'Road maintenance and drainage', isActive: true },
    { name: 'Water Supply', description: 'Water services and connections', isActive: true },
    { name: 'Sanitation', description: 'Waste collection and cleaning', isActive: true },
    { name: 'Public Utilities', description: 'Street lighting and utilities', isActive: true },
  ]);

  const [roads, water, sanitation, utilities] = departments;

  const citizen = await User.create({
    fullName: 'Abebe Kebede',
    email: 'citizen@test.com',
    passwordHash: await passwordHash('citizen123'),
    role: ROLES.CITIZEN,
    phoneNumber: '+251911000001',
    isActive: true,
  });

  const admin = await User.create({
    fullName: 'Selam Tadesse',
    email: 'admin@test.com',
    passwordHash: await passwordHash('admin123'),
    role: ROLES.ADMIN,
    phoneNumber: '+251911000002',
    isActive: true,
  });

  const officer = await User.create({
    fullName: 'Dawit Hailu',
    email: 'officer@test.com',
    passwordHash: await passwordHash('officer123'),
    role: ROLES.OFFICER,
    phoneNumber: '+251911000003',
    departmentId: water._id,
    isActive: true,
  });

  const yesterday = new Date(Date.now() - 86400000);
  const now = new Date();

  const complaint1 = await Complaint.create({
    referenceId: 'CMP-2026-0001',
    title: 'Broken streetlight on Main Road',
    description: 'The streetlight near Adama Stadium has been out for two weeks.',
    category: 'streetLighting',
    location: 'Main Road, near Adama Stadium',
    status: STATUSES.IN_PROGRESS,
    citizenId: citizen._id,
    departmentId: utilities._id,
    createdAt: yesterday,
    updatedAt: now,
  });

  await Complaint.create({
    referenceId: 'CMP-2026-0002',
    title: 'Water leak on Bole Road',
    description: 'Continuous water leak causing road damage.',
    category: 'waterSupply',
    location: 'Bole Road, Kebele 05',
    status: STATUSES.PENDING,
    citizenId: citizen._id,
    createdAt: now,
    updatedAt: now,
  });

  await ServiceRequest.create({
    referenceId: 'SRV-2026-0001',
    serviceType: 'Waste Collection Request',
    description: 'Need additional waste bin for residential block.',
    location: 'Kebele 03, Adama',
    status: STATUSES.RESOLVED,
    citizenId: citizen._id,
    departmentId: sanitation._id,
    resolutionNote: 'Waste bin delivered and installed.',
    createdAt: yesterday,
    updatedAt: now,
    resolvedAt: now,
  });

  await Notification.create({
    userId: citizen._id,
    title: 'Complaint In Progress',
    message: 'Your complaint CMP-2026-0001 has been assigned to Public Utilities.',
    relatedEntityType: 'complaint',
    relatedEntityId: complaint1._id,
    isRead: false,
    createdAt: now,
  });

  await StatusHistory.create({
    entityType: 'complaint',
    entityId: complaint1._id,
    fromStatus: STATUSES.PENDING,
    toStatus: STATUSES.IN_PROGRESS,
    note: 'Assigned to Public Utilities department',
    changedBy: admin._id,
    changedAt: now,
  });

  await ActivityLog.create({
    userId: admin._id,
    action: 'assign_complaint',
    entityType: 'complaint',
    entityId: complaint1._id,
    details: 'Assigned CMP-2026-0001 to Public Utilities',
    createdAt: now,
  });

  console.log('Database seeded successfully.');
  console.log('Demo accounts:');
  console.log('  citizen@test.com / citizen123');
  console.log('  admin@test.com / admin123');
  console.log('  officer@test.com / officer123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
