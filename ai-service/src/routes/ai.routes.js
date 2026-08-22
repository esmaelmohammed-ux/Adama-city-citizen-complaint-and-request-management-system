import { Router } from 'express';
import {
  categorizeSubmission,
  improveSubmission,
  draftResolution,
  chatAssistant,
  buildTriagePack,
} from '../services/llm.js';
import { findSimilarCases } from '../services/similar.js';
import {
  CATEGORY_LABELS,
  COMPLAINT_CATEGORIES,
  DEPARTMENTS,
} from '../constants.js';
import { resolveEffectiveProvider } from '../config.js';

const router = Router();

function requireText(body) {
  const { title, description, message } = body || {};
  return Boolean((description && String(description).trim()) || (title && String(title).trim()) || (message && String(message).trim()));
}

router.get('/meta', (_req, res) => {
  res.json({
    provider: resolveEffectiveProvider(),
    features: [
      'citizen-assist',
      'admin-triage',
      'officer-resolution',
      'chatbot',
      'voice-input',
      'similar-cases',
    ],
    categories: COMPLAINT_CATEGORIES.map((id) => ({ id, label: CATEGORY_LABELS[id] })),
    departments: DEPARTMENTS,
  });
});

router.post('/categorize', async (req, res, next) => {
  try {
    const { title, description, location, type } = req.body || {};
    if (!requireText(req.body)) {
      return res.status(400).json({ error: 'Provide at least a title or description' });
    }
    res.json(await categorizeSubmission({ title, description, location, type }));
  } catch (err) {
    next(err);
  }
});

router.post('/improve', async (req, res, next) => {
  try {
    const { title, description, location, type } = req.body || {};
    if (!requireText(req.body)) {
      return res.status(400).json({ error: 'Provide at least a title or description' });
    }
    res.json(await improveSubmission({ title, description, location, type }));
  } catch (err) {
    next(err);
  }
});

router.post('/similar', async (req, res, next) => {
  try {
    const { title, description, location, type, limit } = req.body || {};
    if (!requireText(req.body)) {
      return res.status(400).json({ error: 'Provide at least a title or description' });
    }
    res.json(
      await findSimilarCases({
        title,
        description,
        location,
        type,
        limit: Math.min(Number(limit) || 5, 10),
      })
    );
  } catch (err) {
    next(err);
  }
});

router.post('/assist', async (req, res, next) => {
  try {
    const { title, description, location, type } = req.body || {};
    if (!requireText(req.body)) {
      return res.status(400).json({ error: 'Provide at least a title or description' });
    }
    const [improved, classification, similar] = await Promise.all([
      improveSubmission({ title, description, location, type }),
      categorizeSubmission({ title, description, location, type }),
      findSimilarCases({ title, description, location, type, limit: 5 }),
    ]);
    res.json({ improved, classification, similar });
  } catch (err) {
    next(err);
  }
});

/** Admin: routing + priority + duplicates + action list */
router.post('/triage', async (req, res, next) => {
  try {
    const { title, description, location, type } = req.body || {};
    if (!requireText(req.body)) {
      return res.status(400).json({ error: 'Provide at least a title or description' });
    }
    res.json(await buildTriagePack({ title, description, location, type }));
  } catch (err) {
    next(err);
  }
});

/** Officer: resolution note / citizen update draft */
router.post('/resolution', async (req, res, next) => {
  try {
    const { title, description, location, category, actionTaken, outcome } = req.body || {};
    if (!requireText(req.body) && !actionTaken) {
      return res.status(400).json({ error: 'Provide case details or action taken' });
    }
    res.json(
      await draftResolution({ title, description, location, category, actionTaken, outcome })
    );
  } catch (err) {
    next(err);
  }
});

/** FAQ chatbot */
router.post('/chat', async (req, res, next) => {
  try {
    const { message, history } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Provide a message' });
    }
    res.json(await chatAssistant(String(message), Array.isArray(history) ? history : []));
  } catch (err) {
    next(err);
  }
});

export default router;
