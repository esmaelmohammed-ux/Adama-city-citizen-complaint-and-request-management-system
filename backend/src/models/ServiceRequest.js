import mongoose from 'mongoose';
import { SERVICE_TYPES, STATUS_LIST } from '../constants/index.js';

const serviceRequestSchema = new mongoose.Schema(
  {
    referenceId: { type: String, required: true, unique: true },
    serviceType: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: '' },
    status: { type: String, enum: STATUS_LIST, default: 'pending' },
    citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolutionNote: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ citizenId: 1 });
serviceRequestSchema.index({ departmentId: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ createdAt: -1 });

export default mongoose.model('ServiceRequest', serviceRequestSchema);
