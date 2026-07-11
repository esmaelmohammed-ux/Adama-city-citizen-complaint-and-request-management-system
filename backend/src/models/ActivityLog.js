import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entityType: { type: String, default: '' },
  entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  details: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

activityLogSchema.index({ createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
