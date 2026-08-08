import mongoose from 'mongoose';
import { config } from '../config.js';

let connected = false;

const complaintSchema = new mongoose.Schema(
  {
    referenceId: String,
    title: String,
    description: String,
    category: String,
    location: String,
    status: String,
  },
  { collection: 'complaints', strict: false }
);

const serviceSchema = new mongoose.Schema(
  {
    referenceId: String,
    serviceType: String,
    description: String,
    location: String,
    status: String,
  },
  { collection: 'servicerequests', strict: false }
);

let Complaint;
let ServiceRequest;

export async function connectDbOptional() {
  if (!config.mongoUri) {
    console.log('[ai] MongoDB not configured — similar-case search disabled');
    return false;
  }
  try {
    await mongoose.connect(config.mongoUri);
    Complaint = mongoose.models.AiComplaint || mongoose.model('AiComplaint', complaintSchema);
    ServiceRequest =
      mongoose.models.AiServiceRequest || mongoose.model('AiServiceRequest', serviceSchema);
    connected = true;
    console.log('[ai] MongoDB connected (read-only similar cases)');
    return true;
  } catch (err) {
    console.warn('[ai] MongoDB connect failed:', err.message);
    connected = false;
    return false;
  }
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9\u1200-\u137F]+/i)
    .filter((t) => t.length > 2);
}

function overlapScore(queryTokens, docText) {
  if (!queryTokens.length) return 0;
  const docTokens = new Set(tokenize(docText));
  let hits = 0;
  for (const t of queryTokens) {
    if (docTokens.has(t)) hits += 1;
  }
  return hits / queryTokens.length;
}

export async function findSimilarCases({ title = '', description = '', location = '', type = 'complaint', limit = 5 }) {
  if (!connected) {
    return { enabled: false, items: [], message: 'MongoDB not connected. Set MONGODB_URI in ai-service/.env' };
  }

  const queryTokens = tokenize(`${title} ${description} ${location}`);
  const Model = type === 'service' ? ServiceRequest : Complaint;
  const docs = await Model.find({})
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const scored = docs
    .map((doc) => {
      const blob =
        type === 'service'
          ? `${doc.serviceType || ''} ${doc.description || ''} ${doc.location || ''}`
          : `${doc.title || ''} ${doc.description || ''} ${doc.location || ''} ${doc.category || ''}`;
      return {
        referenceId: doc.referenceId,
        title: type === 'service' ? doc.serviceType : doc.title,
        description: doc.description,
        location: doc.location,
        status: doc.status,
        category: doc.category || null,
        score: Number(overlapScore(queryTokens, blob).toFixed(3)),
      };
    })
    .filter((d) => d.score >= 0.15)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return { enabled: true, items: scored, message: scored.length ? null : 'No similar open cases found' };
}
