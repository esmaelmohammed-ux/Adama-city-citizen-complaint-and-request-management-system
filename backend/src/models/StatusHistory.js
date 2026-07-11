import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  entityType: { type: String, enum: ['complaint', 'serviceRequest'], required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  fromStatus: { type: String, default: null },
  toStatus: { type: String, required: true },
  note: { type: String, default: '' },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
});

statusHistorySchema.index({ entityType: 1, entityId: 1 });

export default mongoose.model('StatusHistory', statusHistorySchema);
