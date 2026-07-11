import mongoose from 'mongoose';
import { COMPLAINT_CATEGORIES, STATUS_LIST } from '../constants/index.js';

const complaintSchema = new mongoose.Schema(
  {
    referenceId: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: STATUS_LIST, default: 'pending' },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    photoUrl: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' },
    resolutionNote: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

complaintSchema.index({ citizenId: 1 });
complaintSchema.index({ departmentId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });

export default mongoose.model('Complaint', complaintSchema);
